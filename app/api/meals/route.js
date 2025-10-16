import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const dietaryTags = searchParams.get("dietary_tags");
    const limit = parseInt(searchParams.get("limit")) || 8;
    const offset = parseInt(searchParams.get("offset")) || 0;

    if (dietaryTags && dietaryTags.includes(",")) {
      return NextResponse.json(
        { error: "Only one dietary tag is allowed at a time" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("meals")
      .select("*")
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (dietaryTags) {
      const trimmedTag = dietaryTags.trim();
      query = query.contains("dietary_tags", [trimmedTag]);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: meals, error: mealsError } = await query;

    if (mealsError) {
      console.error("Database error:", mealsError);
      return NextResponse.json(
        { error: `Failed to fetch meals: ${mealsError.message}` },
        { status: 500 }
      );
    }

    console.log("Meals fetched successfully:", meals?.length || 0, "meals");

    // Count from the same table for consistency
    let countQuery = supabase
      .from("meals")
      .select("*", { count: "exact", head: true });

    if (category) {
      countQuery = countQuery.eq("category", category);
    }

    if (dietaryTags) {
      const trimmedTag = dietaryTags.trim();
      countQuery = countQuery.contains("dietary_tags", [trimmedTag]);
    }

    const { count, error: countError } = await countQuery;
    if (countError) {
      console.error("Count error:", countError);
    }

    return NextResponse.json({
      message: "Meals fetched successfully",
      data: meals,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: offset + limit < (count || 0),
      },
      filters: {
        category: category || null,
        dietary_tags: dietaryTags ? dietaryTags.trim() : null,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
