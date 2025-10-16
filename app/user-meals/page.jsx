"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { font } from "../components/font/font";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MealModal from "../components/MealModal";
import { useUserData } from "../contexts/UserDataContext";
import ApiService from "../services/api";
import Link from "next/link";

export default function UserMeals() {
  const { userData, filterMealsByAllergies } = useUserData();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPreference, setSelectedPreference] = useState("");
  const [selectedMealTime, setSelectedMealTime] = useState("");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  // Get user's meal preferences (only show their selected plan - no "All" option)
  const getUserMealPreferences = () => {
    // First try to get from userData context
    let userPlan = userData?.plan;
    
    // If not available in context, try to get from localStorage
    if (!userPlan) {
      try {
        const storedUserData = localStorage.getItem("user_data");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          userPlan = parsedUserData.plan;
        }
      } catch (error) {
        console.error("Error reading user data from localStorage:", error);
      }
    }
    
    console.log("User plan from getUserMealPreferences:", userPlan);
    
    if (!userPlan) return [{ id: "balanced", title: "Balanced" }]; // Default fallback

    const planMapping = {
      balanced: [{ id: "balanced", title: "Balanced" }],
      lowcarb: [{ id: "lowcarb", title: "Low Carb" }],
      protein: [{ id: "protein", title: "Protein Boost" }],
      vegetarian: [{ id: "vegetarian", title: "Vegetarian Kitchen" }],
      chef: [{ id: "chef", title: "Chef's Choice" }],
      keto: [{ id: "keto", title: "Keto" }],
    };

    return planMapping[userPlan] || [{ id: userPlan, title: userPlan }];
  };

  // Get user's meal times (only show their selected meal types - no "All" option)
  const getUserMealTimes = () => {
    // First try to get from userData context
    let userMealTypes = userData?.mealtypes;
    
    // If not available in context, try to get from localStorage
    if (!userMealTypes || userMealTypes.length === 0) {
      try {
        const storedUserData = localStorage.getItem("user_data");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          userMealTypes = parsedUserData.mealtypes;
        }
      } catch (error) {
        console.error("Error reading user data from localStorage:", error);
      }
    }
    
    console.log("User meal types from getUserMealTimes:", userMealTypes);
    
    if (!userMealTypes || userMealTypes.length === 0) {
      return [
    { id: "lunch", name: "Lunch" },
    { id: "dinner", name: "Dinner" },
      ]; // Default fallback
    }

    const mealTypes =
      typeof userMealTypes === "string"
        ? JSON.parse(userMealTypes)
        : userMealTypes;
    const mealTimeMapping = {
      breakfast: { id: "breakfast", name: "Breakfast" },
      lunch: { id: "lunch", name: "Lunch" },
      dinner: { id: "dinner", name: "Dinner" },
      snacks: { id: "snacks", name: "Snacks" },
    };

    const availableMealTimes = [];
    mealTypes.forEach((type) => {
      if (mealTimeMapping[type]) {
        availableMealTimes.push(mealTimeMapping[type]);
      }
    });

    console.log("Available meal times:", availableMealTimes);

    return availableMealTimes.length > 0
      ? availableMealTimes
      : [{ id: "lunch", name: "Lunch" }];
  };

  const mealPreferences = getUserMealPreferences();
  const mealTimes = getUserMealTimes();

  const fetchUserMeals = async (filters = {}) => {
    try {
      // Get user ID from localStorage (user_data object)
      const storedUserData = localStorage.getItem("user_data");
      if (!storedUserData) {
        throw new Error("User not found. Please login again.");
      }

      const parsedUserData = JSON.parse(storedUserData);
      const userId = parsedUserData?.id || parsedUserData?.userId;

      if (!userId) {
        throw new Error("User ID not found. Please login again.");
      }

      // Get user's meal schedule (this gives us the actual meals assigned to the user)
      let result;
      try {
        result = await ApiService.getMealSchedule(userId);
      } catch (scheduleError) {
        // If no schedule exists, generate one
        const weeks = parsedUserData.subscription === "weekly" ? 1 : 4;
        result = await ApiService.generateMealSchedule(userId, weeks);
      }

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch meal schedule");
      }

      const schedule = result.data;
      const currentWeek = schedule.weeks[0];

      if (!currentWeek) {
        throw new Error("No meals found in schedule");
      }

      // Extract meals from user's selected days and meal types (home page logic)
      const allMeals = [];
      const allWeekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
      const dayMapping = {
        MON: "monday",
        TUE: "tuesday",
        WED: "wednesday",
        THU: "thursday",
        FRI: "friday",
        SAT: "saturday",
        SUN: "sunday",
      };
      const dayDisplayMapping = {
        MON: "Monday",
        TUE: "Tuesday",
        WED: "Wednesday",
        THU: "Thursday",
        FRI: "Friday",
        SAT: "Saturday",
        SUN: "Sunday",
      };

      // Get user's selected days (default to all days if not specified)
      const userSelectedDays = parsedUserData.selecteddays || allWeekDays;

      // Get user's selected meal types
      const userMealTypes = parsedUserData.mealtypes
        ? typeof parsedUserData.mealtypes === "string"
          ? JSON.parse(parsedUserData.mealtypes)
          : parsedUserData.mealtypes
        : ["lunch", "dinner"]; // Default fallback

      // Extract meals only from user's selected days and meal types (like home page)
      userSelectedDays.forEach((selectedDay) => {
        const dayKey = dayMapping[selectedDay] || selectedDay.toLowerCase();
        const dayDisplay = dayDisplayMapping[selectedDay] || selectedDay;
        const dayData = currentWeek.days[dayKey];

        if (dayData) {
          userMealTypes.forEach((mealType) => {
            Object.keys(dayData).forEach((key) => {
              if (key === mealType || key.startsWith(`${mealType}_`)) {
                const meal = dayData[key];
                if (meal && meal.id) {
                  allMeals.push({
                    id: meal.id,
                    name: meal.name || "Delicious Meal",
                    description: meal.description || "A nutritious meal",
                    image_url: meal.image_url,
                    calories: meal.calories,
                    protein: meal.protein,
                    carbs: meal.carbs,
                    fats: meal.fat || meal.fats,
                    fiber: meal.fiber,
                    category: meal.category || mealType,
                    rating: meal.rating,
                    dietary_tags: meal.dietary_tags,
                    // Additional metadata
                    day: dayKey,
                    dayDisplay: dayDisplay,
                    dayShort: selectedDay,
                    mealKey: key,
                  });
                }
              }
            });
          });
        }
      });

      console.log(
        "Raw meals extracted from schedule:",
        allMeals.map((m) => ({
          name: m.name,
          category: m.category,
          day: m.dayDisplay,
          dietary_tags: m.dietary_tags,
        }))
      );

      // Apply allergy filtering using UserDataContext
      let filteredMeals = filterMealsByAllergies(allMeals);

      console.log("Meals after allergy filtering:", filteredMeals.length);

      // Apply category filter (meal time)
      if (filters.category) {
        console.log("Filtering by category:", filters.category);
        console.log(
          "Meals before category filter:",
          filteredMeals.map((m) => ({ name: m.name, category: m.category }))
        );

        filteredMeals = filteredMeals.filter((meal) => {
          const matches = meal.category === filters.category;
          console.log(
            `Meal "${meal.name}" has category:`,
            meal.category,
            "matches filter:",
            matches
          );
          return matches;
        });

        console.log("Meals after category filter:", filteredMeals.length);
      }

      // Apply dietary tags filter (diet type) - matches server.js logic
      if (filters.dietaryTags) {
        console.log("Filtering by dietary tags:", filters.dietaryTags);
        console.log(
          "Meals before dietary filter:",
          filteredMeals.map((m) => ({
            name: m.name,
            dietary_tags: m.dietary_tags,
          }))
        );

        // Get target tags for the preference (like server.js does)
        const targetTags = getDietaryTagsForPreference(selectedPreference);
        console.log(
          "Target tags for preference:",
          selectedPreference,
          "are:",
          targetTags
        );

        filteredMeals = filteredMeals.filter((meal) => {
          const hasAnyTargetTag =
            meal.dietary_tags &&
            targetTags.some((tag) => meal.dietary_tags.includes(tag));
          console.log(
            `Meal "${meal.name}" has dietary_tags:`,
            meal.dietary_tags,
            "matches any target tag:",
            hasAnyTargetTag
          );
          return hasAnyTargetTag;
        });

        console.log("Meals after dietary filter:", filteredMeals.length);
      }

      // Remove duplicates based on meal ID
      const uniqueMeals = filteredMeals.filter(
        (meal, index, self) => index === self.findIndex((m) => m.id === meal.id)
      );

      // Get subscription info for meal limits
      const subscriptionPlans = {
        weekly: { name: "Weekly Plan", fiveStarMeals: 2, weeklyFiveStar: 0.5 },
        monthly: { name: "Monthly Plan", fiveStarMeals: 4, weeklyFiveStar: 1 },
        quarterly: {
          name: "3-Month Plan",
          fiveStarMeals: 12,
          weeklyFiveStar: 1,
        },
      };

      const userSubscription = parsedUserData.subscription || "monthly";
      const planInfo =
        subscriptionPlans[userSubscription] || subscriptionPlans["monthly"];

      console.log(
        `Found ${uniqueMeals.length} meals from user's selected days (subscription: ${planInfo.name})`
      );
      console.log(`User selected days:`, userSelectedDays);
      console.log(`User selected meal types:`, userMealTypes);
      console.log(
        `Meals by category:`,
        uniqueMeals.reduce((acc, meal) => {
          acc[meal.category] = (acc[meal.category] || 0) + 1;
          return acc;
        }, {})
      );
      console.log(
        `Meals by day:`,
        uniqueMeals.reduce((acc, meal) => {
          acc[meal.dayDisplay] = (acc[meal.dayDisplay] || 0) + 1;
          return acc;
        }, {})
      );

      return {
        success: true,
        data: uniqueMeals,
        userPlan: parsedUserData.plan,
        userGoal: parsedUserData.goal,
        subscriptionInfo: {
          type: userSubscription,
          plan: planInfo,
          totalMeals: uniqueMeals.length,
          fiveStarMeals: uniqueMeals.filter((meal) => meal.rating === 5).length,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  const fetchMealsWithFilters = async (preference, mealTime) => {
    setLoading(true);
    setError("");

    try {
      // Apply filters based on selected preference and meal time
      const apiFilters = {};
      if (preference) {
        const dietaryTags = getDietaryTagsForPreference(preference);
        if (dietaryTags.length > 0) {
          apiFilters.dietaryTags = dietaryTags[0];
        }
      }
      if (mealTime) {
        apiFilters.category = getCategoryForMealTime(mealTime);
      }

      const result = await fetchUserMeals(apiFilters);
      setMeals(result.data);
      setSubscriptionInfo(result.subscriptionInfo);
      console.log("User meals fetched:", result);
      console.log("Applied filters:", apiFilters);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching user meals:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMealsData = async () => {
    await fetchMealsWithFilters(selectedPreference, selectedMealTime);
  };

  const handlePreferenceSelect = async (preferenceId) => {
    setSelectedPreference(preferenceId);
    // Auto-fetch meals with new preference
    await fetchMealsWithFilters(preferenceId, selectedMealTime);
  };

  const handleMealTimeSelect = async (mealTimeId) => {
    setSelectedMealTime(mealTimeId);
    // Auto-fetch meals with new meal time
    await fetchMealsWithFilters(selectedPreference, mealTimeId);
  };

  // Helper functions for mapping (matches server.js logic)
  const getDietaryTagsForPreference = (preferenceId) => {
    const mapping = {
      balanced: ["High Protein", "Gluten-Free"], // Balanced plan matches these tags
      lowcarb: ["Low Carb"],
      protein: ["High Protein"],
      vegetarian: ["Vegetarian"],
      chef: ["High Protein", "Low Carb", "Keto"], // Chef's Choice matches these
      keto: ["Keto"],
    };
    return mapping[preferenceId] || [];
  };

  const getCategoryForMealTime = (mealTimeId) => {
    const mapping = {
      breakfast: "breakfast",
      lunch: "lunch",
      dinner: "dinner",
      snacks: "snacks",
    };
    return mapping[mealTimeId] || null;
  };

  const handleMealClick = (meal) => {
    setSelectedMeal(meal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMeal(null);
  };

  // Load user data on component mount
  useEffect(() => {
    const loadUserDataFromStorage = () => {
      try {
        const storedUserData = localStorage.getItem("user_data");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Loaded user data from localStorage:", parsedUserData);
          // The userData context should be updated by the parent component
          // but we can also use this data directly if needed
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserDataFromStorage();
  }, []);

  useEffect(() => {
    // Set initial selected values based on user's available options
    const mealPreferences = getUserMealPreferences();
    const mealTimes = getUserMealTimes();

    console.log("useEffect - mealPreferences:", mealPreferences);
    console.log("useEffect - mealTimes:", mealTimes);

    if (mealPreferences.length > 0 && !selectedPreference) {
      setSelectedPreference(mealPreferences[0].id);
    }
    if (mealTimes.length > 0 && !selectedMealTime) {
      setSelectedMealTime(mealTimes[0].id);
    }

    // Fetch meals once we have the initial selections
    if (selectedPreference && selectedMealTime) {
      fetchMealsData();
    }
  }, [selectedPreference, selectedMealTime, userData]); // Add userData dependency

  return (
    <>
      <Header />
      <div
        className={`${font.className} max-w-6xl mx-auto p-6 bg-white min-h-screen mt-[100px]`}
      >
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
          <h1 className="text-4xl font-bold text-black mb-2">
            What's the flavor today, Chef?
          </h1>
            {subscriptionInfo && (
              <div className="text-sm text-gray-600">
                <span className="font-semibold">
                  {subscriptionInfo.plan.name}
                </span>
                {subscriptionInfo.totalMeals > 0 && (
                  <span className="ml-2">
                    • {subscriptionInfo.totalMeals} meals from your selected
                    days
                    {subscriptionInfo.fiveStarMeals > 0 && (
                      <span className="text-yellow-600">
                        {" "}
                        • {subscriptionInfo.fiveStarMeals} premium meals
                      </span>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>
          <Link
            href="/meal-schedule"
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200
                bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg
            }`}
          >
            <svg
              className={`w-5 h-5`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            Swap Meals
          </Link>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          {/* Type Of Meal */}
          <div className="mb-6 flex items-center space-x-4">
            <h3 className="text-lg font-bold text-gray-800">Meal Type</h3>
            <div className="flex flex-wrap gap-3">
              {mealTimes.map((time) => (
                <button
                  key={time.id}
                  onClick={() => handleMealTimeSelect(time.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    selectedMealTime === time.id
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {time.name}
                </button>
              ))}
            </div>
          </div>

          {/* Diet Type */}
          <div className="mb-6 flex items-center space-x-4">
            <h3 className="text-lg font-bold text-gray-800">Diet Type</h3>
            <div className="flex flex-wrap gap-3">
              {mealPreferences.map((pref) => (
                <button
                  key={pref.id}
                  onClick={() => handlePreferenceSelect(pref.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    selectedPreference === pref.id
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {pref.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-4">
            <div className="loading-spinner mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">
              Finding your perfect meals...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Meals Display */}
        <div className="mt-8">
          {meals.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No meals found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  onClick={() => handleMealClick(meal)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  {/* Meal Image */}
                  <div className="relative w-full h-48 bg-gray-100">
                    <Image
                      src={meal.image_url || "/images/dashboard/breakfast.png"}
                      alt={meal.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Meal Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-lg text-black line-clamp-1 flex-1">
                      {meal.name}
                    </h3>
                      {meal.rating === 5 && (
                        <div className="flex items-center ml-2">
                          <span className="text-yellow-500 text-sm">★</span>
                          <span className="text-yellow-600 text-xs ml-1 font-semibold">
                            Premium
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {meal.description || "Delicious meal option"}
                    </p>
                    {meal.calories && (
                      <p className="text-green-600 text-xs mt-1 font-medium">
                        {meal.calories} kcal • {meal.protein}g protein
                      </p>
                    )}
                    {meal.dayDisplay && (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-gray-500 text-xs">
                          📅 {meal.dayDisplay}
                        </p>
                        <p className="text-gray-500 text-xs capitalize">
                          🍽️ {meal.category}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      
      {/* Meal Modal */}
      <MealModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        meal={selectedMeal} 
      />
    </>
  );
}
