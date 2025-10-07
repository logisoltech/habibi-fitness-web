const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to populate user_meals table with individual meal assignments
async function populateUserMeals(userId, schedule, supabase) {
  try {
    const mealAssignments = [];
    const startDate = new Date();
    
    schedule.weeks.forEach((week, weekIndex) => {
      Object.keys(week.days).forEach(dayKey => {
        const day = week.days[dayKey];
        const dayNumber = parseInt(dayKey);
        const mealDate = new Date(startDate);
        mealDate.setDate(startDate.getDate() + (weekIndex * 7) + dayNumber);
        
        // Add each meal for this day
        Object.keys(day).forEach(mealType => {
          const meal = day[mealType];
          if (meal && meal.id) {
            mealAssignments.push({
              user_id: userId,
              meal_id: meal.id,
              meal_date: mealDate.toISOString().split('T')[0], // YYYY-MM-DD format
              meal_type: mealType,
              portion_size: 1, // Default portion size
              created_at: new Date().toISOString()
            });
          }
        });
      });
    });
    
    if (mealAssignments.length > 0) {
      // Clear existing meals for this user first
      await supabase
        .from('user_meals')
        .delete()
        .eq('user_id', userId);
      
      // Insert new meal assignments
      const { error: insertError } = await supabase
        .from('user_meals')
        .insert(mealAssignments);
      
      if (insertError) {
        console.error('Error populating user_meals:', insertError);
      } else {
        console.log(`Successfully populated ${mealAssignments.length} meal assignments for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('Error in populateUserMeals:', error);
  }
}

// Routes

// Get all meals
app.get('/api/meals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('meals')
      .select('*');

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data,
      message: 'Meals fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch meals'
    });
  }
});

// Get meal by ID
app.get('/api/meals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    res.json({
      success: true,
      data: data,
      message: 'Meal fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching meal:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch meal'
    });
  }
});

// Create new meal
app.post('/api/meals', async (req, res) => {
  try {
    const mealData = req.body;
    
    const { data, error } = await supabase
      .from('meals')
      .insert([mealData])
      .select();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Meal created successfully'
    });
  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create meal'
    });
  }
});

// Update meal
app.put('/api/meals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const { data, error } = await supabase
      .from('meals')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    res.json({
      success: true,
      data: data[0],
      message: 'Meal updated successfully'
    });
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to update meal'
    });
  }
});

// Delete meal
app.delete('/api/meals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to delete meal'
    });
  }
});

// Users API endpoints

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data,
      message: 'Users fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch users'
    });
  }
});

// Create new user (registration)
app.post('/api/users', async (req, res) => {
  try {
    console.log('Received user registration request:', req.body);
    const userData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'phone', 'plan', 'goal', 'weight', 'height', 'gender'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Convert mealtypes array to JSON string if it exists
    if (userData.mealtypes && Array.isArray(userData.mealtypes)) {
      userData.mealtypes = JSON.stringify(userData.mealtypes);
    }
    
    console.log('Attempting to insert user data:', userData);
    
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('User created successfully:', data);

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to register user'
    });
  }
});

// Get user by phone number
app.get('/api/users/phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: data,
      message: 'User found successfully'
    });
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to find user'
    });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: data[0],
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to update user'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to verify server is loading changes
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working - server updated!',
    timestamp: new Date().toISOString()
  });
});

// Get all meals with full details for data analysis
app.get('/api/totalmeals', async (req, res) => {
  try {
    console.log('Fetching all meals data...');
    
    const { data, error } = await supabase
      .from('meals')
      .select('*');

    if (error) {
      throw error;
    }

    console.log(`Found ${data.length} meals in database`);

    res.json({
      success: true,
      data: data,
      count: data.length,
      message: 'All meals data fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching total meals:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch total meals data'
    });
  }
});

// Get recommended meals based on user's plan and goal
app.get('/api/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching recommendations for user: ${userId}`);
    
    // First, get user's plan and goal
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('plan, goal')
      .eq('id', userId)
      .single();

    if (userError) {
      throw userError;
    }

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { plan, goal } = userData;
    console.log(`User plan: ${plan}, goal: ${goal}`);

    // Get all meals that match the user's dietary plan
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*');

    if (mealsError) {
      throw mealsError;
    }

    // Filter meals based on dietary tags matching the plan
    const filteredMeals = meals.filter(meal => {
      if (!meal.dietary_tags || !Array.isArray(meal.dietary_tags)) return false;
      
      // Convert plan names to match dietary tags
      const planMapping = {
        'Balanced': ['High Protein', 'Gluten-Free'],
        'Low Carb': ['Low Carb'],
        'Protein Boost': ['High Protein'],
        'Vegetarian Kitchen': ['Vegetarian'],
        "Chef's Choice": ['High Protein', 'Low Carb', 'Keto'], // Mix of everything
        'Keto': ['Keto']
      };

      const targetTags = planMapping[plan] || [];
      return targetTags.some(tag => meal.dietary_tags.includes(tag));
    });

    // Group meals by category
    const categorizedMeals = {
      breakfast: filteredMeals.filter(meal => meal.category === 'breakfast'),
      lunch: filteredMeals.filter(meal => meal.category === 'lunch'),
      dinner: filteredMeals.filter(meal => meal.category === 'dinner'),
      snacks: filteredMeals.filter(meal => meal.category === 'snacks')
    };

    // Apply goal-based sorting within each category
    Object.keys(categorizedMeals).forEach(category => {
      categorizedMeals[category] = categorizedMeals[category].sort((a, b) => {
        switch (goal) {
          case 'Weight Loss':
            return a.calories - b.calories; // Lower calories first
          case 'Weight Gain':
            return b.calories - a.calories; // Higher calories first
          case 'Staying Fit':
            return b.protein - a.protein; // Higher protein first
          case 'Eating Healthy':
            return (b.fiber || 0) - (a.fiber || 0); // Higher fiber first
          case 'Keto Diet':
            return a.carbs - b.carbs; // Lower carbs first
          default:
            return b.protein - a.protein; // Default to protein
        }
      });
    });

    const totalRecommendations = Object.values(categorizedMeals).reduce((sum, arr) => sum + arr.length, 0);

    console.log(`Found ${totalRecommendations} recommended meals for user`);

    res.json({
      success: true,
      data: {
        user: {
          id: userId,
          plan: plan,
          goal: goal
        },
        recommendations: categorizedMeals,
        counts: {
          breakfast: categorizedMeals.breakfast.length,
          lunch: categorizedMeals.lunch.length,
          dinner: categorizedMeals.dinner.length,
          snacks: categorizedMeals.snacks.length,
          total: totalRecommendations
        }
      },
      message: `Found ${totalRecommendations} personalized meal recommendations`
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch meal recommendations'
    });
  }
});

// Test meal scheduler
app.get('/api/schedule/test', async (req, res) => {
  try {
    console.log('Testing meal scheduler...');
    
    // Get a sample user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (userError || !users || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users found in database'
      });
    }
    
    // Get meals
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*');
    
    if (mealsError || !meals || meals.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No meals found in database'
      });
    }
    
    // Test meal scheduler
    const MealScheduler = require('./app/services/mealScheduler');
    const scheduler = new MealScheduler();
    
    const testSchedule = scheduler.generateMealSchedule(users[0], meals, 1);
    
    res.json({
      success: true,
      message: 'Meal scheduler test successful',
      data: {
        user: users[0],
        mealsCount: meals.length,
        scheduleWeeks: testSchedule.weeks?.length || 0,
        totalMeals: testSchedule.totalMeals
      }
    });
    
  } catch (error) {
    console.error('Meal scheduler test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Meal scheduler test failed',
      error: error.message
    });
  }
});

