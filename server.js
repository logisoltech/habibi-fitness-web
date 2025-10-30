const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();


// Simple meal generation function (no external dependencies)
function generateSimpleMealSchedule(userData, availableMeals, weeks = 4) {
  try {
    console.log('=== SIMPLE MEAL GENERATION ===');
    console.log('User:', userData.id, 'Meals:', availableMeals?.length || 0);
    
    const schedule = {
      userId: userData.id || userData.userId,
      subscription: userData.subscription || 'monthly',
      plan: userData.plan || 'Monthly Plan',
      startDate: new Date(),
      weeks: [],
      totalMeals: 0,
      fiveStarMeals: 0,
      generatedAt: new Date().toISOString()
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    
    for (let week = 1; week <= weeks; week++) {
      const weekSchedule = {
        week: week,
        days: {},
        totalMeals: 0,
        fiveStarMeals: 0
      };
      
      days.forEach(day => {
        weekSchedule.days[day] = {};
        
        mealTypes.forEach(mealType => {
          const availableMealsForType = availableMeals.filter(meal => 
            meal.category === mealType || meal.category === mealType.toLowerCase()
          );
          
          if (availableMealsForType.length > 0) {
            const randomMeal = availableMealsForType[Math.floor(Math.random() * availableMealsForType.length)];
            weekSchedule.days[day][mealType] = randomMeal;
            weekSchedule.totalMeals++;
            
            if (randomMeal.rating >= 5) {
              weekSchedule.fiveStarMeals++;
            }
          }
        });
      });
      
      schedule.weeks.push(weekSchedule);
      schedule.totalMeals += weekSchedule.totalMeals;
      schedule.fiveStarMeals += weekSchedule.fiveStarMeals;
    }
    
    console.log('✅ Simple meal generation completed:', schedule.totalMeals, 'meals');
    return schedule;
  } catch (error) {
    console.error('❌ Simple meal generation failed:', error);
    throw error;
  }
}

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "https://habibi-fitness-web.vercel.app",
      "http://localhost:3000",
      "http://localhost:8081",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://192.168.1.100:3000", // Add your local IP if needed
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Environment check:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
console.log('PORT:', process.env.PORT || 10000);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables!');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Supabase client created successfully');

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
        console.log(`s`);
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
    const { category, dietary_tags, limit, offset } = req.query;
    
    let query = supabase
      .from('meals')
      .select('*');

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Apply dietary tags filter
    if (dietary_tags) {
      const trimmedTag = dietary_tags.trim();
      query = query.contains('dietary_tags', [trimmedTag]);
    }

    // Apply pagination
    const parsedLimit = parseInt(limit) || 8;
    const parsedOffset = parseInt(offset) || 0;
    
    if (limit || offset) {
      query = query.range(parsedOffset, parsedOffset + parsedLimit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('meals')
      .select('*', { count: 'exact', head: true });

    if (category) {
      countQuery = countQuery.eq('category', category);
    }

    if (dietary_tags) {
      const trimmedTag = dietary_tags.trim();
      countQuery = countQuery.contains('dietary_tags', [trimmedTag]);
    }

    const { count } = await countQuery;

    res.json({
      success: true,
      data: data,
      message: 'Meals fetched successfully',
      pagination: {
        total: count || 0,
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: parsedOffset + parsedLimit < (count || 0)
      },
      filters: {
        category: category || null,
        dietary_tags: dietary_tags ? dietary_tags.trim() : null
      }
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
    console.log('Received user registration request:');
    const userData = req.body;
    
    // Validate required fields - only phone and name are truly required
    const requiredFields = ['name', 'phone'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Set defaults for optional fields if missing
    userData.plan = userData.plan || 'Balanced';
    userData.goal = userData.goal || 'Staying Fit';
    userData.weight = userData.weight || '70';
    userData.height = userData.height || '170';
    userData.gender = userData.gender || 'Male';
    
    // Convert mealtypes array to JSON string if it exists
    if (userData.mealtypes && Array.isArray(userData.mealtypes)) {
      userData.mealtypes = JSON.stringify(userData.mealtypes);
    }
    
    console.log('s');
    
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('s');

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

// Search users by name or phone (must be before /:id route)
app.get('/api/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${q}%,phone.ilike.%${q}%`);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data || [],
      message: `Found ${data?.length || 0} users`
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to search users'
    });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
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

// Save/Update Expo Push Token
app.put('/api/users/:id/push-token', async (req, res) => {
  try {
    const { id } = req.params;
    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({
        success: false,
        message: 'Push token is required'
      });
    }

    console.log(`Saving push token for user ${id}:`, pushToken);

    const { data, error } = await supabase
      .from('users')
      .update({ push_token: pushToken, push_token_updated_at: new Date().toISOString() })
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
      message: 'Push token saved successfully'
    });
  } catch (error) {
    console.error('Error saving push token:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to save push token'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    cors: 'CORS enabled for localhost:3000'
  });
});

// Test endpoint to trigger meal generation (for debugging)
app.get('/api/test-generate/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`🧪 Test meal generation for user: ${userId}`);
    
    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: userError?.message
      });
    }
    
    // Get meals
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*');
    
    if (mealsError || !meals || meals.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No meals available',
        error: mealsError?.message
      });
    }
    
    // Generate meal schedule using inline function (no external dependencies)
    const schedule = generateSimpleMealSchedule(user, meals, 4);
    
    // Save to database
    const { data: savedSchedule, error: saveError } = await supabase
      .from('meal_schedules')
      .upsert({
        user_id: userId,
        subscription: user.subscription || 'monthly',
        schedule_data: schedule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (saveError) {
      console.error('Save error:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save schedule',
        error: saveError.message
      });
    }
    
    res.json({
      success: true,
      message: 'Meal schedule generated and saved successfully',
      schedule: schedule
    });
    
  } catch (error) {
    console.error('Test generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Test generation failed',
      error: error.message
    });
  }
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working - server updated with timezone fixes!',
    origin: req.get('Origin') || 'No origin header',
    timestamp: new Date().toISOString(),
    timezone: 'Asia/Karachi (UTC+5)'
  });
});

