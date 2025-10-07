"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useUserData } from "../contexts/UserDataContext";
import ApiService from "../services/api";

// Circular Progress Component
const CircularProgress = ({ value, max = 100, size = 120, strokeWidth = 8, color = "#07da63", trackColor = "#e5e7eb", children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / max) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// BMI calculation is now handled by UserDataContext

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { userData, loadUserData, getBMIInfo, updateWeight, filterMealsByAllergies } = useUserData();
  
  const [activeDay, setActiveDay] = useState("MON");
  const [activeMeal, setActiveMeal] = useState("Lunch");
  const [meals, setMeals] = useState({});
  const [mealsLoading, setMealsLoading] = useState(true);
  const [mealsError, setMealsError] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [userMealTypes, setUserMealTypes] = useState(['breakfast', 'lunch', 'dinner']);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [updatingWeight, setUpdatingWeight] = useState(false);
  const [weeklyMacroData, setWeeklyMacroData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [userDataLoading, setUserDataLoading] = useState(true);

  const { bmi: currentBMI, color: bmiColor } = getBMIInfo();

  const allWeekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const mealTabs = ["Breakfast", "Lunch", "Snacks", "Dinner"];

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUserData = localStorage.getItem('user_data');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          console.log('Loading user data from localStorage:', userData);
          loadUserData(userData);
          setUserDataLoading(false);
          
          // Set user meal types from loaded data
          if (userData.mealtypes) {
            const mealTypes = typeof userData.mealtypes === 'string' 
              ? JSON.parse(userData.mealtypes) 
              : userData.mealtypes;
            setUserMealTypes(mealTypes);
          }
          
          // Set active meal to first available meal type
          if (userData.mealtypes) {
            const mealTypes = typeof userData.mealtypes === 'string' 
              ? JSON.parse(userData.mealtypes) 
              : userData.mealtypes;
            if (mealTypes.length > 0) {
              const firstMealType = mealTypes[0];
              const capitalizedMealType = firstMealType.charAt(0).toUpperCase() + firstMealType.slice(1);
              setActiveMeal(capitalizedMealType);
            }
          }
          
          // Fetch meal schedule after loading user data
          fetchMealSchedule(userData);
        } else {
          console.log('No user data found in localStorage, redirecting to login');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error loading user data from localStorage:', error);
        router.push('/auth/login');
      }
    };

    loadUserFromStorage();
  }, []);

  // Refetch meals when selected day changes
  useEffect(() => {
    if (userData.isRegistered && !mealsLoading) {
      fetchMealSchedule(userData);
    }
  }, [selectedDayIndex]);

  // Calculate total macros from all scheduled meals for the selected day
  const calculateTotalMacros = () => {
    let totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0
    };
    
    Object.values(meals).forEach(mealCategory => {
      if (Array.isArray(mealCategory)) {
        mealCategory.forEach(meal => {
          totals.calories += parseInt(meal.calories) || 0;
          totals.protein += parseFloat(meal.protein) || 0;
          totals.carbs += parseFloat(meal.carbs) || 0;
          totals.fats += parseFloat(meal.fats) || 0;
          totals.fiber += parseFloat(meal.fiber) || 0;
        });
      }
    });
    
    return totals;
  };

  const macroTotals = calculateTotalMacros();
  const totalCalories = macroTotals.calories;

  // Fetch meal schedule from API
  const fetchMealSchedule = async (userDataParam = null) => {
    try {
      setMealsLoading(true);
      setMealsError(null);

      // Use passed userData or fallback to context userData
      const currentUserData = userDataParam || userData;
      const userId = currentUserData?.userId || currentUserData?.id;
      
      if (!userId) {
        throw new Error('User not logged in');
      }

      console.log('Fetching meal schedule for user:', userId);

      // First, try to get existing meal schedule
      let result;
      try {
        result = await ApiService.getMealSchedule(userId);
        console.log('Existing schedule found:', result);
      } catch (scheduleError) {
        console.log('No existing schedule found, generating new one...');
        // Generate new meal schedule
        result = await ApiService.generateMealSchedule(userId, 4);
        console.log('Generated new schedule:', result);
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch meal schedule');
      }

      const schedule = result.data;
      console.log('Meal schedule loaded:', schedule);

      // Get current week's meals (default to week 1 for now)
      const currentWeek = schedule.weeks[0];
      if (!currentWeek) {
        throw new Error('No meals found in schedule');
      }

      // Transform scheduled meals for display
      const transformMealsCategory = (categoryMeals) => {
        return categoryMeals.map((meal, index) => ({
          id: meal.id,
          title: meal.name || 'Delicious Meal',
          subtitle: meal.description || `Calories: ${meal.calories || 'N/A'} | Protein: ${meal.protein || 'N/A'}g | Rating: ${meal.rating || 'N/A'}⭐`,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fats: meal.fat || meal.fats,
          fiber: meal.fiber,
          category: meal.category,
          rating: meal.rating,
          price: meal.price,
          image: meal.image_url || "/images/dashboard/breakfast.png"
        }));
      };

      // Get meals for each category from the selected day
      const getMealsForDayAndCategory = (category) => {
        const selectedDay = currentUserData.selecteddays ? currentUserData.selecteddays[selectedDayIndex] : allWeekDays[selectedDayIndex];
        const dayMapping = {
          'MON': 'monday',
          'TUE': 'tuesday',
          'WED': 'wednesday',
          'THU': 'thursday',
          'FRI': 'friday',
          'SAT': 'saturday',
          'SUN': 'sunday'
        };
        
        const dayKey = dayMapping[selectedDay] || selectedDay.toLowerCase();
        const day = currentWeek.days[dayKey];
        if (!day) return [];
        
        const categoryMeals = [];
        Object.keys(day).forEach(key => {
          if (key === category || key.startsWith(`${category}_`)) {
            categoryMeals.push(day[key]);
          }
        });
        
        // Filter meals by allergies if user has allergies
        const filteredMeals = filterMealsByAllergies(categoryMeals);
        return filteredMeals.slice(0, 1); // Limit to 1 meal per category per day
      };

      // Set categorized meals from schedule for the selected day
      const mealsData = {
        breakfast: transformMealsCategory(getMealsForDayAndCategory('breakfast')),
        lunch: transformMealsCategory(getMealsForDayAndCategory('lunch')),
        snacks: transformMealsCategory(getMealsForDayAndCategory('snacks')),
        dinner: transformMealsCategory(getMealsForDayAndCategory('dinner')),
      };

      setMeals(mealsData);

      // Calculate weekly macro totals for the chart
      const calculateWeeklyMacros = () => {
        const weeklyTotals = [];
        const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        dayKeys.forEach(dayKey => {
          const dayData = currentWeek.days[dayKey];
          let dayTotal = 0;
          
          if (dayData) {
            Object.keys(dayData).forEach(mealKey => {
              const meal = dayData[mealKey];
              if (meal) {
                dayTotal += parseInt(meal.calories) || 0;
                dayTotal += parseFloat(meal.protein) || 0;
                dayTotal += parseFloat(meal.carbs) || 0;
                dayTotal += parseFloat(meal.fat) || 0;
                dayTotal += parseFloat(meal.fiber) || 0;
              }
            });
          }
          
          weeklyTotals.push(dayTotal);
        });
        
        return weeklyTotals;
      };
      
      const weeklyData = calculateWeeklyMacros();
      setWeeklyMacroData(weeklyData);

      console.log('Meal schedule loaded successfully');

    } catch (error) {
      console.error('Error fetching meal schedule:', error);
      setMealsError(error.message);
    } finally {
      setMealsLoading(false);
    }
  };

  const handleUpdateWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      alert('Please enter a valid weight number');
      return;
    }

    const weightValue = parseFloat(newWeight);
    if (weightValue <= 0 || weightValue > 500) {
      alert('Please enter a weight between 0 and 500 kg');
      return;
    }

    try {
      setUpdatingWeight(true);
      const userId = userData?.userId || userData?.id;
      
      if (!userId) {
        throw new Error('User not found');
      }

      // Update weight in database
      const response = await ApiService.updateUser(userId, {
        weight: weightValue.toString()
      });

      if (response.success) {
        // Update UserDataContext
        updateWeight(weightValue, userData.weightUnit || 'kg');
        
        // Update sessionStorage
        const updatedUserData = { ...userData, weight: weightValue.toString() };
        sessionStorage.setItem('user_data', JSON.stringify(updatedUserData));
        
        alert('Weight updated successfully!');
        setShowWeightModal(false);
        setNewWeight('');
      } else {
        throw new Error(response.message || 'Failed to update weight');
      }
    } catch (error) {
      console.error('Error updating weight:', error);
      alert('Failed to update weight. Please try again.');
    } finally {
      setUpdatingWeight(false);
    }
  };

  // Show loading state while data is being fetched
  if (userDataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Hello <span className="text-green-500">{userData?.name || 'User'}</span>
            </h1>
          </div>
          <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 mb-8" />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Food Log Focus Card - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-lg border border-green-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Macros Log</h2>
            
            {/* Circular Progress with Calories */}
            <div className="flex items-center justify-between mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userData?.tdee ? Math.round(userData.tdee * 0.9) : 1431}</div>
                <div className="text-sm text-gray-500">Target Min</div>
              </div>
              
              <div className="relative">
                <CircularProgress
                  value={totalCalories}
                  max={userData?.tdee || 2000}
                  size={200}
                  strokeWidth={16}
                  color="#07da63"
                  trackColor="#e5f8ed"
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{totalCalories || 0}</div>
                    <div className="text-sm text-gray-500">Calories Today</div>
                  </div>
                </CircularProgress>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userData?.tdee ? Math.round(userData.tdee * 1.1) : 2706}</div>
                <div className="text-sm text-gray-500">Target Max</div>
              </div>
            </div>

            {/* Macros Row */}
            <div className="flex justify-between mb-8 px-4">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Protein</div>
                <div className="text-2xl font-bold text-gray-900">{Math.round(macroTotals.protein)}g</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Fat</div>
                <div className="text-2xl font-bold text-gray-900">{Math.round(macroTotals.fats)}g</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Carbs</div>
                <div className="text-2xl font-bold text-gray-900">{Math.round(macroTotals.carbs)}g</div>
              </div>
            </div>

            {/* Single Tab Display */}
            <div className="bg-gray-100 rounded-xl p-1">
              <div className="bg-black rounded-lg py-4 text-center">
                <span className="text-base font-semibold text-white">Total Macros Today</span>
              </div>
            </div>
          </div>

          {/* Weight Tracker - Takes 1 column */}
          <div className="bg-green-50 rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-700 mb-6">Weight Tracker</h3>
            <div className="space-y-4 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">Current Weight</span>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-gray-900">{userData?.weight || '0'}</span>
                  <span className="text-gray-400 ml-2 mb-1">{userData?.weightUnit || 'Kgs'}</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">BMI</span>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-end">
                  <span className="text-3xl font-bold" style={{ color: bmiColor }}>{currentBMI}</span>
                  <span className="text-gray-400 ml-2 mb-1">Index</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Last Updated: {new Date().toLocaleDateString()}
            </p>

            <button 
              className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold hover:bg-green-600 transition-colors"
              onClick={() => {
                setNewWeight(userData?.weight?.toString() || '');
                setShowWeightModal(true);
              }}
            >
              UPDATE WEIGHT
            </button>
          </div>
        </div>

        {/* Insights & Analytics */}
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Insights & Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="mb-4">
              <h4 className="text-lg font-bold text-gray-900">Weight Trend</h4>
              <p className="text-sm text-gray-500">Sep 30 - Now</p>
            </div>
            <div className="flex items-end justify-between h-24 gap-2">
              {[1, 0, 0, 1, 0, 1, 0].map((isGreen, index) => (
                <div 
                  key={index} 
                  className={`flex-1 rounded-sm ${
                    isGreen ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  style={{ height: `${40 + Math.random() * 60}%` }}
                />
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="mb-4">
              <h4 className="text-lg font-bold text-gray-900">BMI Status</h4>
              <p className="text-sm text-gray-500">Current</p>
            </div>
            <div className="text-center py-4">
              <div className="text-5xl font-bold mb-2" style={{ color: bmiColor }}>{currentBMI}</div>
              <div className="text-sm text-gray-500 mb-4">Body Mass Index</div>
              <button 
                className="flex items-center gap-2 text-base font-semibold text-green-500 hover:text-green-600 transition-colors"
                onClick={() => router.push('/results/bmi?fromHome=true')}
              >
                View Details
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Plan Your Meals Section */}
        <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Plan Your Meals</h3>
          
          {/* Meal Category Tabs */}
          <div className="flex gap-3 mb-6">
            {mealTabs
              .filter(meal => userMealTypes.includes(meal.toLowerCase()))
              .map((m) => (
                <button
                  key={m}
                  className={`px-6 py-3 rounded-2xl text-base font-medium transition-colors ${
                    activeMeal === m 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveMeal(m)}
                >
                  {m}
                </button>
              ))}
          </div>

          {/* Day selection */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold text-gray-700 mb-4">Select Day:</h4>
          <div className="flex flex-wrap gap-3">
            {(userData.selecteddays || allWeekDays).map((day, index) => (
              <button
                key={day}
                className={`px-6 py-3 rounded-2xl text-base font-medium transition-colors ${
                  selectedDayIndex === index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedDayIndex(index)}
              >
                {day}
              </button>
            ))}
          </div>
          </div>

          {/* Meal cards grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mealsLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                <p className="mt-4 text-lg text-gray-600">Loading Meals...</p>
              </div>
            ) : mealsError ? (
              <div className="col-span-full text-center py-16">
                <p className="text-red-500 mb-6 text-lg">Error: {mealsError}</p>
                <button 
                  className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  onClick={() => setMealsError(null)}
                >
                  Retry
                </button>
              </div>
            ) : (
              (() => {
                const currentMeals = meals[activeMeal.toLowerCase()] || [];
                
                if (currentMeals.length === 0) {
                  return (
                    <div className="col-span-full text-center py-16">
                      <p className="text-gray-500 text-lg">No meals found for {activeMeal}</p>
                    </div>
                  );
                }
                
                return currentMeals.map((item, idx) => (
                  <div key={`${item.id || 'meal'}-${idx}`} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative h-64">
                      <Image
                        src={item.image || "/images/dashboard/breakfast.png"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      <button className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-40 rounded-full flex items-center justify-center hover:bg-opacity-60 transition-all">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 bg-green-500 bg-opacity-95 p-5">
                        <h3 className="text-white font-bold text-xl mb-2">{item.title}</h3>
                        <p className="text-green-100 text-sm mb-3 leading-relaxed">
                          {item.subtitle || 'A delicious and nutritious meal'}
                        </p>
                        <p className="text-green-100 text-sm">
                          {[
                            item.calories ? `${item.calories} kcal` : null,
                            item.protein ? `${item.protein}g Protein` : null,
                            item.carbs ? `${item.carbs}g Carbs` : null,
                            item.fats ? `${item.fats}g Fats` : null,
                          ].filter(Boolean).join(' • ') || 'Nutritional info not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        </div>

      </div>

      {/* Weight Update Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-11/12 max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Update Weight</h3>
              <button 
                onClick={() => setShowWeightModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <label className="block text-base text-gray-600 mb-4">
              Enter your current weight (kg)
            </label>
            <input
              type="number"
              className="w-full bg-gray-50 rounded-xl p-5 text-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g. 70.5"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              autoFocus
            />

            <div className="flex gap-4 mt-8">
              <button
                className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                onClick={() => setShowWeightModal(false)}
                disabled={updatingWeight}
              >
                Cancel
              </button>
              <button
                className={`flex-1 py-4 rounded-xl font-bold text-white transition-colors ${
                  updatingWeight ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'
                }`}
                onClick={handleUpdateWeight}
                disabled={updatingWeight}
              >
                {updatingWeight ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