// Generate meal schedule for user
app.post('/api/schedule/generate', async (req, res) => {
  try {
    const { userId, weeks = 4 } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Parse mealtypes from JSON string if it exists
    console.log('Original userData.mealtypes:', userData.mealtypes, 'Type:', typeof userData.mealtypes);
    
    if (userData.mealtypes && typeof userData.mealtypes === 'string') {
      try {
        userData.mealtypes = JSON.parse(userData.mealtypes);
        console.log('Parsed mealtypes:', userData.mealtypes);
      } catch (parseError) {
        console.error('Error parsing mealtypes:', parseError);
        userData.mealtypes = ['lunch', 'dinner']; // fallback
        console.log('Using fallback mealtypes:', userData.mealtypes);
      }
    } else if (!userData.mealtypes) {
      userData.mealtypes = ['lunch', 'dinner']; // fallback
      console.log('No mealtypes found, using fallback:', userData.mealtypes);
    }

    console.log('Final userData.mealtypes:', userData.mealtypes, 'Type:', typeof userData.mealtypes);
    console.log('User data after parsing:', userData);

    // Get all meals
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*');

    if (mealsError) {
      console.error('Error fetching meals:', mealsError);
      throw mealsError;
    }

    console.log('Fetched meals count:', meals?.length || 0);
    
    // Parse dietary_tags if it's stored as JSON string
    if (meals && meals.length > 0) {
      meals.forEach(meal => {
        // Parse dietary_tags if it's a string
        if (meal.dietary_tags && typeof meal.dietary_tags === 'string') {
          try {
            meal.dietary_tags = JSON.parse(meal.dietary_tags);
          } catch (e) {
            console.error(`Error parsing dietary_tags for meal ${meal.id}:`, e);
            meal.dietary_tags = [];
          }
        }
        
        // Parse ingredients if it's a string
        if (meal.ingredients && typeof meal.ingredients === 'string') {
          try {
            meal.ingredients = JSON.parse(meal.ingredients);
          } catch (e) {
            console.error(`Error parsing ingredients for meal ${meal.id}:`, e);
            meal.ingredients = [];
          }
        }
        
        // Convert rating to number if it's a string
        if (meal.rating && typeof meal.rating === 'string') {
          meal.rating = parseFloat(meal.rating) || 3;
        }
        
        // Convert price to number if it's a string
        if (meal.price && typeof meal.price === 'string') {
          meal.price = parseFloat(meal.price) || 9.99;
        }
      });
      
      console.log('Sample meal structure:', {
        id: meals[0].id,
        name: meals[0].name,
        category: meals[0].category,
        rating: meals[0].rating,
        price: meals[0].price,
        dietary_tags: meals[0].dietary_tags,
        dietary_tags_type: typeof meals[0].dietary_tags
      });
    }

    // Import and use meal scheduler
    const MealScheduler = require('./app/services/mealScheduler');
    const scheduler = new MealScheduler();
    
    // Generate schedule
    console.log('Generating schedule for user:', userData.id, 'with', meals?.length || 0, 'meals');
    
    if (!meals || meals.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No meals available in database. Please add some meals first.'
      });
    }
    
    let schedule;
    try {
      console.log('=== CALLING MEAL SCHEDULER ===');
      console.log('User data:', userData);
      console.log('Meals count:', meals?.length || 0);
      console.log('Weeks:', weeks);
      
      schedule = scheduler.generateMealSchedule(userData, meals, weeks);
      
      console.log('=== MEAL SCHEDULER COMPLETED ===');
      console.log('Generated schedule successfully');
      console.log('Schedule weeks:', schedule.weeks?.length || 0);
      console.log('First week days:', Object.keys(schedule.weeks?.[0]?.days || {}));
      console.log('First week total meals:', schedule.weeks?.[0]?.totalMeals || 0);
    } catch (schedulerError) {
      console.error('=== MEAL SCHEDULER ERROR ===');
      console.error('Error in meal scheduler:', schedulerError);
      console.error('Error stack:', schedulerError.stack);
      throw new Error(`Meal scheduler failed: ${schedulerError.message}`);
    }

    // Save schedule to database (optional - don't fail if table doesn't exist yet)
    try {
      const { data: savedSchedule, error: saveError } = await supabase
        .from('meal_schedules')
        .insert([{
          user_id: userId,
          subscription: userData.subscription,
          schedule_data: schedule,
          weeks: weeks,
          created_at: new Date().toISOString()
        }])
        .select();

      if (saveError) {
        console.error('Error saving schedule:', saveError);
        // Still return the schedule even if saving fails
      } else {
        // Also populate user_meals table with individual meal assignments
        await populateUserMeals(userId, schedule, supabase);
      }
    } catch (dbError) {
      console.error('Database error (table might not exist yet):', dbError);
      // Continue without saving to database
    }

    res.json({
      success: true,
      data: schedule,
      message: 'Meal schedule generated successfully'
    });

  } catch (error) {
    console.error('Error generating meal schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to generate meal schedule'
    });
  }
});