// Debug endpoint to test date calculation
app.get('/api/debug-date/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    
    console.log('🔍 DEBUG: Testing date calculation for user:', userId, 'date:', date);
    
    // Get user's meal schedule
    const { data: schedule, error } = await supabase
      .from('meal_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !schedule) {
      return res.json({
        success: false,
        message: 'No schedule found',
        error: error?.message
      });
    }

    const startDate = new Date(schedule.created_at);
    console.log('🔍 DEBUG: Schedule created at:', startDate.toISOString());
    
    // Calculate which week contains the requested date
    const requestedDate = new Date(date);
    const daysDiff = Math.floor((requestedDate - startDate) / (1000 * 60 * 60 * 24));
    const targetWeekIndex = Math.floor(daysDiff / 7);
    
    const debugInfo = {
      userId: userId,
      requestedDate: date,
      scheduleCreatedAt: startDate.toISOString(),
      daysDiff: daysDiff,
      targetWeekIndex: targetWeekIndex,
      totalWeeksInSchedule: schedule.schedule_data?.weeks?.length || 0,
      targetWeekExists: !!(schedule.schedule_data?.weeks?.[targetWeekIndex]),
      scheduleData: schedule.schedule_data,
      dateCalculations: []
    };

    if (schedule.schedule_data && schedule.schedule_data.weeks) {
      // Show all weeks for debugging
      schedule.schedule_data.weeks.forEach((week, weekIndex) => {
        if (week.days) {
          Object.keys(week.days).forEach(dayKey => {
            const day = week.days[dayKey];
            
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayIndex = dayNames.indexOf(dayKey.toLowerCase());
            if (dayIndex === -1) return;
            
            const mealDate = new Date(startDate);
            mealDate.setDate(startDate.getDate() + (weekIndex * 7) + (dayIndex - startDate.getDay()));
            
            // Use simple UTC+5 offset for Pakistan timezone
            const pakistanOffset = 5 * 60; // 5 hours in minutes
            const pakistanTime = new Date(mealDate.getTime() + (pakistanOffset * 60 * 1000));
            const mealDateStr = pakistanTime.toISOString().split('T')[0];
            
            debugInfo.dateCalculations.push({
              dayKey: dayKey,
              dayIndex: dayIndex,
              weekIndex: weekIndex,
              originalDate: mealDate.toISOString(),
              pakistanDate: mealDateStr,
              matchesRequested: mealDateStr === date,
              mealsInDay: Object.keys(day).length,
              isTargetWeek: weekIndex === targetWeekIndex
            });
          });
        }
      });
    }

    res.json({
      success: true,
      debug: debugInfo
    });

  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
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
    
    // Test meal scheduler using inline function
    const testSchedule = generateSimpleMealSchedule(users[0], meals, 1);
    
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
    if (userData.mealtypes && typeof userData.mealtypes === 'string') {
      try {
        userData.mealtypes = JSON.parse(userData.mealtypes);
      } catch (parseError) {
        userData.mealtypes = ['lunch', 'dinner']; // fallback
      }
    } else if (!userData.mealtypes) {
      userData.mealtypes = ['lunch', 'dinner']; // fallback
    }

    // Get all meals
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*');

    if (mealsError) {
      console.error('Error fetching meals:', mealsError);
      throw mealsError;
    }
    
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
    }

    // Generate schedule using inline function (no external dependencies)
    console.log('🔄 Generating schedule for user:', userData.id);
    console.log('🔄 Available meals count:', meals?.length || 0);
    console.log('🔄 Weeks to generate:', weeks);
    
    if (!meals || meals.length === 0) {
      console.error('❌ No meals available in database');
      return res.status(400).json({
        success: false,
        message: 'No meals available in database. Please add some meals first.'
      });
    }
    
    let schedule;
    try {
      console.log('🔄 Calling inline meal scheduler...');
      schedule = generateSimpleMealSchedule(userData, meals, weeks);
      console.log('✅ Meal schedule generated successfully');
      console.log('📋 Schedule structure:', {
        weeks: schedule.weeks?.length || 0,
        totalMeals: schedule.totalMeals || 0,
        fiveStarMeals: schedule.fiveStarMeals || 0
      });
    } catch (schedulerError) {
      console.error('❌ Meal scheduler error:', schedulerError);
      console.error('❌ Error stack:', schedulerError.stack);
      return res.status(500).json({
        success: false,
        message: `Meal scheduler failed: ${schedulerError.message}`,
        error: schedulerError.message
      });
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

    // Generate new schedule using inline function
    const schedule = generateSimpleMealSchedule(userData, meals, 4);

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

    console.log('Swapping meals for user:');
    console.log('Source:');
    console.log('Target:');

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
    
    console.log(`Fetching recommendations for plan`);

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

// ============================================
// NOTIFICATIONS ENDPOINTS
// ============================================

// Send notifications to users
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { title, message, target, userIds, type, priority, scheduledFor } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    console.log('Sending notification:', { title, target, type, priority });

    let targetUsers = [];

    // Get target users
    if (target === 'all') {
      // Get all users
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, phone');

      if (error) throw error;
      targetUsers = users || [];
    } else if (target === 'specific' && userIds && userIds.length > 0) {
      // Get specific users
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, phone')
        .in('id', userIds);

      if (error) throw error;
      targetUsers = users || [];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid target or no users specified'
      });
    }

    if (targetUsers.length === 0) {
      return res.json({
        success: true,
        message: 'No users found to send notifications to',
        data: {
          sentCount: 0,
          failedCount: 0,
          totalUsers: 0
        }
      });
    }

    // Create notification records
    const notifications = targetUsers.map(user => ({
      user_id: user.id,
      title: title,
      message: message,
      type: type || 'general',
      priority: priority || 'normal',
      read: false,
      created_at: new Date().toISOString(),
      scheduled_for: scheduledFor || null,
      sent_at: scheduledFor ? null : new Date().toISOString()
    }));

    // Save notifications to database
    const { data: savedNotifications, error: notifError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (notifError) {
      console.error('Error saving notifications:', notifError);
      // Don't fail completely if DB save fails
    }

    // TODO: Integrate with actual push notification service
    // Examples:
    // - Firebase Cloud Messaging (FCM)
    // - OneSignal
    // - Expo Push Notifications
    // - AWS SNS
    
    console.log(`✅ Notifications created for ${targetUsers.length} users`);

    // Simulate sending (in production, this would call FCM/OneSignal/etc)
    const sendResults = {
      sentCount: targetUsers.length,
      failedCount: 0,
      totalUsers: targetUsers.length
    };

    res.json({
      success: true,
      message: `Notification sent successfully to ${sendResults.sentCount} user(s)`,
      data: sendResults
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to send notification'
    });
  }
});

