"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { font } from "../../components/font/font";
import Header from "../../components/Header";
import ApiService from "../../services/api";

export default function OrderHistory() {
  const router = useRouter();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
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
          fetchUserOrders(parsedUser);
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

  // Fetch user orders
  const fetchUserOrders = async (userData = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use provided userData or get from state
      const currentUser = userData || user;
      if (!currentUser) {
        throw new Error("User not found. Please login again.");
      }

      // Debug: Log the user data structure
      console.log("Current user data:", currentUser);
      console.log("Available keys:", Object.keys(currentUser));

      // Try different possible user ID fields
      let userId = currentUser?.id || 
                   currentUser?.userId || 
                   currentUser?.user_id ||
                   currentUser?.userID ||
                   currentUser?.ID;

      console.log("Extracted userId:", userId);

      // If no direct user ID found, try to get user by phone number
      if (!userId && currentUser?.phone) {
        try {
          console.log("No direct user ID found, trying to get user by phone:", currentUser.phone);
          const userResponse = await ApiService.getUserByPhone(currentUser.phone);
          if (userResponse.success && userResponse.data) {
            userId = userResponse.data.id || userResponse.data.userId;
            console.log("Got user ID from phone lookup:", userId);
          }
        } catch (phoneError) {
          console.error("Error getting user by phone:", phoneError);
        }
      }

      if (!userId) {
        console.error("No user ID found in user data:", currentUser);
        throw new Error("User ID not found. Please login again.");
      }

      // First try to get delivery status, if no meals found, get meal schedule
      console.log("Fetching delivery status for userId:", userId);
      let response = await ApiService.getUserDeliveryStatus(userId);
      console.log("Delivery status response:", response);
      
      let orders = [];
      
      if (response.success && response.data && response.data.meals && response.data.meals.length > 0) {
        console.log("Delivery data received:", response.data);
        // Transform the delivery status data into order format
        orders = transformDeliveryDataToOrders(response.data.meals);
        console.log("Transformed orders from delivery data:", orders);
      } else {
        console.log("No delivery data found, trying meal schedule...");
        // If no delivery data, get meal schedule and create orders from it
        try {
          const scheduleResponse = await ApiService.getMealSchedule(userId);
          console.log("Meal schedule response:", scheduleResponse);
          
          if (scheduleResponse.success && scheduleResponse.data) {
            orders = transformMealScheduleToOrders(scheduleResponse.data, userId);
            console.log("Transformed orders from meal schedule:", orders);
          } else {
            // If no schedule exists, try to generate one
            console.log("No meal schedule found, generating one...");
            const generateResponse = await ApiService.generateMealSchedule(userId, 4);
            if (generateResponse.success && generateResponse.data) {
              orders = transformMealScheduleToOrders(generateResponse.data, userId);
              console.log("Transformed orders from generated schedule:", orders);
            }
          }
        } catch (scheduleError) {
          console.error("Error fetching meal schedule:", scheduleError);
        }
      }
      
      setOrders(orders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      setError(error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };


  // Transform meal schedule data to order history format
  const transformMealScheduleToOrders = (scheduleData, userId) => {
    console.log("Transforming meal schedule data:", scheduleData);
    
    if (!scheduleData || !scheduleData.weeks || scheduleData.weeks.length === 0) {
      console.log("No weeks data found");
      return [];
    }

    const ordersByDate = {};
    const currentDate = new Date();
    
    // Process the first week (current week)
    const currentWeek = scheduleData.weeks[0];
    console.log("Current week data:", currentWeek);
    
    if (!currentWeek || !currentWeek.days) {
      console.log("No days data found in current week");
      return [];
    }

    // Get user's selected days
    const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
    const userSelectedDays = userData.selecteddays || ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    console.log("User selected days:", userSelectedDays);
    
    const dayMapping = {
      "MON": "monday",
      "TUE": "tuesday", 
      "WED": "wednesday",
      "THU": "thursday",
      "FRI": "friday",
      "SAT": "saturday",
      "SUN": "sunday"
    };

    // Process each day in the current week
    Object.keys(currentWeek.days).forEach(dayKey => {
      console.log(`Processing day: ${dayKey}`);
      const dayData = currentWeek.days[dayKey];
      if (!dayData) {
        console.log(`No data for day: ${dayKey}`);
        return;
      }

      // Check if this day is in user's selected days
      const dayKeyUpper = dayKey.toUpperCase();
      console.log(`Checking if ${dayKeyUpper} is in selected days:`, userSelectedDays.includes(dayKeyUpper));
      
      if (!userSelectedDays.includes(dayKeyUpper)) {
        console.log(`Day ${dayKeyUpper} not in user's selected days`);
        return;
      }

      // Calculate the date for this day (simplified - just use current date for now)
      const dayDate = new Date(currentDate);
      
      const dateKey = dayDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });

      console.log(`Creating order for ${dayKey} on ${dateKey}`);

      if (!ordersByDate[dateKey]) {
        ordersByDate[dateKey] = {
          id: `order-${dayDate.toISOString().split('T')[0]}`,
          orderNumber: `ORD-${dayDate.toISOString().split('T')[0].replace(/-/g, '')}`,
          date: dateKey,
          meals: [],
          totalPrice: 0,
          status: 'pending', // Default status for scheduled meals
          tracking: {
            leftKitchen: { time: "Pending", date: "", completed: false },
            outForDelivery: { time: "Pending", date: "", completed: false },
            delivered: { time: "Pending", date: "", completed: false },
          }
        };
      }

      // Add meals for this day
      Object.keys(dayData).forEach(mealType => {
        const meal = dayData[mealType];
        console.log(`Processing ${mealType} meal:`, meal);
        
        if (meal && meal.name) {
          ordersByDate[dateKey].meals.push({
            name: meal.meal_name || meal.name,
            quantity: 1
          });
          
          // Add estimated price
          ordersByDate[dateKey].totalPrice += meal.price || 15.99;
          console.log(`Added meal: ${meal.name}, price: ${meal.price || 15.99}`);
        }
      });
    });

    console.log("Final orders by date:", ordersByDate);

    // Convert to array and sort by date (newest first)
    const result = Object.values(ordersByDate).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
    
    console.log("Final transformed orders:", result);
    return result;
  };

  // Transform delivery status data to order history format
  const transformDeliveryDataToOrders = (deliveryData) => {
    if (!Array.isArray(deliveryData) || deliveryData.length === 0) {
      return [];
    }

    // Group meals by date to create orders
    const ordersByDate = {};
    
    deliveryData.forEach(meal => {
      // Handle different date formats
      let deliveryDate;
      if (meal.delivery_date) {
        deliveryDate = meal.delivery_date;
      } else if (meal.date) {
        deliveryDate = meal.date;
      } else if (meal.created_at) {
        deliveryDate = meal.created_at.split('T')[0];
      } else {
        deliveryDate = new Date().toISOString().split('T')[0];
      }

      const dateKey = new Date(deliveryDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      if (!ordersByDate[dateKey]) {
        ordersByDate[dateKey] = {
          id: `order-${deliveryDate}`,
          orderNumber: `ORD-${deliveryDate.replace(/-/g, '')}`,
          date: dateKey,
          meals: [],
          totalPrice: 0,
          status: 'pending',
          tracking: {
            leftKitchen: { time: "Pending", date: "", completed: false },
            outForDelivery: { time: "Pending", date: "", completed: false },
            delivered: { time: "Pending", date: "", completed: false },
          }
        };
      }
      
      // Add meal to the order
      ordersByDate[dateKey].meals.push({
        name: meal.meal_name || meal.name || meal.meal_title || 'Meal',
        quantity: meal.quantity || 1
      });
      
      // Update order status based on meal status
      const mealStatus = meal.status || 'pending';
      if (mealStatus === 'delivered' && ordersByDate[dateKey].status !== 'delivered') {
        ordersByDate[dateKey].status = 'delivered';
      } else if (mealStatus === 'out_for_delivery' && ordersByDate[dateKey].status === 'pending') {
        ordersByDate[dateKey].status = 'in_process';
      } else if (mealStatus === 'preparing' && ordersByDate[dateKey].status === 'pending') {
        ordersByDate[dateKey].status = 'in_process';
      }
      
      // Update tracking information
      if (mealStatus === 'delivered') {
        const deliveredTime = meal.delivered_at || meal.status_updated_at;
        if (deliveredTime) {
          ordersByDate[dateKey].tracking.delivered = {
            time: new Date(deliveredTime).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }),
            date: dateKey,
            completed: true
          };
        }
        ordersByDate[dateKey].tracking.outForDelivery = {
          time: "Completed",
          date: dateKey,
          completed: true
        };
        ordersByDate[dateKey].tracking.leftKitchen = {
          time: "Completed",
          date: dateKey,
          completed: true
        };
      } else if (mealStatus === 'out_for_delivery') {
        const outForDeliveryTime = meal.status_updated_at;
        if (outForDeliveryTime) {
          ordersByDate[dateKey].tracking.outForDelivery = {
            time: new Date(outForDeliveryTime).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }),
            date: dateKey,
            completed: true
          };
        }
        ordersByDate[dateKey].tracking.leftKitchen = {
          time: "Completed",
          date: dateKey,
          completed: true
        };
      } else if (mealStatus === 'preparing') {
        const preparingTime = meal.status_updated_at;
        if (preparingTime) {
          ordersByDate[dateKey].tracking.leftKitchen = {
            time: new Date(preparingTime).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }),
            date: dateKey,
            completed: true
          };
        }
      }
      
      // Add estimated price (you might want to get this from meal data)
      ordersByDate[dateKey].totalPrice += (meal.price || 15.99) * (meal.quantity || 1);
    });
    
    // Convert to array and sort by date (newest first)
    return Object.values(ordersByDate).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered":
        return { backgroundColor: "#e8f5e9", color: "#2e7d32" };
      case "in_process":
        return { backgroundColor: "#fff3e0", color: "#f57c00" };
      case "pending":
        return { backgroundColor: "#e3f2fd", color: "#1976d2" };
      case "cancelled":
        return { backgroundColor: "#ffebee", color: "#c62828" };
      default:
        return { backgroundColor: "#f5f5f5", color: "#757575" };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "in_process":
        return "In Process";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      delivered: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      in_process: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      pending: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      cancelled: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };
    return iconMap[status] || iconMap["pending"];
  };

  return (
    <>
      <Header />
      <div
        className={`${font.className} max-w-6xl mx-auto p-6 bg-white min-h-screen mt-[100px]`}
      >
        <div>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
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
            <h1 className="text-lg font-bold text-gray-900">Order History</h1>
            <button
              onClick={fetchUserOrders}
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

          {/* Orders List */}
          <div className="px-4 py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-600">Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium mb-2">Error loading orders</p>
                <p className="text-gray-600 text-sm text-center mb-4">{error}</p>
                <button
                  onClick={fetchUserOrders}
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
                <p className="text-gray-600 font-medium mb-2">No orders found</p>
                <p className="text-gray-500 text-sm text-center">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                const statusStyle = getStatusStyle(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                  >
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                          {order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                      <div
                        className="flex items-center px-3 py-1.5 rounded-2xl"
                        style={{ backgroundColor: statusStyle.backgroundColor }}
                      >
                        <div style={{ color: statusStyle.color }}>
                          {getStatusIcon(order.status)}
                        </div>
                        <span
                          className="text-xs font-semibold ml-1"
                          style={{ color: statusStyle.color }}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100 mb-3" />

                    {/* Meals List */}
                    <div className="mb-3">
                      {order.meals.map((meal, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                          </div>
                          <span className="flex-1 text-sm text-gray-900">
                            {meal.name}
                          </span>
                          <span className="text-sm font-semibold text-gray-500">
                            x{meal.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        className="flex-1 py-3 px-4 rounded-xl border-2 border-green-500 text-center hover:bg-green-50 transition-colors"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailsModal(true);
                        }}
                      >
                        <span className="text-sm font-semibold text-green-600">
                          View Details
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}

                {/* Empty space at bottom */}
                <div className="h-5" />
              </div>
            )}
          </div>

          {/* Order Details Modal */}
          {showDetailsModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg max-h-[75vh] shadow-2xl overflow-hidden">
                {selectedOrder && (
                  <>
                    {/* Modal Header */}
                    <div className="flex justify-between items-start p-5 border-b border-gray-100">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                          Order Details
                        </h2>
                        <p className="text-sm text-gray-600">
                          {selectedOrder.orderNumber}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDetailsModal(false)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
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

                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-5 space-y-6">
                        {/* Order Items Section */}
                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-4">
                            Items Ordered
                          </h3>
                          {selectedOrder.meals.map((meal, index) => (
                            <div
                              key={index}
                              className="flex items-center mb-2.5"
                            >
                              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                                <svg
                                  className="w-4.5 h-4.5 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                </svg>
                              </div>
                              <span className="flex-1 text-sm text-gray-900">
                                {meal.name}
                              </span>
                              <span className="text-sm font-semibold text-gray-600">
                                x{meal.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Tracking Timeline */}
                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-4">
                            Order Tracking
                          </h3>

                          {/* Left Kitchen */}
                          <div className="flex mb-4">
                            <div className="flex flex-col items-center mr-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                  selectedOrder.tracking?.leftKitchen?.completed
                                    ? "bg-green-600 border-green-600"
                                    : "bg-gray-100 border-gray-300"
                                }`}
                              >
                                {selectedOrder.tracking?.leftKitchen
                                  ?.completed ? (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                                )}
                              </div>
                              {selectedOrder.tracking?.outForDelivery
                                ?.completed && (
                                <div className="w-0.5 h-6 bg-green-600 mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pt-1">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                Left Kitchen
                              </h4>
                              <p className="text-sm text-gray-600">
                                {selectedOrder.tracking?.leftKitchen?.time ||
                                  "Pending"}
                                {selectedOrder.tracking?.leftKitchen?.date
                                  ? ` - ${selectedOrder.tracking.leftKitchen.date}`
                                  : ""}
                              </p>
                            </div>
                          </div>

                          {/* Out for Delivery */}
                          <div className="flex mb-4">
                            <div className="flex flex-col items-center mr-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                  selectedOrder.tracking?.outForDelivery
                                    ?.completed
                                    ? "bg-green-600 border-green-600"
                                    : "bg-gray-100 border-gray-300"
                                }`}
                              >
                                {selectedOrder.tracking?.outForDelivery
                                  ?.completed ? (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                                )}
                              </div>
                              {selectedOrder.tracking?.delivered?.completed && (
                                <div className="w-0.5 h-6 bg-green-600 mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pt-1">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                Out for Delivery
                              </h4>
                              <p className="text-sm text-gray-600">
                                {selectedOrder.tracking?.outForDelivery?.time ||
                                  "Pending"}
                                {selectedOrder.tracking?.outForDelivery?.date
                                  ? ` - ${selectedOrder.tracking.outForDelivery.date}`
                                  : ""}
                              </p>
                            </div>
                          </div>

                          {/* Delivered */}
                          <div className="flex">
                            <div className="flex flex-col items-center mr-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                  selectedOrder.tracking?.delivered?.completed
                                    ? "bg-green-600 border-green-600"
                                    : "bg-gray-100 border-gray-300"
                                }`}
                              >
                                {selectedOrder.tracking?.delivered
                                  ?.completed ? (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 pt-1">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                Delivered
                              </h4>
                              <p className="text-sm text-gray-600">
                                {selectedOrder.tracking?.delivered?.time ||
                                  "Pending"}
                                {selectedOrder.tracking?.delivered?.date
                                  ? ` - ${selectedOrder.tracking.delivered.date}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