// Get user's meal schedule
app.get('/api/schedule/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { week } = req.query;

    let query = supabase
      .from('meal_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (week) {
      query = query.eq('weeks', parseInt(week));
    }

    const { data: schedules, error } = await query;

    if (error) {
      throw error;
    }

    if (!schedules || schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No meal schedule found for this user'
      });
    }

    res.json({
      success: true,
      data: schedules[0].schedule_data,
      message: 'Meal schedule retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching meal schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch meal schedule'
    });
  }
});

// Get specific week's meals
app.get('/api/schedule/:userId/week/:weekNumber', async (req, res) => {
  try {
    const { userId, weekNumber } = req.params;

    const { data: schedule, error } = await supabase
      .from('meal_schedules')
      .select('schedule_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !schedule) {
      return res.status(404).json({
        success: false,
        message: 'No meal schedule found for this user'
      });
    }

    const weekData = schedule.schedule_data.weeks[parseInt(weekNumber) - 1];
    
    if (!weekData) {
      return res.status(404).json({
        success: false,
        message: `Week ${weekNumber} not found in schedule`
      });
    }

    res.json({
      success: true,
      data: weekData,
      message: `Week ${weekNumber} meals retrieved successfully`
    });

  } catch (error) {
    console.error('Error fetching week meals:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch week meals'
    });
  }
});