// Get notifications for a user
app.get('/api/notifications/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { unreadOnly } = req.query;

    console.log(`📬 Fetching notifications for user ${userId}, unreadOnly: ${unreadOnly}`);

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly === 'true') {
      query = query.eq('read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    const unreadCount = notifications?.filter(n => !n.read).length || 0;
    
    console.log(`✅ Found ${notifications?.length || 0} notifications (${unreadCount} unread)`);
    
    if (notifications && notifications.length > 0) {
      console.log('Sample notification:', notifications[0]);
    }

    res.json({
      success: true,
      data: notifications || [],
      unreadCount: unreadCount
    });

  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
app.put('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to mark notification as read'
    });
  }
});

// Get all notifications (for CMS)
app.get('/api/notifications/all', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*, users(name, phone)')
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) throw error;

    // Get stats
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      data: notifications || [],
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch notifications'
    });
  }
});

// ============================================
// MEAL DELIVERY STATUS TRACKING ENDPOINTS
// ============================================

// Update meal delivery status
app.post('/api/delivery-status/update', async (req, res) => {
  try {
    const { userId, mealId, status, date, mealKey, weekIndex, dayKey, notes } = req.body;

    // Validate required fields
    if (!userId || !mealId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, mealId, status'
      });
    }

    // Validate status value
    const validStatuses = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be one of: ' + validStatuses.join(', ')
      });
    }

    console.log('Updating meal status:', { userId, mealId, status, date, mealKey, weekIndex, dayKey });

    // Get the current schedule for the user
    const { data: scheduleRecord, error: fetchError } = await supabase
      .from('meal_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !scheduleRecord) {
      console.error('Fetch error:', fetchError);
      return res.status(404).json({
        success: false,
        message: 'No meal schedule found for this user'
      });
    }

    // Parse and update the schedule_data nested object
    const scheduleData = JSON.parse(JSON.stringify(scheduleRecord.schedule_data)); // Deep clone
    let mealUpdated = false;

    // Check if schedule_data has weeks structure
    if (!scheduleData || !scheduleData.weeks) {
      console.error('schedule_data missing weeks structure');
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule_data format'
      });
    }

    // Find and update the meal in the nested structure
    scheduleData.weeks.forEach((week, wIdx) => {
      if (week.days) {
        Object.keys(week.days).forEach(dKey => {
          const day = week.days[dKey];
          Object.keys(day).forEach(mKey => {
            const meal = day[mKey];
            if (meal && meal.id === mealId) {
              // Found the meal - update it
              console.log(`Found meal ${mealId} in week ${wIdx}, day ${dKey}, mealKey ${mKey}`);
              console.log(`Updating from ${meal.status || 'pending'} to ${status}`);
              
              meal.status = status;
              meal.status_updated_at = new Date().toISOString();
              if (notes) meal.delivery_notes = notes;
              if (status === 'delivered') meal.delivered_at = new Date().toISOString();
              
              mealUpdated = true;
            }
          });
        });
      }
    });

    if (!mealUpdated) {
      console.log('Meal not found. Looking for mealId:', mealId);
      console.log('Available meal IDs in schedule:');
      scheduleData.weeks.forEach((week, wIdx) => {
        if (week.days) {
          Object.keys(week.days).forEach(dKey => {
            const day = week.days[dKey];
            Object.keys(day).forEach(mKey => {
              const meal = day[mKey];
              if (meal && meal.id) {
                console.log(`  Week ${wIdx}, Day ${dKey}, Meal ${mKey}: ${meal.id} (${meal.name})`);
              }
            });
          });
        }
      });
      return res.status(404).json({
        success: false,
        message: 'Meal not found in schedule'
      });
    }

    // Save updated schedule back to database
    console.log('💾 Saving updated schedule to database...');
    console.log('💾 Schedule record ID:', scheduleRecord.id);
    console.log('💾 Updated meal data:', JSON.stringify(scheduleData.weeks[0].days.friday.lunch, null, 2));
    
    const { error: updateError } = await supabase
      .from('meal_schedules')
      .update({
        schedule_data: scheduleData,
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleRecord.id);

    if (updateError) {
      console.error('❌ Error updating schedule:', updateError);
      throw updateError;
    }

    console.log('✅ Meal status updated successfully and saved to database');

    // Log the status change for tracking (optional table)
    try {
      await supabase
        .from('delivery_status_logs')
        .insert([{
          user_id: userId,
          meal_id: mealId,
          status: status,
          changed_at: new Date().toISOString(),
          notes: notes || null
        }]);
    } catch (logError) {
      console.error('Error logging status change (table might not exist):', logError.message);
      // Don't fail the request if logging fails
    }

    // Send push notification to user about status change
    try {
      // Get meal name from the updated schedule
      let mealName = 'Your meal';
      scheduleData.weeks.forEach((week) => {
        Object.keys(week.days).forEach((dKey) => {
          const day = week.days[dKey];
          Object.keys(day).forEach((mKey) => {
            const meal = day[mKey];
            if (meal && meal.id === mealId) {
              mealName = meal.name;
            }
          });
        });
      });

      // Create status message
      const statusMessages = {
        'pending': `Your order for "${mealName}" is confirmed and will be prepared soon.`,
        'preparing': `Good news! "${mealName}" is being prepared in our kitchen.`,
        'out_for_delivery': `Your "${mealName}" is out for delivery! It will arrive soon.`,
        'delivered': `Your "${mealName}" has been delivered. Enjoy your meal!`,
        'cancelled': `Your order for "${mealName}" has been cancelled.`,
      };

      const notificationTitle = 'Order Status Update';
      const notificationMessage = statusMessages[status] || `Your meal status has been updated to ${status}`;

      // Save notification to database
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'delivery',
          priority: status === 'delivered' ? 'high' : 'normal',
          read: false,
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }]);

      if (notifError) {
        console.error('Error saving notification:', notifError);
      } else {
        console.log('✅ Notification created in database');
      }

      // Send actual push notification via Expo Push API
      try {
        // Get user's push token
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('push_token')
          .eq('id', userId)
          .single();

        if (userError || !user?.push_token) {
          console.log('⚠️ No push token found for user. User needs to open app first.');
        } else {
          console.log('📱 Found push token, sending push notification...');
          
          // Send push notification via Expo
          const pushMessage = {
            to: user.push_token,
            sound: 'default',
            title: notificationTitle,
            body: notificationMessage,
            data: { 
              type: 'delivery',
              screen: '/orderhistory',
              mealId: mealId,
              userId: userId
            },
            priority: 'high',
            channelId: 'default',
          };

          const pushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pushMessage),
          });

          const pushResult = await pushResponse.json();
          
          if (pushResult.data && pushResult.data[0]?.status === 'ok') {
            console.log('✅ Push notification sent successfully!');
          } else {
            console.error('❌ Push notification failed:', pushResult);
          }
        }
      } catch (pushError) {
        console.error('❌ Error sending push notification:', pushError);
        // Don't fail the main request
      }

    } catch (notifError) {
      console.error('Error in notification flow:', notifError);
      // Don't fail the main request if notification fails
    }

    res.json({
      success: true,
      message: 'Meal status updated successfully',
      data: {
        userId,
        mealId,
        status,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating meal status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to update meal status'
    });
  }
});

