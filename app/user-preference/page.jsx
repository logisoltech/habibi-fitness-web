"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { font } from "../components/font/font";

import { useAuth } from "../contexts/AuthContext";
import { useUserData } from "../contexts/UserDataContext";
import { useRouter } from "next/navigation";

export default function UserPreference() {
  const { user, apiCall, isAuthenticated } = useAuth();
  const router = useRouter();
  const {
    userData,
    updatePlan,
    updateMealCount,
    updateMealTypes,
    updateSelectedDays,
    updateSubscription,
    registerUser,
    getBMIInfo,
  } = useUserData();

  const [selectedMealTimes, setSelectedMealTimes] = useState([
    "lunch",
    "dinner",
  ]);

  useEffect(() => {
    console.log("Selected Meal Times", selectedMealTimes);
  }, [selectedMealTimes]);

  const [selectedWeekDays, setSelectedWeekDays] = useState([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ]);
  const [selectedPaymentCycle, setSelectedPaymentCycle] = useState("monthly");
  const [selectedMealPreference, setSelectedMealPreference] =
    useState("balanced");

  // Validation states
  const [mealTimeError, setMealTimeError] = useState("");
  const [weekDayError, setWeekDayError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Personal information states
  const [name, setName] = useState(userData.name || "");
  const [phone, setPhone] = useState(userData.phone || "");
  const [address, setAddress] = useState(userData.address || "");
  const [goal, setGoal] = useState(userData.goal || "Staying Fit");

  // Map UI IDs to API plan names (matching the .md documentation)
  const planMapping = {
    "balanced": "Balanced",
    "lowcarb": "Low Carb",
    "protein": "Protein Boost",
    "vegetarian": "Vegetarian Kitchen",
    "chef": "Chef's Choice",
    "keto": "Keto",
  };

  const mealPreferences = [
    {
      id: "balanced",
      title: "Balanced",
      description: "Provides the nutrients that your body needs to thrive.",
      image: "/images/sign-up/meal-preferences/balanced.png",
    },
    {
      id: "lowcarb",
      title: "Low Carb",
      description: "Low in carbs, but high in non-starchy veggies.",
      image: "/images/sign-up/meal-preferences/low-carb.png",
    },
    {
      id: "protein",
      title: "Protein Boost",
      description: "Boosts muscle strength and vitality with lean proteins.",
      image: "/images/sign-up/meal-preferences/protein.png",
    },
    {
      id: "vegetarian",
      title: "Vegetarian Kitchen",
      description: "Plant-based dishes with veggies & grains.",
      image: "/images/sign-up/meal-preferences/vegetable.png",
    },
    {
      id: "chef",
      title: "Chef's Choice",
      description: "Dishes crafted for your cravings, not your restrictions.",
      image: "/images/sign-up/meal-preferences/chef.png",
    },
    {
      id: "keto",
      title: "Keto",
      description: "Kickstart ketosis and burn fat efficiently.",
      image: "/images/sign-up/meal-preferences/keto.png",
    },
  ];

  const mealTimes = [
    { id: "breakfast", name: "Breakfast", dailyPrice: 20 },
    { id: "lunch", name: "Lunch", dailyPrice: 30 },
    { id: "dinner", name: "Dinner", dailyPrice: 30 },
    { id: "snack", name: "Snack", dailyPrice: 20 },
  ];

  const weekDays = [
    { id: "sunday", name: "S", fullName: "Sunday" },
    { id: "monday", name: "S", fullName: "Monday" },
    { id: "tuesday", name: "M", fullName: "Tuesday" },
    { id: "wednesday", name: "T", fullName: "Wednesday" },
    { id: "thursday", name: "W", fullName: "Thursday" },
    { id: "friday", name: "T", fullName: "Friday" },
    { id: "saturday", name: "F", fullName: "Saturday" },
  ];

  const handleMealTimeToggle = (mealId) => {
    // Prevent deselecting lunch or dinner (they are mandatory)
    if ((mealId === 'lunch' || mealId === 'dinner') && selectedMealTimes.includes(mealId)) {
      setMealTimeError("Lunch and Dinner are required and cannot be deselected");
      return;
    }

    setSelectedMealTimes((prev) => {
      const newSelection = prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId];

      // Clear error if valid
      if (newSelection.includes("lunch") && newSelection.includes("dinner")) {
        setMealTimeError("");
      }

      return newSelection;
    });
  };

  const handleWeekDayToggle = (dayId) => {
    setSelectedWeekDays((prev) => {
      const newSelection = prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId];

      // Validate minimum 5 days requirement
      if (newSelection.length < 5) {
        setWeekDayError("Please select at least 5 days");
      } else {
        setWeekDayError("");
      }

      return newSelection;
    });
  };

  const calculateDailyRate = () => {
    return selectedMealTimes.reduce((total, mealId) => {
      const meal = mealTimes.find(m => m.id === mealId);
      if (!meal) return total; 
      
      let price = meal.dailyPrice;
      
      // Apply price modifications based on meal preference
      if ((selectedMealPreference === "lowcarb" || selectedMealPreference === "protein") && 
          (mealId === "breakfast" || mealId === "snack")) {
        price += 10;
      }
      
      return total + price;
    }, 0);
  };

  // Fixed base pricing (for lunch + dinner only)
  const calculatePricing = () => {
    // Calculate additional cost based on selected meals
    let additionalCost = 0;
    const hasBreakfast = selectedMealTimes.includes('breakfast');
    const hasSnack = selectedMealTimes.includes('snack');
    
    if (hasBreakfast) {
      additionalCost += 390;
    }
    if (hasSnack) {
      additionalCost += 195;
    }

    // Base prices for lunch + dinner
    const basePrices = {
      weekly: 549.99,
      monthly: 1899.99,
      quarterly: 5699.99,
    };

    return {
      weekly: {
        id: "weekly",
        title: "Weekly",
        totalPrice: basePrices.weekly + additionalCost,
        pricePerDay: ((basePrices.weekly + additionalCost) / 7).toFixed(2),
        popular: false,
      },
      monthly: {
        id: "monthly",
        title: "Monthly",
        totalPrice: basePrices.monthly + additionalCost,
        pricePerDay: ((basePrices.monthly + additionalCost) / 30).toFixed(2),
        popular: true,
      },
      quarterly: {
        id: "quarterly",
        title: "3-Months",
        totalPrice: basePrices.quarterly + additionalCost,
        pricePerDay: ((basePrices.quarterly + additionalCost) / 90).toFixed(2),
        popular: false,
      },
    };
  };

  const paymentCycles = Object.values(calculatePricing());

  const handlePaymentCycleChange = (cycleId) => {
    setSelectedPaymentCycle(cycleId);
  };

  const handleMealPreferenceChange = (preferenceId) => {
    setSelectedMealPreference(preferenceId);
    // Save to context with proper plan name
    const planName = planMapping[preferenceId];
    updatePlan(planName);
    console.log("Meal Preference changed", preferenceId, "-> Plan:", planName);
  };

  // Calculate daily rate based on selected meals
  

  // Validation function
  const isFormValid = () => {
    return (
      name.trim() !== "" &&
      phone.trim() !== "" &&
      address.trim() !== "" &&
      selectedMealTimes.length >= 2 && 
      selectedWeekDays.length >= 5
    );
  };

  useEffect(() => {
    if (selectedMealTimes.length < 2) {
      setMealTimeError("Please select at least 2 meals");
    } else if (
      !selectedMealTimes.includes("lunch") ||
      !selectedMealTimes.includes("dinner")
    ) {
      setMealTimeError("Please select lunch and dinner");
    } else {
      setMealTimeError("");
    }

    if (selectedWeekDays.length < 5) {
      setWeekDayError("Please select at least 5 days");
    } else {
      setWeekDayError("");
    }
  }, [selectedMealTimes.length, selectedWeekDays.length]);

  // Handle form submission - REDIRECT TO STRIPE CHECKOUT
  const handleSubmit = async () => {
    if (!isFormValid()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Prepare meal preferences data
      const planName = planMapping[selectedMealPreference];
      
      // Convert selectedWeekDays to uppercase 3-letter format (MON, TUE, WED, etc.)
      const daysMapping = {
        'sunday': 'SUN',
        'monday': 'MON',
        'tuesday': 'TUE',
        'wednesday': 'WED',
        'thursday': 'THU',
        'friday': 'FRI',
        'saturday': 'SAT'
      };
      const formattedDays = selectedWeekDays.map(day => daysMapping[day] || day.toUpperCase());

      // Update context with meal preferences
      updatePlan(planName);
      updateMealCount(selectedMealTimes.length);
      updateMealTypes(selectedMealTimes);
      updateSelectedDays(formattedDays);
      updateSubscription(selectedPaymentCycle);

      const bmiInfo = getBMIInfo();

      // Prepare complete user data for Stripe metadata
      const completeUserData = {
        name: name,
        phone: phone,
        address: address,
        activity: userData.activity || "Moderate",
        plan: planName,
        goal: goal,
        weight: userData.weight.toString(),
        height: userData.height.toString(),
        age: userData.age?.toString() || "25",
        gender: userData.gender || "Male",
        mealcount: selectedMealTimes.length.toString(),
        mealtypes: selectedMealTimes,
        selecteddays: formattedDays,
        subscription: selectedPaymentCycle,
        bmi: bmiInfo.bmi.toString(),
        tdee: bmiInfo.tdee?.toString() || '',
        allergies: userData.allergies || [],
      };

      console.log("🛒 Preparing Stripe checkout with data:", completeUserData);

      // Get fixed pricing for the selected cycle
      const pricing = calculatePricing();
      const selectedPricing = pricing[selectedPaymentCycle];

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentCycle: selectedPaymentCycle,
          userEmail: userData.email || `${userData.phone}@habibi-fitness.com`,
          userName: userData.name,
          userData: completeUserData,
          pricing: {
            amount: Math.round(selectedPricing.totalPrice * 100), // Convert to cents
            currency: 'aed',
            description: `${selectedPricing.title} Meal Plan - AED ${selectedPricing.totalPrice}`
          }
        }),
      });

      const result = await response.json();

      if (result.success && result.url) {
        console.log("✅ Checkout session created, redirecting to Stripe...");
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        throw new Error(result.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("❌ Error creating checkout session:", error);
      setSubmitError(error.message || "Failed to proceed to payment. Please try again.");
      setIsSubmitting(false);
    }
    // Note: Don't set setIsSubmitting(false) here because we're redirecting
  };

  // useEffect(() => {
  //   if (!isAuthenticated()) {
  //     router.push("/auth/login");
  //   }
  // }, [isAuthenticated, router]);

  return (
    <div className={`${font.className}`}>
      <Header />
      <main className="min-h-screen mt-16">
        <div className="w-[95%] mx-auto px-1 py-8 space-y-2">
          <div className="w-1/2 max-sm:w-full">
            <h1 className="text-[40px] max-sm:text-[24px] font-bold text-gray-900 mb-2">
              Customize Your Perfect Meal Plan
            </h1>
            <h2 className="text-[24px] max-sm:text-[20px] text-gray-600 font-medium">
              What kind of meals do you prefer?
            </h2>
          </div>

          {/* Personal Information Section */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your delivery address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fitness Goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Staying Fit">Staying Fit</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Weight Gain">Weight Gain</option>
                  <option value="Eating Healthy">Eating Healthy</option>
                  <option value="Keto Diet">Keto Diet</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 h-full">
            {/* Left Section */}
            <div className="w-full lg:w-2/3">
              <div className="space-y-8">
                {/* Meal Preferences --- Section 1 */}
                <section className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mealPreferences.map((meal) => {
                      const isSelected = selectedMealPreference === meal.id;
                      return (
                        <div
                          key={meal.id}
                          onClick={() => handleMealPreferenceChange(meal.id)}
                          className={`flex flex-col gap-4 relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 bg-[#D5D5D5] hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-2">
                              <h2 className="text-[18px] font-semibold text-gray-900 mb-2 whitespace-nowrap max-sm:text-[20px]">
                                {meal.title}
                              </h2>
                              <p className="text-[14px] text-gray-600 mb-3">
                                {meal.description}
                              </p>
                            </div>
                            <Image
                              src={meal.image}
                              alt={meal.title}
                              width={100}
                              height={100}
                            />
                          </div>

                          <div className="flex justify-between items-center">
                            <button className="text-green-600 text-[14px] max-sm:text-[10px] font-medium hover:text-green-700">
                              Learn More →
                            </button>
                            <button
                              className={`flex justify-center items-center gap-2 px-4 py-2 rounded-2xl text-[14px] max-sm:text-[10px] font-bold transition-colors ${
                                isSelected
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-[#18BD0F] hover:bg-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <div className="bg-white text-green-500 rounded-full p-1">
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                              {isSelected ? "Selected" : "Select Plan"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* How many meals per day? --- Section 2 */}
                <section className="space-y-4">
                  <h2 className="text-[24px] max-sm:text-[20px] text-gray-600">
                    How many meals per day?
                  </h2>
                  <p className="text-gray-500">
                    Select a minimum of 2 meals, including lunch and dinner.
                  </p>
                  {mealTimeError && (
                    <p className="text-red-500 text-sm font-medium">
                      {mealTimeError}
                    </p>
                  )}

                  <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                    {mealTimes.map((meal) => {
                      const isSelected = selectedMealTimes.includes(meal.id);
                      return (
                        <div
                          key={meal.id}
                          onClick={() => handleMealTimeToggle(meal.id)}
                          className={`relative p-4 rounded-2xl border-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 bg-gray-100 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 text-[18px] max-sm:text-[14px]">
                              {meal.name}
                            </h3>
                            {isSelected ? (
                              <div className="bg-green-500 text-white rounded-full p-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* How many days a week? --- Section 3 */}
                <section className="space-y-4">
                  <h2 className="text-[24px] max-sm:text-[20px] text-gray-600">
                    How many days a week are you eating?
                  </h2>
                  <p className="text-gray-500">Select a minimum of 5 days</p>
                  {weekDayError && (
                    <p className="text-red-500 text-sm font-medium">
                      {weekDayError}
                    </p>
                  )}

                  <div className="grid grid-cols-7 max-sm:grid-cols-3">
                    {weekDays.map((day) => {
                      const isSelected = selectedWeekDays.includes(day.id);
                      return (
                        <div
                          key={day.id}
                          onClick={() => handleWeekDayToggle(day.id)}
                          className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer font-bold text-lg transition-all duration-200 ${
                            isSelected
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                          }`}
                          title={day.fullName}
                        >
                          {day.name}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Payment Cycle --- Section 4 */}
                <section className="space-y-4">
                  <h2 className="text-[24px] max-sm:text-[20px] text-gray-600">
                    Payment Cycle
                  </h2>

                  <div className="space-y-3">
                    {paymentCycles.map((cycle) => {
                      const isSelected = selectedPaymentCycle === cycle.id;
                      return (
                        <div
                          key={cycle.id}
                          onClick={() => handlePaymentCycleChange(cycle.id)}
                          className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? "border-green-500 bg-green-50"
                              : "border-gray-300 bg-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 text-[18px] max-sm:text-[12px]">
                                  {cycle.title}
                                </h3>
                                {cycle.popular && (
                                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs max-sm:text-[10px] font-medium">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 max-sm:text-[12px]">
                                AED {cycle.totalPrice} per {cycle.id === 'weekly' ? 'week' : cycle.id === 'monthly' ? 'month' : 'quarter'}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-bold text-gray-900 text-[18px] max-sm:text-[12px]">
                                  AED {cycle.pricePerDay}/day
                                </div>
                                
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected
                                    ? "border-green-500 bg-green-500"
                                    : "border-gray-400 bg-white"
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-3 h-3 rounded-full bg-white"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>

            {/* Right Section - Package Summary */}
            <div className="w-full lg:w-1/2">
              <div className="bg-green-50 rounded-lg py-4 shadow-sm sticky top-8 px-6 space-y-6">
                <div className="rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-[30px] max-sm:text-[20px] max-sm:text-center text-gray-600 font-bold">
                      Your Package, <br /> Your Way.
                    </h2>
                    <Image
                      src="/images/sign-up/cart.png"
                      alt="Cart"
                      width={80}
                      height={80}
                    />
                  </div>

                  <div className="text-[20px] max-sm:text-[14px] text-green-600 font-semibold mb-1">
                    {selectedMealPreference.charAt(0).toUpperCase() +
                      selectedMealPreference.slice(1)}
                    , {selectedMealTimes.length} Meals,{" "}
                    {selectedWeekDays.length} days per week
                  </div>
                </div>

                {/* Promotion Code */}
                <div className="flex max-sm:flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Add promotion code"
                    className="flex-1 px-3 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <button className="px-12 py-3 text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50">
                    Apply
                  </button>
                </div>

                {/* Payment Summary */}
                <div>
                  <h3 className="text-[24px] max-sm:text-[16px] font-semibold text-gray-500 mb-4">
                    Payment Summary
                  </h3>

                  <div className="space-y-3">
                    {(() => {
                      const pricing = calculatePricing();
                      const selectedPricing = pricing[selectedPaymentCycle];
                      
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-[14px] max-sm:text-[12px]">
                              Plan Price ({selectedPricing.title})
                            </span>
                            <span className="font-medium">AED {selectedPricing.totalPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-[14px] max-sm:text-[12px]">
                              Delivery Fee
                            </span>
                            <span className="font-medium">Included</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-[14px] max-sm:text-[12px]">
                              VAT (10%)
                            </span>
                            <span className="font-medium">Included</span>
                          </div>
                          <hr className="border-gray-200" />
                          <div className="flex justify-between text-lg max-sm:text-[14px] font-semibold">
                            <span>TOTAL</span>
                            <span>AED {selectedPricing.totalPrice}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Submit Error */}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm font-medium">
                      {submitError}
                    </p>
                  </div>
                )}

                {/* Continue Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isSubmitting}
                  className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    isFormValid() && !isSubmitting
                      ? "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Payment</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