// Update meal schedule
app.put('/api/schedule/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all meals
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*');

    if (mealsError) {
      throw mealsError;
    }

    // Import and use meal scheduler
    const MealScheduler = require('./app/services/mealScheduler');
    const scheduler = new MealScheduler();
    
    // Generate new schedule
    const schedule = scheduler.generateMealSchedule(userData, meals, 4);

    // Update schedule in database
    const { data: updatedSchedule, error: updateError } = await supabase
      .from('meal_schedules')
      .update({
        schedule_data: schedule,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .select();

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      data: schedule,
      message: 'Meal schedule updated successfully'
    });

  } catch (error) {
    console.error('Error updating meal schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to update meal schedule'
    });
  }
});

// Swap meals in schedule
app.post('/api/schedule/swap-meals', async (req, res) => {
  try {
    const { 
      userId, 
      sourceMeal,  // { weekIndex, dayKey, mealKey, mealId }
      targetMeal   // { weekIndex, dayKey, mealKey, mealId }
    } = req.body;

    if (!userId || !sourceMeal || !targetMeal) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: userId, sourceMeal, targetMeal'
      });
    }

    console.log('Swapping meals for user:', userId);
    console.log('Source:', sourceMeal);
    console.log('Target:', targetMeal);

    // Get user's current schedule
    const { data: scheduleRecord, error: fetchError } = await supabase
      .from('meal_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !scheduleRecord) {
      return res.status(404).json({
        success: false,
        message: 'No meal schedule found for this user'
      });
    }

    // Clone the schedule data to modify it
    const scheduleData = JSON.parse(JSON.stringify(scheduleRecord.schedule_data));

    // Validate that the weeks and days exist
    if (!scheduleData.weeks[sourceMeal.weekIndex]?.days[sourceMeal.dayKey]) {
      return res.status(400).json({
        success: false,
        message: 'Source meal location not found in schedule'
      });
    }

    if (!scheduleData.weeks[targetMeal.weekIndex]?.days[targetMeal.dayKey]) {
      return res.status(400).json({
        success: false,
        message: 'Target meal location not found in schedule'
      });
    }

    // Get the meals to swap
    const sourceDay = scheduleData.weeks[sourceMeal.weekIndex].days[sourceMeal.dayKey];
    const targetDay = scheduleData.weeks[targetMeal.weekIndex].days[targetMeal.dayKey];

    // Perform the swap
    const tempMeal = sourceDay[sourceMeal.mealKey];
    sourceDay[sourceMeal.mealKey] = targetDay[targetMeal.mealKey];
    targetDay[targetMeal.mealKey] = tempMeal;

    console.log('Swap completed in schedule data');

    // Update the schedule in database
    const { data: updatedSchedule, error: updateError } = await supabase
      .from('meal_schedules')
      .update({
        schedule_data: scheduleData,
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleRecord.id)
      .select();

    if (updateError) {
      console.error('Error updating schedule:', updateError);
      throw updateError;
    }

    // Also update the user_meals table
    try {
      await populateUserMeals(userId, scheduleData, supabase);
      console.log('User meals table updated after swap');
    } catch (mealsError) {
      console.error('Error updating user_meals table:', mealsError);
      // Don't fail the request if user_meals update fails
    }

    res.json({
      success: true,
      data: scheduleData,
      message: 'Meals swapped successfully'
    });

  } catch (error) {
    console.error('Error swapping meals:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to swap meals'
    });
  }
});