// Get delivery statuses for a specific date
app.get('/api/delivery-status/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { status, userId } = req.query;

    console.log('Fetching delivery statuses for date:', date);

    // Get all meal schedules with user data
    let query = supabase
      .from('meal_schedules')
      .select('*, users!inner(id, name, phone, address)');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: schedules, error } = await query;

    if (error) {
      throw error;
    }

    if (!schedules || schedules.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No schedules found'
      });
    }


    // Process schedules and extract meals for the specified date
    const deliveries = [];
    const targetDate = new Date(date);
    const targetDay = targetDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    console.log('🔍 Delivery status by date - requested date:', date);
    console.log('🔍 Delivery status by date - target day:', targetDay);

    schedules.forEach(schedule => {
      const user = schedule.users;
      const userDelivery = {
        id: schedule.id,
        userId: schedule.user_id,
        userName: user?.name || 'Unknown User',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || 'No address provided',
        date: date,
        meals: []
      };

      // Parse schedule_data object with weeks structure
      if (schedule.schedule_data && schedule.schedule_data.weeks) {
        const startDate = new Date(schedule.created_at);
        console.log('🔍 Schedule start date:', startDate.toISOString());
        
        schedule.schedule_data.weeks.forEach((week, weekIndex) => {
          if (week.days) {
            Object.keys(week.days).forEach(dayKey => {
              const day = week.days[dayKey];
              
              // Calculate the date for this day using Pakistan timezone
              const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              const dayIndex = dayNames.indexOf(dayKey.toLowerCase());
              if (dayIndex === -1) return;
              
              const mealDate = new Date(startDate);
              mealDate.setDate(startDate.getDate() + (weekIndex * 7) + (dayIndex - startDate.getDay()));
              
              // Use simple UTC+5 offset for Pakistan timezone
              const pakistanOffset = 5 * 60; // 5 hours in minutes
              const pakistanTime = new Date(mealDate.getTime() + (pakistanOffset * 60 * 1000));
              const mealDateStr = pakistanTime.toISOString().split('T')[0];
              
              console.log(`🔍 Day ${dayKey} (${dayIndex}): ${mealDate.toISOString()} -> ${mealDateStr} (requested: ${date})`);
              
              // Check if this day matches our target date
              if (mealDateStr === date) {
                // Process all meals for this day
                Object.keys(day).forEach(mealKey => {
                  const meal = day[mealKey];
                  if (meal && meal.id) {
                    // Get status from meal object (default to pending if not set)
                    const mealStatus = meal.status || 'pending';
                    
                    // Filter by status if specified
                    if (!status || mealStatus === status) {
                      userDelivery.meals.push({
                        id: meal.id,
                        mealKey: mealKey, // lunch_1, lunch_3, etc.
                        type: meal.category || 'unknown',
                        name: meal.name || 'Unknown Meal',
                        status: mealStatus,
                        calories: meal.calories || 0,
                        protein: meal.protein || 0,
                        carbs: meal.carbs || 0,
                        fat: meal.fat || 0,
                        estimatedDelivery: meal.estimated_delivery || 'TBD',
                        notes: meal.delivery_notes || '',
                        statusUpdatedAt: meal.status_updated_at || null,
                        weekIndex: weekIndex,
                        dayKey: dayKey
                      });
                    }
                  }
                });
              }
            });
          }
        });
      }

      // Only add delivery if it has meals
      if (userDelivery.meals.length > 0) {
        deliveries.push(userDelivery);
      }
    });

    console.log(`Processed ${deliveries.length} deliveries for ${date}`);

    res.json({
      success: true,
      data: deliveries,
      count: deliveries.length,
      message: `Found ${deliveries.length} deliveries for ${date}`
    });

  } catch (error) {
    console.error('Error fetching delivery statuses:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch delivery statuses'
    });
  }
});

