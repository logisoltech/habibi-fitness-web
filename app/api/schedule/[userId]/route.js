import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET(req, { params }) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch meal schedule from meal_schedules table
    const { data: mealSchedule, error } = await supabase
      .from("meal_schedules")
      .select("schedule_data")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch meal schedule" },
        { status: 500 }
      );
    }

    if (!mealSchedule || mealSchedule.length === 0) {
      return NextResponse.json(
        { success: false, message: "No meal schedule found for this user" },
        { status: 404 }
      );
    }

    // Parse the schedule_data JSON
    const scheduleData = mealSchedule[0].schedule_data;

    return NextResponse.json({
      success: true,
      data: scheduleData,
      message: "Meal schedule retrieved successfully"
    });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
