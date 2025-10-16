import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log(`Regenerating meal schedule for user ${userId}`);

    // Get available meals
    const { data: meals, error: mealsError } = await supabase
      .from("meals")
      .select("*");

    if (mealsError) {
      console.error("Error fetching meals:", mealsError);
      return NextResponse.json(
        { error: "Failed to fetch meals" },
        { status: 500 }
      );
    }

    if (!meals || meals.length === 0) {
      return NextResponse.json(
        { error: "No meals available" },
        { status: 404 }
      );
    }

    // Debug: Check what meal categories are available
    const availableCategories = [...new Set(meals.map(meal => meal.category))];
    console.log('Available meal categories:', availableCategories);

    // Create schedule with all categories
    const schedule = {
      plan: "Weekly Plan",
      weeks: []
    };

    // Generate one week with all meal categories
    const week = {
      weekNumber: 1,
      days: {}
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      week.days[day] = {};
      
      // Add meals for each category
      const categories = ['breakfast', 'lunch', 'dinner', 'snacks'];
      categories.forEach((category) => {
        // Find a meal for this category
        const categoryMeals = meals.filter(meal => meal.category === category);
        if (categoryMeals.length > 0) {
          const randomMeal = categoryMeals[Math.floor(Math.random() * categoryMeals.length)];
          week.days[day][category] = {
            ...randomMeal,
            meal_type: category,
            meal_name: randomMeal.name
          };
          console.log(`Added ${category} meal for ${day}:`, randomMeal.name);
        } else {
          console.log(`No ${category} meals found in database`);
        }
      });
    });

    schedule.weeks.push(week);

    // Save to database (replace existing)
    const { data: savedSchedule, error: saveError } = await supabase
      .from("meal_schedules")
      .upsert({
        user_id: userId,
        schedule_data: schedule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (saveError) {
      console.error("Error saving meal schedule:", saveError);
      return NextResponse.json(
        { error: "Failed to save meal schedule" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: schedule,
      message: "Meal schedule regenerated successfully with all categories"
    });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