// Get delivery status for a specific user
app.get('/api/delivery-status/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, status } = req.query;

    console.log('🔍 UPDATED SERVER CODE - Fetching delivery status for user:', userId, 'date:', date);

    // Get user's meal schedule
    const { data: schedule, error } = await supabase
      .from('meal_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'No meal schedule found for this user'
      });
    }

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
    }

    // Extract all meals with their statuses from schedule_data weeks structure
    const meals = [];

    if (schedule.schedule_data && schedule.schedule_data.weeks) {
      console.log('🔍 SIMPLE APPROACH - Finding meals for day of week:', date);
      
      // Get the day of the week for the requested date
      const requestedDate = new Date(date);
      const requestedDayOfWeek = requestedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const requestedDayName = dayNames[requestedDayOfWeek];
      
      console.log(`🔍 Requested date ${date} is a ${requestedDayName} (day ${requestedDayOfWeek})`);
      
      // Find the first week that has this day of the week
      for (let weekIndex = 0; weekIndex < schedule.schedule_data.weeks.length; weekIndex++) {
        const week = schedule.schedule_data.weeks[weekIndex];
        
        if (week.days && week.days[requestedDayName]) {
          console.log(`✅ Found ${requestedDayName} in week ${weekIndex}`);
          const day = week.days[requestedDayName];
          
          // Add all meals from this day
          Object.keys(day).forEach(mealKey => {
            const meal = day[mealKey];
            if (meal && meal.id) {
              // Check if meal has status field (added by updates), otherwise default to 'pending'
              const mealStatus = meal.status || 'pending';
              const statusMatch = !status || mealStatus === status;
              
              console.log(`🔍 Meal ${meal.id} (${meal.name}): status=${mealStatus}, statusMatch=${statusMatch}`);
              
              if (statusMatch) {
                console.log(`✅ Adding meal ${meal.id} to results`);
                meals.push({
                  id: meal.id,
                  type: meal.category || 'unknown',
                  name: meal.name || 'Unknown Meal',
                  date: date,
                  status: mealStatus,
                  calories: meal.calories || 0,
                  protein: meal.protein || 0,
                  carbs: meal.carbs || 0,
                  fat: meal.fat || 0,
                  estimatedDelivery: 'TBD',
                  notes: '',
                  statusUpdatedAt: null,
                  deliveredAt: null,
                  weekIndex: weekIndex,
                  dayKey: requestedDayName,
                  mealKey: mealKey
                });
              }
            }
          });
          
          // Found meals, we're done
          console.log(`✅ Found ${meals.length} meals for ${requestedDayName} in week ${weekIndex}`);
          break;
        }
      }
      
      if (meals.length === 0) {
        console.log(`❌ No ${requestedDayName} meals found in any week`);
      }
    }

    console.log(`🔍 User delivery status - Final result: ${meals.length} meals found for user ${userId} on date ${date}`);
    console.log(`🚨 CRITICAL DEBUG: Meals array:`, meals.map(m => ({ id: m.id, name: m.name, status: m.status, date: m.date })));

    res.json({
      success: true,
      data: {
        user: {
          id: userId,
          name: userData?.name || 'Unknown User',
          email: userData?.email || '',
          phone: userData?.phone || '',
          address: userData?.address || ''
        },
        meals: meals,
        totalMeals: meals.length
      },
      message: `Found ${meals.length} meals for user`
    });

  } catch (error) {
    console.error('Error fetching user delivery status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch user delivery status'
    });
  }
});