// Get recommended meals by plan (without needing userId)
app.get('/api/recommendations/plan/:plan', async (req, res) => {
  try {
    const { plan } = req.params;
    const { goal } = req.query; // Optional goal parameter
    
    console.log(`Fetching recommendations for plan: ${plan}, goal: ${goal || 'none'}`);

    // Get all meals
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*');

    if (mealsError) {
      throw mealsError;
    }

    // Filter meals based on dietary tags matching the plan
    const filteredMeals = meals.filter(meal => {
      if (!meal.dietary_tags || !Array.isArray(meal.dietary_tags)) return false;
      
      // Convert plan names to match dietary tags
      const planMapping = {
        'Balanced': ['High Protein', 'Gluten-Free'],
        'Low Carb': ['Low Carb'],
        'Protein Boost': ['High Protein'],
        'Vegetarian Kitchen': ['Vegetarian'],
        "Chef's Choice": ['High Protein', 'Low Carb', 'Keto'],
        'Keto': ['Keto']
      };

      const targetTags = planMapping[plan] || [];
      return targetTags.some(tag => meal.dietary_tags.includes(tag));
    });

    // Group meals by category
    const categorizedMeals = {
      breakfast: filteredMeals.filter(meal => meal.category === 'breakfast'),
      lunch: filteredMeals.filter(meal => meal.category === 'lunch'),
      dinner: filteredMeals.filter(meal => meal.category === 'dinner'),
      snacks: filteredMeals.filter(meal => meal.category === 'snacks')
    };

    // Apply goal-based sorting if goal is provided
    if (goal) {
      Object.keys(categorizedMeals).forEach(category => {
        categorizedMeals[category] = categorizedMeals[category].sort((a, b) => {
          switch (goal) {
            case 'Weight Loss':
              return a.calories - b.calories;
            case 'Weight Gain':
              return b.calories - a.calories;
            case 'Staying Fit':
              return b.protein - a.protein;
            case 'Eating Healthy':
              return (b.fiber || 0) - (a.fiber || 0);
            case 'Keto Diet':
              return a.carbs - b.carbs;
            default:
              return b.protein - a.protein;
          }
        });
      });
    }

    const totalRecommendations = Object.values(categorizedMeals).reduce((sum, arr) => sum + arr.length, 0);

    res.json({
      success: true,
      data: {
        plan: plan,
        goal: goal || null,
        recommendations: categorizedMeals,
        counts: {
          breakfast: categorizedMeals.breakfast.length,
          lunch: categorizedMeals.lunch.length,
          dinner: categorizedMeals.dinner.length,
          snacks: categorizedMeals.snacks.length,
          total: totalRecommendations
        }
      },
      message: `Found ${totalRecommendations} personalized meal recommendations for ${plan} plan`
    });

  } catch (error) {
    console.error('Error fetching recommendations by plan:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch meal recommendations'
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`📱 Mobile access: http://192.168.18.28:${PORT}/api`);
});

module.exports = app;
