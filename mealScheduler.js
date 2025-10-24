// Meal Scheduling Service
// Handles automatic meal planning based on subscription plans, ratings, and user preferences

class MealScheduler {
  constructor() {
    this.subscriptionPlans = {
      'weekly': {
        name: 'Weekly Plan',
        duration: 1, // weeks
        fiveStarMeals: 2, // per month
        weeklyFiveStar: 0.5, // per week (2 per month)
      },
      'monthly': {
        name: 'Monthly Plan', 
        duration: 4, // weeks
        fiveStarMeals: 4, // per month
        weeklyFiveStar: 1, // per week
      },
      'quarterly': {
        name: '3-Month Plan',
        duration: 12, // weeks
        fiveStarMeals: 12, // per 3 months
        weeklyFiveStar: 1, // per week
      }
    };
  }

  /**
   * Generate a complete meal schedule for a user
   * @param {Object} userData - User's profile data
   * @param {Array} availableMeals - All available meals from database
   * @param {number} weeks - Number of weeks to schedule (default: 4)
   * @returns {Object} Complete meal schedule
   */
  generateMealSchedule(userData, availableMeals, weeks = 4) {
    try {
      console.log('=== MEAL SCHEDULER DEBUG ===');
      console.log('Generating meal schedule for user:', userData);
      console.log('Available meals count:', availableMeals?.length || 0);
      
      // Validate input data
      if (!userData) {
        throw new Error('User data is required');
      }
      if (!availableMeals || availableMeals.length === 0) {
        throw new Error('No meals available for scheduling');
      }
      
      // Log meal structure for debugging
      console.log('Sample meal structure:', availableMeals[0]);
      console.log('User data structure:', userData);
      console.log('Total meals available:', availableMeals.length);
      
      // Check if meals have required fields
      const sampleMeal = availableMeals[0];
      if (sampleMeal) {
        console.log('Meal has rating field:', 'rating' in sampleMeal, sampleMeal.rating);
        console.log('Meal has category field:', 'category' in sampleMeal, sampleMeal.category);
        console.log('Meal has name field:', 'name' in sampleMeal, sampleMeal.name);
      }
      
      console.log('=== STARTING MEAL GENERATION ===');
      
      const plan = this.subscriptionPlans[userData.subscription] || this.subscriptionPlans['monthly'];
      const schedule = {
        userId: userData.id || userData.userId,
        subscription: userData.subscription,
        plan: plan.name,
        startDate: new Date(),
        weeks: [],
        totalMeals: 0,
        fiveStarMeals: 0,
        generatedAt: new Date().toISOString()
      };

    // Filter meals based on user preferences
    const filteredMeals = this.filterMealsForUser(availableMeals, userData);
    console.log('Filtered meals count:', filteredMeals.length);
    
    // Group meals by category and rating
    const categorizedMeals = this.categorizeMealsByRating(filteredMeals);
    console.log('Categorized meals:', Object.keys(categorizedMeals).reduce((acc, rating) => {
      acc[rating] = Object.keys(categorizedMeals[rating]).reduce((catAcc, category) => {
        catAcc[category] = categorizedMeals[rating][category].length;
        return catAcc;
      }, {});
      return acc;
    }, {}));

    // Generate schedule for each week
    for (let week = 1; week <= weeks; week++) {
      console.log(`Generating week ${week}...`);
      const weekSchedule = this.generateWeeklySchedule(
        week, 
        categorizedMeals, 
        plan, 
        userData,
        schedule.fiveStarMeals
      );
      
      console.log(`Week ${week} generated:`, {
        totalMeals: weekSchedule.totalMeals,
        fiveStarMeals: weekSchedule.fiveStarMeals,
        days: Object.keys(weekSchedule.days).length
      });
      
      schedule.weeks.push(weekSchedule);
      schedule.totalMeals += weekSchedule.totalMeals;
      schedule.fiveStarMeals += weekSchedule.fiveStarMeals;
    }

      console.log('=== MEAL GENERATION COMPLETED ===');
      console.log('Generated schedule weeks:', schedule.weeks?.length || 0);
      console.log('Total meals in schedule:', schedule.totalMeals);
      console.log('Five star meals:', schedule.fiveStarMeals);
      
      return schedule;
    } catch (error) {
      console.error('=== MEAL GENERATION FAILED ===');
      console.error('Error in generateMealSchedule:', error);
      console.error('Error stack:', error.stack);
      throw new Error(`Failed to generate meal schedule: ${error.message}`);
    }
  }