// Get all deliveries with filters
app.get('/api/delivery-status', async (req, res) => {
  try {
    const { date, status, userId, search } = req.query;

    console.log('Fetching all delivery statuses with filters:', { date, status, userId, search });

    let query = supabase
      .from('meal_schedules')
      .select('*, users!inner(id, name, phone, address)');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (search) {
      query = query.or(`users.name.ilike.%${search}%,users.phone.ilike.%${search}%`);
    }

    const { data: schedules, error } = await query;

    if (error) {
      throw error;
    }

    if (!schedules || schedules.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No schedules found'
      });
    }

    const deliveries = [];

    schedules.forEach(schedule => {
      const userData = schedule.users;
      
      // Parse schedule_data weeks structure
      if (schedule.schedule_data && schedule.schedule_data.weeks) {
        const startDate = new Date(schedule.created_at);
        
        schedule.schedule_data.weeks.forEach((week, weekIndex) => {
          if (week.days) {
            Object.keys(week.days).forEach(dayKey => {
              const day = week.days[dayKey];
              
              // Calculate the date for this day using Pakistan timezone
              const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              const dayIndex = dayNames.indexOf(dayKey.toLowerCase());
              if (dayIndex === -1) return;
              
              const mealDate = new Date(startDate);
              mealDate.setDate(startDate.getDate() + (weekIndex * 7) + (dayIndex - startDate.getDay()));
              
              // Use simple UTC+5 offset for Pakistan timezone
              const pakistanOffset = 5 * 60; // 5 hours in minutes
              const pakistanTime = new Date(mealDate.getTime() + (pakistanOffset * 60 * 1000));
              const mealDateStr = pakistanTime.toISOString().split('T')[0];
              
              // Process all meals for this day
              Object.keys(day).forEach(mealKey => {
                const meal = day[mealKey];
                if (meal && meal.id) {
          // Filter by date if specified
                  const dateMatch = !date || mealDateStr === date;
          // Filter by status if specified
                  const mealStatus = meal.status || 'pending';
          const statusMatch = !status || mealStatus === status;
          
          if (dateMatch && statusMatch) {
            deliveries.push({
              userId: schedule.user_id,
              userName: userData?.name || 'Unknown User',
              email: userData?.email || '',
              phone: userData?.phone || '',
                      mealId: meal.id,
                      mealName: meal.name || 'Unknown Meal',
                      mealType: meal.category || meal.type || 'unknown',
                      date: mealDateStr,
              status: mealStatus,
                      calories: meal.calories || 0,
                      estimatedDelivery: meal.estimated_delivery || 'TBD',
                      notes: meal.delivery_notes || meal.notes || '',
                      statusUpdatedAt: meal.status_updated_at || null,
                      weekIndex: weekIndex,
                      dayKey: dayKey,
                      mealKey: mealKey
                    });
                  }
                }
              });
            });
          }
        });
      }
    });

    // Calculate statistics
    const stats = {
      total: deliveries.length,
      pending: deliveries.filter(d => d.status === 'pending').length,
      preparing: deliveries.filter(d => d.status === 'preparing').length,
      out_for_delivery: deliveries.filter(d => d.status === 'out_for_delivery').length,
      delivered: deliveries.filter(d => d.status === 'delivered').length,
      cancelled: deliveries.filter(d => d.status === 'cancelled').length
    };

    res.json({
      success: true,
      data: deliveries,
      stats: stats,
      count: deliveries.length,
      message: `Found ${deliveries.length} delivery records`
    });

  } catch (error) {
    console.error('Error fetching delivery statuses:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch delivery statuses'
    });
  }
});

