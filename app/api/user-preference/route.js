import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "../../lib/supabase";

const userPreferenceSchema = z.object({
  user_id: z.string().uuid("Invalid user ID format"),
  meal_plan: z.string().min(1, "Meal plan is required"),
  meal_count: z.number().int().min(2, "Meal count must be at least 2"),
  meals: z.string().min(2, "Meals selection must be at least 2"),
  days: z.array(z.string()).min(5, "Days selection must be at least 5"),
  payment_cycle: z.string().min(1, "Payment cycle is required"),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = userPreferenceSchema.parse(body);
    const { data, error } = await supabase
      .from('user_preference')
      .insert([
        {
          user_id: parsed.user_id,
          meal_plan: parsed.meal_plan,
          meal_count: parsed.meal_count,
          meals: parsed.meals,
          days: parsed.days,
          payment_cycle: parsed.payment_cycle,
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({
      message: "User preferences saved successfully",
      data: data[0],
    }, { status: 201 });

  } catch (err) {
    console.error("User preference save error:", err);
    
    if (err.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }, 
        { status: 400 }
      );
    }
    
    if (err.code === '23505') {
      return NextResponse.json(
        { error: "User preferences already exist for this user" }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: err.message || "Failed to save user preferences" }, 
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" }, 
        { status: 400 }
      );
    }

    // Get user preference data from the database
    const { data, error } = await supabase
      .from('user_preference')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return NextResponse.json(
          { error: "User preferences not found" }, 
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      message: "User preferences retrieved successfully",
      data: data,
    });

  } catch (err) {
    console.error("User preference retrieval error:", err);
    
    return NextResponse.json(
      { error: err.message || "Failed to retrieve user preferences" }, 
      { status: 500 }
    );
  }
}