  /**
   * Filter meals based on user allergies, dietary plan, and goals
   */
  filterMealsForUser(meals, userData) {
    return meals.filter(meal => {
      // Check allergies
      if (userData.allergies && userData.allergies.length > 0) {
        const hasAllergyConflict = this.checkMealForAllergies(meal, userData.allergies);
        if (hasAllergyConflict) return false;
      }

      // Check dietary plan compatibility
      if (userData.plan && meal.dietary_tags) {
        const planMapping = {
          'Balanced': ['High Protein', 'Gluten-Free'],
          'Low Carb': ['Low Carb'],
          'Protein Boost': ['High Protein'],
          'Vegetarian Kitchen': ['Vegetarian'],
          "Chef's Choice": ['High Protein', 'Low Carb', 'Keto'],
          'Keto': ['Keto']
        };
        
        const targetTags = planMapping[userData.plan] || [];
        if (targetTags.length > 0 && !targetTags.some(tag => meal.dietary_tags.includes(tag))) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Categorize meals by rating and meal category
   */
  categorizeMealsByRating(meals) {
    const categorized = {
      fiveStar: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      },
      fourStar: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      },
      threeStar: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      },
      twoStar: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      },
      oneStar: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      }
    };

    meals.forEach(meal => {
      const rating = Math.floor(meal.rating || 3); // Default to 3 if no rating
      const category = meal.category || 'lunch';
      
      console.log(`Processing meal: ${meal.name}, rating: ${rating}, category: ${category}`);
      
      if (rating >= 5) {
        categorized.fiveStar[category].push(meal);
      } else if (rating >= 4) {
        categorized.fourStar[category].push(meal);
      } else if (rating >= 3) {
        categorized.threeStar[category].push(meal);
      } else if (rating >= 2) {
        categorized.twoStar[category].push(meal);
      } else {
        categorized.oneStar[category].push(meal);
      }
    });
    
    console.log('Categorized meals:', {
      fiveStar: Object.keys(categorized.fiveStar).reduce((acc, cat) => ({ ...acc, [cat]: categorized.fiveStar[cat].length }), {}),
      fourStar: Object.keys(categorized.fourStar).reduce((acc, cat) => ({ ...acc, [cat]: categorized.fourStar[cat].length }), {}),
      threeStar: Object.keys(categorized.threeStar).reduce((acc, cat) => ({ ...acc, [cat]: categorized.threeStar[cat].length }), {}),
      twoStar: Object.keys(categorized.twoStar).reduce((acc, cat) => ({ ...acc, [cat]: categorized.twoStar[cat].length }), {}),
      oneStar: Object.keys(categorized.oneStar).reduce((acc, cat) => ({ ...acc, [cat]: categorized.oneStar[cat].length }), {})
    });