// Batch update multiple meal statuses
app.post('/api/delivery-status/batch-update', async (req, res) => {
  try {
    const { updates } = req.body; // Array of { userId, mealId, status }

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required and must not be empty'
      });
    }

    console.log(`Processing batch update for ${updates.length} meals`);

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { userId, mealId, status, notes } = update;

        // Get schedule
        const { data: scheduleRecord, error: fetchError } = await supabase
          .from('meal_schedules')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (fetchError || !scheduleRecord) {
          errors.push({ userId, mealId, error: 'Schedule not found' });
          continue;
        }

        // Update meal status in weeks structure
        let scheduleData = JSON.parse(JSON.stringify(scheduleRecord.schedule_data)); // Deep clone
        let updated = false;

        if (scheduleData && scheduleData.weeks) {
          scheduleData.weeks.forEach((week, wIdx) => {
            if (week.days) {
              Object.keys(week.days).forEach(dKey => {
                const day = week.days[dKey];
                Object.keys(day).forEach(mKey => {
                  const meal = day[mKey];
                  if (meal && meal.id === mealId) {
                    // Found the meal - update it
                    meal.status = status;
                    meal.status_updated_at = new Date().toISOString();
                    if (notes) meal.delivery_notes = notes;
                    if (status === 'delivered') meal.delivered_at = new Date().toISOString();
              updated = true;
                  }
                });
              });
            }
          });
        }

        if (updated) {
          // Save to database
          await supabase
            .from('meal_schedules')
            .update({
              schedule_data: scheduleData,
              updated_at: new Date().toISOString()
            })
            .eq('id', scheduleRecord.id);

          results.push({ userId, mealId, status, success: true });
        } else {
          errors.push({ userId, mealId, error: 'Meal not found' });
        }

      } catch (error) {
        errors.push({ userId: update.userId, mealId: update.mealId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Batch update completed. ${results.length} successful, ${errors.length} failed`,
      data: {
        successful: results,
        failed: errors,
        totalProcessed: updates.length
      }
    });

  } catch (error) {
    console.error('Error in batch update:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to process batch update'
    });
  }
});

// Get delivery statistics
app.get('/api/delivery-status/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log('Fetching delivery statistics');

    const { data: schedules, error } = await supabase
      .from('meal_schedules')
      .select('*');

    if (error) {
      throw error;
    }

    const stats = {
      totalOrders: 0,
      byStatus: {
        pending: 0,
        preparing: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0
      },
      byMealType: {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snacks: 0
      },
      byDate: {}
    };

    schedules.forEach(schedule => {
      // Parse schedule_data weeks structure
      if (schedule.schedule_data && schedule.schedule_data.weeks) {
        const startDate = new Date(schedule.created_at);
        
        schedule.schedule_data.weeks.forEach((week, weekIndex) => {
          if (week.days) {
            Object.keys(week.days).forEach(dayKey => {
              const day = week.days[dayKey];
              
              // Calculate the date for this day using Pakistan timezone
              const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              const dayIndex = dayNames.indexOf(dayKey.toLowerCase());
              if (dayIndex === -1) return;
              
              const mealDate = new Date(startDate);
              mealDate.setDate(startDate.getDate() + (weekIndex * 7) + (dayIndex - startDate.getDay()));
              
              // Convert to Pakistan timezone for comparison
              const pakistanDate = new Date(mealDate.toLocaleString("en-US", {timeZone: "Asia/Karachi"}));
              const dateStr = pakistanDate.toISOString().split('T')[0];
              
              // Process all meals for this day
              Object.keys(day).forEach(mealKey => {
                const meal = day[mealKey];
                if (meal && meal.id) {
          // Filter by date range if provided
          if (startDate && dateStr < startDate) return;
          if (endDate && dateStr > endDate) return;
          
          stats.totalOrders++;
          
          // Count by status
                  const status = meal.status || 'pending';
          stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
          
          // Count by meal type
                  const mealType = meal.category || meal.type || 'unknown';
          if (stats.byMealType[mealType] !== undefined) {
            stats.byMealType[mealType] = (stats.byMealType[mealType] || 0) + 1;
          }
          
          // Count by date
          stats.byDate[dateStr] = (stats.byDate[dateStr] || 0) + 1;
                }
              });
            });
          }
        });
      }
    });

    res.json({
      success: true,
      data: stats,
      message: 'Delivery statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching delivery statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch delivery statistics'
    });
  }
});

// Start server
try {
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Express Server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`📱 Mobile access: http://192.168.18.28:${PORT}/api`);
  console.log(`\n📬 Notification Endpoints:`);
  console.log(`   POST /api/notifications/send`);
  console.log(`   GET  /api/notifications/user/:userId`);
  console.log(`   PUT  /api/notifications/:notificationId/read`);
  console.log(`   GET  /api/notifications/all`);
  console.log(`\n📦 Delivery Status Endpoints:`);
  console.log(`   POST /api/delivery-status/update`);
  console.log(`   GET  /api/delivery-status`);
  console.log(`   GET  /api/delivery-status/date/:date`);
  console.log(`   GET  /api/delivery-status/user/:userId`);
  console.log(`   POST /api/delivery-status/batch-update`);
  console.log(`   GET  /api/delivery-status/stats`);
  console.log(`\n⚠️  Make sure Next.js is running on port 3000`);
  console.log(`   Next.js dev: npm run dev`);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
