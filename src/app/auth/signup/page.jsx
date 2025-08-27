"use client";

import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { font } from "../../components/font/font";
import Image from "next/image";

export default function SignUp() {
  const [selectedMealTimes, setSelectedMealTimes] = useState([
    "lunch",
    "dinner",
  ]);
  const [selectedWeekDays, setSelectedWeekDays] = useState([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ]);
  const [selectedPaymentCycle, setSelectedPaymentCycle] = useState("weekly");
  const [selectedMealPreference, setSelectedMealPreference] =
    useState("balanced");

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
    { id: "breakfast", name: "Breakfast" },
    { id: "lunch", name: "Lunch" },
    { id: "dinner", name: "Dinner" },
    { id: "snack", name: "Snack" },
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
    setSelectedMealTimes((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId]
    );
  };

  const handleWeekDayToggle = (dayId) => {
    setSelectedWeekDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId]
    );
  };

  const paymentCycles = [
    {
      id: "weekly",
      title: "Weekly",
      subtitle: "AED 53.9 Per week",
      dailyRate: "AED 7.7/day",
    },
    {
      id: "monthly",
      title: "Monthly",
      subtitle: "AED 184.8 Per month",
      dailyRate: "AED 6.6/day",
      popular: true,
    },
    {
      id: "quarterly",
      title: "3-Months",
      subtitle: "AED 526.68 Per quarterly",
      dailyRate: "AED 6.27/day",
    },
  ];

  const handlePaymentCycleChange = (cycleId) => {
    setSelectedPaymentCycle(cycleId);
  };

  const handleMealPreferenceChange = (preferenceId) => {
    setSelectedMealPreference(preferenceId);
  };

  return (
    <div className={`${font.className}`}>
      <Header />
      <main className="min-h-screen mt-16">
        <div className="w-[95%] mx-auto px-1 py-8 space-y-2">
          <div className="w-1/2 max-sm:w-full">
            <h1 className="text-[48px] max-sm:text-[32px] font-bold text-gray-900 mb-2">
              Customize Your Perfect Meal Plan
            </h1>
            <h2 className="text-[32px] max-sm:text-[24px] text-gray-600 font-semibold">
              What kind of meals do you prefer?
            </h2>
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
                          className={`flex flex-col gap-4 relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 bg-[#D5D5D5] hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-2">
                              <h2 className="text-[24px] font-semibold text-gray-900 mb-2 whitespace-nowrap max-sm:text-[20px]">
                                {meal.title}
                              </h2>
                              <p className="text-[16px] text-gray-600 mb-3">
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
                            <button className="text-green-600 text-[16px] max-sm:text-[12px] font-medium hover:text-green-700">
                              Learn More →
                            </button>
                            <button
                              className={`flex justify-center items-center gap-2 px-4 py-2 rounded-2xl text-[16px] max-sm:text-[12px] font-bold transition-colors ${
                                isSelected
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-[#18BD0F] hover:bg-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <div className="bg-white text-green-500 rounded-full p-1">
                                  <svg
                                    className="w-4 h-4"
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
                  <h2 className="text-[32px] max-sm:text-[24px] text-gray-600">
                    How many meals per day?
                  </h2>
                  <p className="text-gray-500">
                    Select a minimum of 2 meals, including lunch or dinner.
                  </p>

                  <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                    {mealTimes.map((meal) => {
                      const isSelected = selectedMealTimes.includes(meal.id);
                      return (
                        <div
                          key={meal.id}
                          onClick={() => handleMealTimeToggle(meal.id)}
                          className={`relative p-8 rounded-4xl border-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 bg-gray-100 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 text-[24px] max-sm:text-[16px]">
                              {meal.name}
                            </h3>
                            {isSelected ? (
                              <div className="bg-green-500 text-white rounded-full p-1">
                                <svg
                                  className="w-4 h-4"
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
                  <h2 className="text-[32px] max-sm:text-[24px] text-gray-600">
                    How many days a week are you eating?
                  </h2>
                  <p className="text-gray-500">Select a minimum of 5 days</p>

                  <div className="grid grid-cols-7 max-sm:grid-cols-3 gap-2">
                    {weekDays.map((day) => {
                      const isSelected = selectedWeekDays.includes(day.id);
                      return (
                        <div
                          key={day.id}
                          onClick={() => handleWeekDayToggle(day.id)}
                          className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer font-bold text-lg transition-all duration-200 ${
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
                  <h2 className="text-[32px] max-sm:text-[24px] text-gray-600">
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
                                <h3 className="font-bold text-gray-900 text-[20px] max-sm:text-[12px]">
                                  {cycle.title}
                                </h3>
                                {cycle.popular && (
                                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs max-sm:text-[10px] font-medium">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 max-sm:text-[12px]">
                                {cycle.subtitle}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-bold text-gray-900 text-[20px] max-sm:text-[12px]">
                                  {cycle.dailyRate}
                                </div>
                              </div>
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
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
                    <h2 className="text-[36px] max-sm:text-[24px] max-sm:text-center text-gray-600 font-bold">
                      Your Package, <br /> Your Way.
                    </h2>
                    <Image
                      src="/images/sign-up/cart.png"
                      alt="Cart"
                      width={100}
                      height={100}
                    />
                  </div>

                  <div className="text-[24px] max-sm:text-[16px] text-green-600 font-semibold mb-1">
                    Balanced, 2 Meals, 7 days per week
                  </div>
                </div>

                {/* Promotion Code */}
                <div className="flex max-sm:flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Add promotion code"
                    className="flex-1 px-3 py-4 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <button className="px-12 py-4 text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50">
                    Apply
                  </button>
                </div>

                {/* Payment Summary */}
                <div>
                  <h3 className="text-[32px] max-sm:text-[24px] font-semibold text-gray-500 mb-4">
                    Payment Summary
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-[20px] max-sm:text-[16px]">
                        Plan Price
                      </span>
                      <span className="font-medium">AED 48</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-[20px] max-sm:text-[16px]">
                        Delivery Fee
                      </span>
                      <span className="font-medium">AED 1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-[20px] max-sm:text-[16px]">
                        VAT (10%)
                      </span>
                      <span className="font-medium">AED 4.9</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-lg max-sm:text-[16px] font-semibold">
                      <span>TOTAL</span>
                      <span>AED 53.9</span>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  Continue
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