    return categorized;
  }

  /**
   * Generate schedule for a single week
   */
  generateWeeklySchedule(weekNumber, categorizedMeals, plan, userData, currentFiveStarCount) {
    let weekSchedule = {
      week: weekNumber,
      days: {},
      totalMeals: 0,
      fiveStarMeals: 0,
      mealsByCategory: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      }
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    
    // Track used meals to prevent repetition within the week
    const usedMealIds = new Set();

    // Determine if this week should have 5-star meals
    const shouldHaveFiveStar = this.shouldWeekHaveFiveStar(weekNumber, plan, currentFiveStarCount);
    let fiveStarBudget = shouldHaveFiveStar ? Math.ceil(plan.weeklyFiveStar) : 0;

    // Get user's selected meal count and types
    const userMealCount = userData.mealcount || 3;
    const userMealTypes = userData.mealtypes || ['breakfast', 'lunch', 'snacks', 'dinner'];
    console.log(`=== MEAL TYPES DEBUG ===`);
    console.log(`userData.mealtypes:`, userData.mealtypes, 'Type:', typeof userData.mealtypes);
    console.log(`userMealTypes:`, userMealTypes, 'Type:', typeof userMealTypes);
    console.log(`userMealTypes is array:`, Array.isArray(userMealTypes));
    console.log(`User selected ${userMealCount} meals per day:`, userMealTypes);

    days.forEach(day => {
      weekSchedule.days[day] = {};
      let dayMealCount = 0;
      
      // Use only the meal types the user selected
      const shuffledMealTypes = [...userMealTypes].sort(() => Math.random() - 0.5);
      
      // If user wants more meals than meal types, repeat the meal types
      const mealTypesToUse = [];
      while (mealTypesToUse.length < userMealCount) {
        // Add the entire array, not spread it
        mealTypesToUse.push(...shuffledMealTypes);
      }
      // Trim to exact count needed
      mealTypesToUse.splice(userMealCount);
      
      console.log(`Day ${day}: Original meal types:`, userMealTypes);
      console.log(`Day ${day}: Shuffled meal types:`, shuffledMealTypes);
      console.log(`Day ${day}: Final meal types to use:`, mealTypesToUse);
      
      console.log(`Day ${day}: Using ${mealTypesToUse.length} meal slots:`, mealTypesToUse);
      
      for (const mealType of mealTypesToUse) {
        const meal = this.selectMealForSlot(
          categorizedMeals, 
          mealType, 
          shouldHaveFiveStar && fiveStarBudget > 0,
          userData.goal,
          usedMealIds
        );
        
        if (meal) {
          // Use simple key - just the meal type (e.g., 'lunch', 'dinner')
          // Only assign if this meal type doesn't already exist for this day
          const mealKey = mealType;
          if (!weekSchedule.days[day][mealKey]) {
            weekSchedule.days[day][mealKey] = meal;
            weekSchedule.mealsByCategory[mealType].push(meal);
            weekSchedule.totalMeals++;
            // Track used meals to prevent repetition
            usedMealIds.add(meal.id);
            dayMealCount++;
            
            if (meal.rating >= 5) {
              weekSchedule.fiveStarMeals++;
              if (fiveStarBudget > 0) fiveStarBudget--;
            }
            
            console.log(`✅ Assigned meal: ${meal.name} (ID: ${meal.id}) (${mealType}) to ${day} with key ${mealKey}`);
            console.log(`Used meal IDs so far:`, Array.from(usedMealIds));
            console.log(`Day ${day} now has:`, Object.keys(weekSchedule.days[day]));
          } else {
            console.log(`⚠️ Skipping duplicate meal type ${mealType} for ${day} - already has one`);
          }
        } else {
          console.log(`❌ Failed to assign meal for ${mealType} on ${day}`);
        }
      }
      
      console.log(`Day ${day} completed: ${dayMealCount} meals assigned`);
    });

    console.log(`Week ${weekNumber} completed:`, {
      totalMeals: weekSchedule.totalMeals,
      fiveStarMeals: weekSchedule.fiveStarMeals,
      days: Object.keys(weekSchedule.days).length,
      sampleDay: Object.keys(weekSchedule.days)[0] ? weekSchedule.days[Object.keys(weekSchedule.days)[0]] : null
    });

    // Debug: Log each day's content
    console.log('=== WEEK SCHEDULE DEBUG ===');
    Object.keys(weekSchedule.days).forEach(day => {
      const dayData = weekSchedule.days[day];
      console.log(`${day}:`, Object.keys(dayData), dayData);
    });

    return weekSchedule;
  }

  /**
   * Determine if a week should have 5-star meals based on plan
   */
  shouldWeekHaveFiveStar(weekNumber, plan, currentFiveStarCount) {
    if (plan.name === 'Weekly Plan') {
      // Week 1: 1 five-star, Week 2: 0, Week 3: 1 five-star, Week 4: 0
      return weekNumber === 1 || weekNumber === 3;
    } else if (plan.name === 'Monthly Plan') {
      // Every week gets 1 five-star meal
      return true;
    } else if (plan.name === '3-Month Plan') {
      // Every week gets 1 five-star meal
      return true;
    }
    return false;
  }

  /**
   * Select a meal for a specific time slot
   */
  selectMealForSlot(categorizedMeals, mealType, needsFiveStar, goal, usedMealIds = new Set()) {
    let availableMeals = [];

    if (needsFiveStar) {
      // Try to get a 5-star meal first
      availableMeals = categorizedMeals.fiveStar[mealType] || [];
      console.log(`Looking for 5-star ${mealType}: ${availableMeals.length} available`);
      if (availableMeals.length === 0) {
        // Fallback to 4-star
        availableMeals = categorizedMeals.fourStar[mealType] || [];
        console.log(`Fallback to 4-star ${mealType}: ${availableMeals.length} available`);
      }
    } else {
      // Get meals based on rating priority for the week
      availableMeals = [
        ...(categorizedMeals.fourStar[mealType] || []),
        ...(categorizedMeals.threeStar[mealType] || []),
        ...(categorizedMeals.twoStar[mealType] || []),
        ...(categorizedMeals.oneStar[mealType] || [])
      ];
      console.log(`Looking for regular ${mealType}: ${availableMeals.length} available`);
    }

    // Filter out already used meals to ensure uniqueness
    const beforeFilterCount = availableMeals.length;
    availableMeals = availableMeals.filter(meal => !usedMealIds.has(meal.id));
    console.log(`${mealType}: ${beforeFilterCount} meals before filter, ${availableMeals.length} after filtering out used IDs:`, Array.from(usedMealIds));
    
    if (beforeFilterCount > 0 && availableMeals.length === 0) {
      console.log(`⚠️ WARNING: All ${beforeFilterCount} ${mealType} meals have been used! Need more meals in database.`);
    }

    if (availableMeals.length === 0) {
      console.log(`No meals available for ${mealType} - this might be the issue!`);
      console.log(`Used meal IDs:`, Array.from(usedMealIds));
      console.log(`Available meals before filtering:`, availableMeals.length);
      return null;
    }

    // Sort based on user's goal
    availableMeals = this.sortMealsByGoal(availableMeals, goal);

    // Return a random meal from the top candidates
    const topCandidates = availableMeals.slice(0, Math.min(3, availableMeals.length));
    const selectedMeal = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    console.log(`Selected meal for ${mealType}: ${selectedMeal?.name || 'none'}`);
    return selectedMeal;
  }

  /**
   * Sort meals based on user's fitness goal
   */
  sortMealsByGoal(meals, goal) {
    return meals.sort((a, b) => {
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
  }

  /**
   * Check if meal conflicts with user allergies
   */
  checkMealForAllergies(meal, userAllergies) {
    if (!meal.ingredients || !Array.isArray(meal.ingredients)) {
      return false;
    }

    const allergenVariations = {
      'eggs': ['egg', 'eggs', 'egg white', 'egg yolk', 'scrambled', 'fried egg', 'boiled egg', 'omelet', 'omelette'],
      'dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt', 'dairy', 'lactose'],
      'nuts': ['nuts', 'almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut', 'macadamia'],
      'gluten': ['wheat', 'gluten', 'flour', 'bread', 'pasta', 'barley', 'rye'],
      'shellfish': ['shrimp', 'crab', 'lobster', 'shellfish', 'prawns', 'scallops'],
      'soy': ['soy', 'soya', 'tofu', 'soy sauce', 'soybeans'],
    };

    const userAllergiesLower = userAllergies.map(allergy => allergy.toLowerCase());
    
    for (const ingredient of meal.ingredients) {
      const ingredientLower = ingredient.toLowerCase();
      
      for (const allergy of userAllergiesLower) {
        // Direct match
        if (ingredientLower.includes(allergy) || allergy.includes(ingredientLower)) {
          return true;
        }

        // Check variations
        const variations = allergenVariations[allergy] || [allergy];
        for (const variation of variations) {
          if (ingredientLower.includes(variation)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Get meal schedule for a specific week
   */
  getWeeklySchedule(userId, weekNumber) {
    // This would typically fetch from database
    // For now, return a placeholder
    return {
      week: weekNumber,
      userId: userId,
      meals: []
    };
  }

  /**
   * Update meal schedule when user changes preferences
   */
  updateSchedule(userId, newPreferences) {
    // Regenerate schedule based on new preferences
    // This would typically update the database
    return {
      success: true,
      message: 'Schedule updated successfully'
    };
  }
}

module.exports = MealScheduler;
