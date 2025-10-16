"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { font } from "../components/font/font";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useUserData } from "../contexts/UserDataContext";
import ApiService from "../services/api";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";

export default function MealSchedule() {
  const router = useRouter();
  const { userData } = useUserData();

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // Meals state
  const [meals, setMeals] = useState([]);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [mealsError, setMealsError] = useState(null);

  // Swap modal state
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [activeWeekTab, setActiveWeekTab] = useState(0); // 0-3 for weeks 1-4
  const [activeDayTab, setActiveDayTab] = useState(0); // 0-6 for Mon-Sun
  const [allWeeksMeals, setAllWeeksMeals] = useState({});
  const [selectedMealToSwap, setSelectedMealToSwap] = useState(null);
  const [swapMode, setSwapMode] = useState(null); // 'selecting' or null

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayDisplayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Check if a date is in the future
  const isFutureDate = (date) => {
    const today = dayjs();
    return date.isAfter(today, "day");
  };

  // Get user's selected days
  const getUserSelectedDays = () => {
    try {
      const storedUserData = localStorage.getItem("user_data");
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        const selectedDays = parsedUserData.selecteddays;
        if (selectedDays && Array.isArray(selectedDays)) {
          return selectedDays;
        }
      }
    } catch (error) {
      console.error("Error reading user selected days:", error);
    }
    // Default fallback
    return ["MON", "TUE", "WED", "THU", "FRI"];
  };

  // Get user's selected days for display
  const userSelectedDays = getUserSelectedDays();
  const dayMapping = {
    MON: { short: "Mon", full: "Monday", index: 1 },
    TUE: { short: "Tue", full: "Tuesday", index: 2 },
    WED: { short: "Wed", full: "Wednesday", index: 3 },
    THU: { short: "Thu", full: "Thursday", index: 4 },
    FRI: { short: "Fri", full: "Friday", index: 5 },
    SAT: { short: "Sat", full: "Saturday", index: 6 },
    SUN: { short: "Sun", full: "Sunday", index: 0 },
  };

  // Fetch meals for the selected date
  const fetchMealsForDate = async (date) => {
    try {
      setMealsLoading(true);
      setMealsError(null);

      const storedUserData = localStorage.getItem("user_data");
      if (!storedUserData) {
        throw new Error("User not found. Please login again.");
      }

      const parsedUserData = JSON.parse(storedUserData);
      const userId = parsedUserData?.id || parsedUserData?.userId;

      if (!userId) {
        throw new Error("User ID not found. Please login again.");
      }

      // Get meal schedule
      let result = await ApiService.getMealSchedule(userId);

      if (!result.success) {
        result = await ApiService.generateMealSchedule(userId, 4);
      }

      if (!result.success || !result.data) {
        throw new Error("Failed to fetch meal schedule");
      }

      const schedule = result.data;
      const currentWeek = schedule.weeks[0];

      if (!currentWeek) {
        throw new Error("No meals found in schedule");
      }

      // Map date to day of week
      const dayOfWeek = date.day(); // 0 = Sunday, 6 = Saturday
      const dayKey = dayNames[dayOfWeek];

      // Check if this day is in the user's selected days
      const dayMapping = {
        sunday: "SUN",
        monday: "MON",
        tuesday: "TUE",
        wednesday: "WED",
        thursday: "THU",
        friday: "FRI",
        saturday: "SAT",
      };

      const userSelectedDays = getUserSelectedDays();
      const dayKeyUpper = dayMapping[dayKey] || dayKey.toUpperCase();

      // If this day is not in user's selected days, show no meals
      if (!userSelectedDays.includes(dayKeyUpper)) {
        setMeals([]);
        return;
      }

      const dayData = currentWeek.days[dayKey];

      if (!dayData) {
        setMeals([]);
        return;
      }

      // Extract all meals for this day
      const dayMeals = [];
      Object.keys(dayData).forEach((mealKey) => {
        const meal = dayData[mealKey];
        if (meal) {
          console.log("Meal image URL:", meal.image_url);
          dayMeals.push({
            id: meal.id,
            title: meal.name || "Delicious Meal",
            subtitle: meal.description || "A nutritious meal",
            image_url: meal.image_url,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fat || meal.fats,
            fiber: meal.fiber,
            category: meal.category,
            rating: meal.rating,
            dietary_tags: meal.dietary_tags,
            mealKey: mealKey,
          });
        }
      });

      setMeals(dayMeals);
    } catch (error) {
      console.error("Error fetching meals:", error);
      setMealsError(error.message);
      setMeals([]);
    } finally {
      setMealsLoading(false);
    }
  };

  // Fetch all weeks' meals for swap modal
  const fetchAllWeeksMeals = async () => {
    try {
      const storedUserData = localStorage.getItem("user_data");
      if (!storedUserData) return;

      const parsedUserData = JSON.parse(storedUserData);
      const userId = parsedUserData?.id || parsedUserData?.userId;
      if (!userId) return;

      const result = await ApiService.getMealSchedule(userId);
      if (!result.success || !result.data) return;

      const schedule = result.data;
      const weeksData = {};

      // Process all available weeks (not just 4)
      schedule.weeks.forEach((week, weekIndex) => {
        const weekMeals = [];

        // Process all days in the week (not just user selected days for swap options)
        Object.keys(week.days).forEach((dayKey) => {
          const dayData = week.days[dayKey];
          console.log("Processing day:", dayKey, "Data:", dayData);
          if (dayData) {
            // Find the day info from our mapping
            const dayInfo = Object.values(dayMapping).find(
              (info) =>
                info.full.toLowerCase() === dayKey ||
                dayKey.includes(info.full.toLowerCase().substring(0, 3))
            );
            console.log("Day info for", dayKey, ":", dayInfo);

            // Get all meals for this day
            Object.keys(dayData).forEach((mealKey, mealIndex) => {
              const meal = dayData[mealKey];
              console.log("Processing meal:", mealKey, "Meal:", meal);
              if (meal) {
                const mealData = {
                  id: meal.id,
                  title: meal.name || "Delicious Meal",
                  image_url: meal.image_url,
                  calories: meal.calories,
                  protein: meal.protein,
                  carbs: meal.carbs,
                  fats: meal.fat || meal.fats,
                  fiber: meal.fiber,
                  category: meal.category,
                  rating: meal.rating,
                  dietary_tags: meal.dietary_tags,
                  mealKey: mealKey,
                  weekIndex: weekIndex,
                  dayKey: dayKey,
                  dayName: dayInfo ? dayInfo.full : dayKey,
                  dayIndex: dayInfo ? dayInfo.index : 0,
                };
                console.log("Adding meal to week:", mealData);
                weekMeals.push(mealData);
              }
            });
          }
        });

        weeksData[weekIndex] = weekMeals;
      });

      console.log("All weeks meals data:", weeksData);
      setAllWeeksMeals(weeksData);
    } catch (error) {
      console.error("Error fetching all weeks meals:", error);
    }
  };

  // Handle swap meals
  const handleSwapMeals = async (targetMeal) => {
    if (!selectedMealToSwap) return;

    try {
      const storedUserData = localStorage.getItem("user_data");
      if (!storedUserData) {
        alert("User not found. Please login again.");
        return;
      }

      const parsedUserData = JSON.parse(storedUserData);
      const userId = parsedUserData?.id || parsedUserData?.userId;
      if (!userId) {
        alert("User not logged in");
        return;
      }

      console.log("Swapping meals:");
      console.log("From (source):", selectedMealToSwap);
      console.log("To (target):", targetMeal);

      // Get the day of week for selected date
      const dayOfWeek = selectedDate.day();
      const dayKey = dayNames[dayOfWeek];

      // Prepare source meal data (selected date's meal)
      const sourceMeal = {
        weekIndex: 0, // Current week is always 0
        dayKey: dayKey,
        mealKey:
          selectedMealToSwap.mealKey ||
          selectedMealToSwap.category?.toLowerCase() ||
          "lunch",
        mealId: selectedMealToSwap.id,
      };

      // Prepare target meal data (meal from selected week)
      const targetMealData = {
        weekIndex: targetMeal.weekIndex,
        dayKey: targetMeal.dayKey,
        mealKey: targetMeal.mealKey,
        mealId: targetMeal.id,
      };

      console.log("Calling API with:", { sourceMeal, targetMealData });

      // Call the API to swap meals
      const result = await ApiService.swapMeals(
        userId,
        sourceMeal,
        targetMealData
      );

      if (result.success) {
        alert("Meals swapped successfully!");

        // Close modal and reset
        setShowSwapModal(false);
        setSelectedMealToSwap(null);
        setSwapMode(null);
        setActiveWeekTab(0);

        // Refresh meals
        await fetchMealsForDate(selectedDate);
      } else {
        alert(result.message || "Failed to swap meals");
      }
    } catch (error) {
      console.error("Error swapping meals:", error);
      alert(error.message || "Failed to swap meals");
    }
  };

  // Fetch meals when selected date changes
  useEffect(() => {
    fetchMealsForDate(selectedDate);
  }, [selectedDate]);

  return (
    <>
      <Header />
      <div
        className={`${font.className} max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen mt-[100px] relative`}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Meal Schedule</h1>
          <p className="text-gray-600">
            Plan and manage your meals for the month
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                sx={{
                  "& .MuiPickersDay-dayWithMargin": {
                    "&.Mui-selected": {
                      backgroundColor: "#22c55e",
                      "&:hover": {
                        backgroundColor: "#16a34a",
                      },
                    },
                  },
                  "& .MuiPickersCalendarHeader-root": {
                    "& .MuiPickersCalendarHeader-labelContainer": {
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </div>

          {/* Meals Section */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Meals for {selectedDate.format("dddd, MMMM D, YYYY")}
              </h2>

              {/* Swap Meals Button - Only show for future dates */}
              {isFutureDate(selectedDate) && meals.length > 0 && (
                <button
                  onClick={() => {
                    setShowSwapModal(true);
                    fetchAllWeeksMeals();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
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
                </button>
              )}
            </div>

            {mealsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <p className="text-gray-600 mt-2">Loading meals...</p>
              </div>
            ) : mealsError ? (
              <div className="text-center py-8">
                <p className="text-red-600">{mealsError}</p>
              </div>
            ) : meals.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <p className="text-gray-500">
                  {(() => {
                    const dayOfWeek = selectedDate.day();
                    const dayKey = dayNames[dayOfWeek];
                    const dayMapping = {
                      sunday: "SUN",
                      monday: "MON",
                      tuesday: "TUE",
                      wednesday: "WED",
                      thursday: "THU",
                      friday: "FRI",
                      saturday: "SAT",
                    };
                    const userSelectedDays = getUserSelectedDays();
                    const dayKeyUpper =
                      dayMapping[dayKey] || dayKey.toUpperCase();

                    if (!userSelectedDays.includes(dayKeyUpper)) {
                      return "This day is not in your meal plan";
                    }
                    return "No meals scheduled for this day";
                  })()}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {meals.map((meal, index) => (
                  <div
                    key={`${meal.id}-${index}`}
                    className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    {/* Meal Type Indicator */}
                    <div className="px-3 py-1">
                      <span className="text-sm font-semibold capitalize">
                        {meal.category || "Meal"}
                      </span>
                    </div>

                    {/* Meal Image */}
                    <div className="relative w-full h-48 rounded-t-2xl overflow-hidden">
                      <Image
                        src={
                          meal.image_url || "/images/dashboard/breakfast.png"
                        }
                        alt={meal.title}
                        fill
                        className="object-cover"
                        unoptimized={meal.image_url?.includes("supabase")}
                        onError={(e) => {
                          e.target.src = "/images/dashboard/breakfast.png";
                        }}
                      />
                      {meal.rating === 5 && (
                        <div className="absolute top-3 right-3 flex items-center bg-white bg-opacity-90 px-2 py-1 rounded-full">
                          <span className="text-yellow-500 text-sm">★</span>
                          <span className="text-yellow-600 text-xs ml-1 font-semibold">
                            Premium
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meal Info - Green Background */}
                    <div className="bg-green-500 p-4 rounded-b-2xl text-white">
                      <h3 className="font-bold text-lg text-white mb-2">
                        {meal.title}
                      </h3>

                      {meal.subtitle && (
                        <p
                          style={{ minHeight: "40px" }}
                          className="text-white text-sm mb-3 opacity-90 line-clamp-2"
                        >
                          {meal.subtitle}
                        </p>
                      )}

                      <div className="text-white text-sm">
                        {meal.calories && <span>{meal.calories} kcal</span>}
                        {meal.protein && (
                          <span> • {meal.protein}g Protein</span>
                        )}
                        {meal.carbs && <span> • {meal.carbs}g Carbs</span>}
                        {meal.fats && <span> • {meal.fats}g Fats</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Swap Meals Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Swap Meals</h2>
              <button
                onClick={() => {
                  setShowSwapModal(false);
                  setSelectedMealToSwap(null);
                  setSwapMode(null);
                  setActiveWeekTab(0);
                  setActiveDayTab(0);
                }}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Week Tabs */}
            <div className="flex gap-2 p-4 bg-gray-50">
              {[0, 1, 2, 3].map((weekIndex) => (
                <button
                  key={weekIndex}
                  onClick={() => setActiveWeekTab(weekIndex)}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                    activeWeekTab === weekIndex
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                >
                  Week {weekIndex + 1}
                </button>
              ))}
            </div>

            {/* Day Tabs - Only show when a meal is selected */}
            {selectedMealToSwap && (
              <div className="flex gap-2 p-4 bg-gray-100 overflow-x-auto">
                {userSelectedDays.map((dayKey, index) => {
                  const dayInfo = dayMapping[dayKey];
                  if (!dayInfo) return null;

                  return (
                    <button
                      key={dayKey}
                      onClick={() => setActiveDayTab(dayInfo.index)}
                      className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                        activeDayTab === dayInfo.index
                          ? "bg-green-500 text-white"
                          : "bg-white text-gray-700 border border-gray-200"
                      }`}
                    >
                      {dayInfo.short}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!selectedMealToSwap ? (
                // Step 1: Show selected date's meals to select which one to swap
                <>
                  <p className="text-gray-600 mb-6 text-center">
                    Select which meal from {selectedDate.format("dddd, MMMM D")}{" "}
                    you want to swap:
                  </p>
                  {meals && meals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {meals.map((meal, index) => (
                        <button
                          key={`today-${meal.id}-${index}`}
                          onClick={() => {
                            setSelectedMealToSwap({
                              ...meal,
                              weekIndex: 0, // Current week
                              mealIndex: index,
                            });
                            setSwapMode("selecting");
                          }}
                          className="bg-gray-50 rounded-2xl overflow-hidden hover:border-green-500 transition-colors"
                        >
                          {/* Meal Type Indicator */}
                          <div className="px-3 py-1">
                            <span className="text-sm font-semibold capitalize">
                              {meal.category || "Meal"}
                            </span>
                          </div>

                          {/* Meal Image */}
                          <div className="relative w-full h-36">
                            <Image
                              src={
                                meal.image_url ||
                                "/images/dashboard/breakfast.png"
                              }
                              alt={meal.title}
                              fill
                              className="object-cover"
                            />
                            {meal.rating === 5 && (
                              <div className="absolute top-3 right-3 flex items-center bg-white bg-opacity-90 px-2 py-1 rounded-full">
                                <span className="text-yellow-500 text-sm">
                                  ★
                                </span>
                                <span className="text-yellow-600 text-xs ml-1 font-semibold">
                                  Premium
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Meal Info - Green Background */}
                          <div className="bg-green-500 p-4 rounded-b-2xl text-white">
                            <h3
                              style={{ minHeight: "50px" }}
                              className="font-bold text-md text-white px-4 mb-2 text-center"
                            >
                              {meal.title}
                            </h3>
                            {meal.subtitle && (
                              <p className="text-white text-sm mb-3 opacity-90">
                                {meal.subtitle}
                              </p>
                            )}
                            <div className="text-white text-sm">
                              {meal.calories && (
                                <span>{meal.calories} kcal</span>
                              )}
                              {meal.protein && (
                                <span> • {meal.protein}g Protein</span>
                              )}
                              {meal.carbs && (
                                <span> • {meal.carbs}g Carbs</span>
                              )}
                              {meal.fats && <span> • {meal.fats}g Fats</span>}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <p className="text-gray-500">
                        No meals available for this day
                      </p>
                    </div>
                  )}
                </>
              ) : allWeeksMeals[activeWeekTab]?.length > 0 ? (
                <>
                  <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl mb-6">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                    <span className="text-gray-700">
                      Swapping:{" "}
                      <span className="font-bold text-green-600">
                        {selectedMealToSwap.title}
                      </span>
                    </span>
                  </div>

                  {(() => {
                    const activeDayKey = userSelectedDays.find((dayKey) => {
                      const dayInfo = dayMapping[dayKey];
                      return dayInfo && dayInfo.index === activeDayTab;
                    });

                    const selectedDayName = activeDayKey
                      ? dayMapping[activeDayKey].full
                      : dayDisplayNames[activeDayTab];

                    const mealsForDay = allWeeksMeals[activeWeekTab].filter(
                      (meal) => {
                        const dayMatch = meal.dayIndex === activeDayTab;
                        const categoryMatch =
                          meal.category === selectedMealToSwap.category;
                        console.log("Meal filter check:", {
                          mealTitle: meal.title,
                          mealDayIndex: meal.dayIndex,
                          mealCategory: meal.category,
                          dayMatch,
                          categoryMatch,
                          passes: dayMatch && categoryMatch,
                        });
                        return dayMatch && categoryMatch;
                      }
                    );

                    if (mealsForDay.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <svg
                            className="w-12 h-12 text-gray-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <p className="text-gray-500">
                            No {selectedMealToSwap.category} meals available for{" "}
                            {selectedDayName}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <p className="text-gray-600 mb-6 text-center">
                          Select a {selectedMealToSwap.category} meal from Week{" "}
                          {activeWeekTab + 1} - {selectedDayName}:
                        </p>
                        <div className="gap-4 flex items-center justify-center">
                          {mealsForDay.map((meal, index) => (
                            <button
                              key={`week-${meal.id}-${index}`}
                              onClick={() => handleSwapMeals(meal)}
                              className="bg-gray-50 rounded-2xl overflow-hidden hover:border-green-500 transition-colors"
                            >
                              {/* Meal Type Indicator */}
                              <div className="px-3 py-1">
                                <span className="text-sm font-semibold capitalize">
                                  {meal.category || "Meal"}
                                </span>
                              </div>

                              {/* Meal Image */}
                              <div className="relative w-full h-36">
                                <Image
                                  src={
                                    meal.image_url ||
                                    "/images/dashboard/breakfast.png"
                                  }
                                  alt={meal.title}
                                  fill
                                  className="object-cover"
                                />
                                {meal.rating === 5 && (
                                  <div className="absolute top-3 right-3 flex items-center bg-white bg-opacity-90 px-2 py-1 rounded-full">
                                    <span className="text-yellow-500 text-sm">
                                      ★
                                    </span>
                                    <span className="text-yellow-600 text-xs ml-1 font-semibold">
                                      Premium
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Meal Info - Green Background */}
                              <div className="bg-green-500 p-4 rounded-b-2xl text-white">
                                <h3 className="font-bold text-lg text-white mb-2">
                                  {meal.title}
                                </h3>
                                {meal.subtitle && (
                                  <p className="text-white text-sm mb-3 opacity-90">
                                    {meal.subtitle}
                                  </p>
                                )}
                                <div className="text-white text-sm">
                                  {meal.calories && (
                                    <span>{meal.calories} kcal</span>
                                  )}
                                  {meal.protein && (
                                    <span> • {meal.protein}g Protein</span>
                                  )}
                                  {meal.carbs && (
                                    <span> • {meal.carbs}g Carbs</span>
                                  )}
                                  {meal.fats && (
                                    <span> • {meal.fats}g Fats</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <p className="text-gray-500">
                    No meals available for Week {activeWeekTab + 1}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {selectedMealToSwap && (
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedMealToSwap(null);
                    setSwapMode(null);
                    setActiveDayTab(0);
                  }}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel Selection
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
