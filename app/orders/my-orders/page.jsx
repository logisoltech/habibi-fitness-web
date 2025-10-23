"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { font } from "../../components/font/font";
import Header from "../../components/Header";
import ApiService from "../../services/api";

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("user_data");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuth(true);
          fetchTodaysMeals(parsedUser);
        } else {
          setUser(null);
          setIsAuth(false);
          router.push('/auth/login');
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setUser(null);
        setIsAuth(false);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  // Fetch today's meals with delivery status
  const fetchTodaysMeals = async (userData = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = userData || user;
      if (!currentUser) {
        throw new Error("User not found. Please login again.");
      }

      const userId = currentUser?.id || currentUser?.userId;
      if (!userId) {
        throw new Error("User ID not found. Please login again.");
      }

      console.log("Fetching today's meals for userId:", userId);

      // Get today's date in Pakistan timezone
      const today = new Date();
      const todayString = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
      console.log('🔍 Pakistan date:', todayString);
      console.log('🔍 UTC date:', today.toISOString().split('T')[0]);
      
      // Always use meal schedule as the source of truth for meal data
      // Delivery status will only be used for status updates, not meal data
      console.log("Getting meal schedule as source of truth...");
      let scheduleResponse = await ApiService.getMealSchedule(userId);
      
      if (!scheduleResponse.success || !scheduleResponse.data) {
        // Generate schedule if none exists
        console.log("No meal schedule found, generating one...");
        scheduleResponse = await ApiService.generateMealSchedule(userId, 4);
      }
      
      let todaysMeals = [];
      if (scheduleResponse.success && scheduleResponse.data) {
        todaysMeals = getTodaysMealsFromSchedule(scheduleResponse.data, currentUser);
        console.log("Today's meals from schedule:", todaysMeals);
        
        // Now get delivery status to overlay on top of meal data
        try {
          const deliveryResponse = await ApiService.getUserDeliveryStatus(userId, todayString);
          console.log("Delivery status response:", deliveryResponse);
          
          if (deliveryResponse.success && deliveryResponse.data && deliveryResponse.data.meals) {
            // Overlay delivery status on meal data
            console.log("🔍 Delivery status data received:", deliveryResponse.data);
            console.log("🔍 Meals from delivery status:", deliveryResponse.data.meals);
            todaysMeals = overlayDeliveryStatusOnMeals(todaysMeals, deliveryResponse.data.meals);
            console.log("🔍 Meals with delivery status overlay:", todaysMeals);
          } else {
            console.log("⚠️ No delivery status data found, using default status");
          }
        } catch (deliveryError) {
          console.log("No delivery status found, using default status:", deliveryError.message);
        }
      }
      
      // Transform meals to order format
      const transformedOrders = transformMealsToOrders(todaysMeals, currentUser);
      console.log("Transformed orders:", transformedOrders);
      setOrders(transformedOrders);
      
    } catch (error) {
      console.error('Error fetching today\'s meals:', error);
      setError(error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Overlay delivery status on meal data
  const overlayDeliveryStatusOnMeals = (scheduleMeals, deliveryMeals) => {
    console.log("Overlaying delivery status on meals...");
    console.log("Schedule meals:", scheduleMeals);
    console.log("Delivery meals:", deliveryMeals);
    
    return scheduleMeals.map(scheduleMeal => {
      // Find matching delivery meal by meal ID or name
      const deliveryMeal = deliveryMeals.find(deliveryMeal => 
        deliveryMeal.meal_id === scheduleMeal.id || 
        deliveryMeal.meal_name === scheduleMeal.name ||
        deliveryMeal.name === scheduleMeal.name
      );
      
      if (deliveryMeal) {
        console.log(`Found delivery status for ${scheduleMeal.name}:`, deliveryMeal.status);
        return {
          ...scheduleMeal,
          status: deliveryMeal.status || 'pending',
          status_updated_at: deliveryMeal.status_updated_at,
          delivered_at: deliveryMeal.delivered_at,
          delivery_notes: deliveryMeal.delivery_notes || deliveryMeal.notes
        };
      } else {
        console.log(`No delivery status found for ${scheduleMeal.name}, using default`);
        return {
          ...scheduleMeal,
          status: 'pending'
        };
      }
    });
  };

  // Get today's meals from schedule data
  const getTodaysMealsFromSchedule = (scheduleData, userData) => {
    console.log("Getting today's meals from schedule:", scheduleData);
    console.log("User data:", userData);
    
    if (!scheduleData || !scheduleData.weeks || scheduleData.weeks.length === 0) {
      console.log("No weeks data found in schedule");
      return [];
    }

    const currentWeek = scheduleData.weeks[0];
    console.log("Current week data:", currentWeek);
    
    if (!currentWeek || !currentWeek.days) {
      console.log("No days data found in current week");
      return [];
    }

    // Get today's day name
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDayName = dayNames[today.getDay()];
    console.log("Today's day name:", todayDayName);
    console.log("Available days in schedule:", Object.keys(currentWeek.days));
    
    // Get user's selected days
    const userSelectedDays = userData.selecteddays || ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const dayKeyUpper = todayDayName.toUpperCase();
    console.log("User selected days:", userSelectedDays);
    console.log("Today's day key upper:", dayKeyUpper);
    console.log("Is today in selected days?", userSelectedDays.includes(dayKeyUpper));
    
    if (!userSelectedDays.includes(dayKeyUpper)) {
      console.log(`Today (${dayKeyUpper}) is not in user's selected days, but checking if meals exist anyway...`);
      // Don't return empty array immediately, check if meals exist for today
    }

    const todayData = currentWeek.days[todayDayName];
    console.log("Today's data for", todayDayName, ":", todayData);
    
    if (!todayData) {
      console.log(`No meals scheduled for ${todayDayName}`);
      // Try to find any day with meals as fallback
      console.log("Checking other days for meals...");
      for (const dayKey of Object.keys(currentWeek.days)) {
        const dayData = currentWeek.days[dayKey];
        if (dayData && Object.keys(dayData).length > 0) {
          console.log(`Found meals in ${dayKey}:`, dayData);
          // Use this day's meals as today's meals
          const meals = [];
          Object.keys(dayData).forEach(mealType => {
            const meal = dayData[mealType];
            if (meal && meal.name) {
              meals.push({
                ...meal,
                meal_type: mealType,
                delivery_date: today.toISOString().split('T')[0],
                status: 'pending'
              });
            }
          });
          console.log("Using fallback meals:", meals);
          return meals;
        }
      }
      return [];
    }

    // Convert to array format
    const meals = [];
    Object.keys(todayData).forEach(mealType => {
      const meal = todayData[mealType];
      console.log(`Processing ${mealType} meal:`, meal);
      
      if (meal && meal.name) {
        meals.push({
          ...meal,
          meal_type: mealType,
          delivery_date: today.toISOString().split('T')[0],
          status: 'pending' // Default status for scheduled meals
        });
        console.log(`Added meal: ${meal.name}`);
      }
    });

    console.log("Final meals array:", meals);
    return meals;
  };

  // Transform meals to order format
  const transformMealsToOrders = (meals, userData) => {
    if (!meals || meals.length === 0) {
      return [];
    }

    // Group meals by meal type to create orders
    const ordersByType = {};
    
    meals.forEach(meal => {
      const mealType = meal.meal_type || meal.category || 'meal';
      const capitalizedType = mealType.charAt(0).toUpperCase() + mealType.slice(1);
      
      if (!ordersByType[mealType]) {
        ordersByType[mealType] = {
          id: `order-${mealType}-${Date.now()}`,
          planName: `${capitalizedType} - ${userData.plan || 'Meal Plan'}`,
          category: "TODAY'S MEAL",
          price: `AED ${(meal.price || 15.99).toFixed(2)}`,
          totalMeals: 1,
          status: getMealStatus(meal.status),
          statusColor: getStatusColor(meal.status),
          statusIcon: getStatusIcon(meal.status),
          meal: meal
        };
      } else {
        // If multiple meals of same type, combine them
        ordersByType[mealType].totalMeals += 1;
        ordersByType[mealType].price = `AED ${(parseFloat(ordersByType[mealType].price.replace('AED ', '')) + (meal.price || 15.99)).toFixed(2)}`;
      }
    });

    return Object.values(ordersByType);
  };

  // Get meal status
  const getMealStatus = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'preparing': return 'Preparing';
      case 'cancelled': return 'Cancelled';
      default: return 'Pending';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'out_for_delivery': return '#2196F3';
      case 'preparing': return '#FF9800';
      case 'cancelled': return '#FF6B6B';
      default: return '#9E9E9E';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return 'checkmark-circle';
      case 'out_for_delivery': return 'time';
      case 'preparing': return 'time';
      case 'cancelled': return 'close-circle';
      default: return 'time';
    }
  };

  const handleBackPress = () => {
    router.back();
  };


  const renderOrderCard = (order) => (
    <div
      key={order.id}
      className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {order.meal.name}
          </h3>
          <p className="text-xs text-gray-500 font-medium">{order.category}</p>
        </div>
        <div
          className="flex items-center px-2 py-1 rounded-xl ml-2"
          style={{ backgroundColor: order.statusColor }}
        >
          <div className="text-white">{getStatusIconElement(order.statusIcon)}</div>
          <span className="text-xs text-white font-semibold ml-1">
            {order.status}
          </span>
        </div>
      </div>

      {/* Nutritional Information */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Calories</p>
          <p className="text-sm font-semibold text-gray-900">
            {order.meal.calories || 'N/A'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Protein</p>
          <p className="text-sm font-semibold text-gray-900">
            {order.meal.protein || 'N/A'}g
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Carbs</p>
          <p className="text-sm font-semibold text-gray-900">
            {order.meal.carbs || 'N/A'}g
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Fat</p>
          <p className="text-sm font-semibold text-gray-900">
            {order.meal.fat || 'N/A'}g
          </p>
        </div>
      </div>

      {/* Meal Description */}
      {order.meal.description && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 leading-relaxed">
            {order.meal.description}
          </p>
        </div>
      )}

      {/* Dietary Tags */}
      {order.meal.dietary_tags && order.meal.dietary_tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {order.meal.dietary_tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">Meal Type</p>
          <p className="text-sm font-semibold text-gray-900 capitalize">
            {order.meal.meal_type || order.meal.category}
          </p>
        </div>
      </div>
    </div>
  );

  // Get status icon element
  const getStatusIconElement = (iconName) => {
    const iconMap = {
      time: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      "close-circle": (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      "checkmark-circle": (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };
    return iconMap[iconName] || iconMap["time"];
  };

  return (
    <>
      <Header />
      <div
        className={`${font.className} max-w-6xl mx-auto p-6 bg-white min-h-screen mt-[100px]`}
      >
        <div>
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
            <button
              onClick={handleBackPress}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">My Orders</h1>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log("=== DEBUG INFO ===");
                  console.log("User ID:", user?.id || user?.userId);
                  console.log("Today's date:", new Date().toISOString().split('T')[0]);
                  console.log("Current orders:", orders);
                  console.log("==================");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-xs"
              >
                Debug
              </button>
              <button
                onClick={() => {
                  console.log("🔄 Manual refresh triggered");
                  fetchTodaysMeals();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-xs bg-blue-100"
              >
                Force Refresh
              </button>
              <button
                onClick={() => fetchTodaysMeals()}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg
                  className={`w-5 h-5 text-gray-700 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Orders List */}
          <div className="px-5 py-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-600">Loading today's meals...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium mb-2">Error loading meals</p>
                <p className="text-gray-600 text-sm text-center mb-4">{error}</p>
                <button
                  onClick={() => fetchTodaysMeals()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-2">No meals for today</p>
                <p className="text-gray-500 text-sm text-center">You don't have any meals scheduled for today.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => renderOrderCard(order))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
