"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { font } from "../components/font/font";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MealModal from "../components/MealModal";

export default function MealsExample() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPreference, setSelectedPreference] = useState("all");
  const [selectedMealTime, setSelectedMealTime] = useState("all");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mealPreferences = [
    { id: "all", title: "All" },
    { id: "balanced", title: "Balanced" },
    { id: "lowcarb", title: "Low Carb" },
    { id: "protein", title: "Protein Boost" },
    { id: "vegetarian", title: "Vegetarian Kitchen" },
    { id: "chef", title: "Chef's Choice" },
    { id: "keto", title: "Keto" },
  ];

  const mealTimes = [
    { id: "all", name: "All" },
    { id: "breakfast", name: "Breakfast" },
    { id: "lunch", name: "Lunch" },
    { id: "dinner", name: "Dinner" },
    { id: "snacks", name: "Snacks" },
  ];

  const fetchMeals = async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.category) {
        params.append("category", filters.category);
      }

      if (filters.dietaryTags) {
        params.append("dietary_tags", filters.dietaryTags);
      }

      if (filters.limit) {
        params.append("limit", filters.limit);
      }

      if (filters.offset) {
        params.append("offset", filters.offset);
      }

      const url = `https://habibi-fitness-server.onrender.com/api/meals${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const fetchMealsWithFilters = async (preference, mealTime) => {
    setLoading(true);
    setError("");

    try {
      // Only apply filters if not "all"
      const apiFilters = {};
      if (preference && preference !== "all") {
        const dietaryTags = getDietaryTagsForPreference(preference);
        if (dietaryTags.length > 0) {
          apiFilters.dietaryTags = dietaryTags[0];
        }
      }
      if (mealTime && mealTime !== "all") {
        apiFilters.category = getCategoryForMealTime(mealTime);
      }
      
      // Add a large limit to get all filtered results
      apiFilters.limit = 500;
      apiFilters.offset = 0;

      const result = await fetchMeals(apiFilters);
      console.log("Raw API result:", result);
      console.log("Meals array:", result.data);
      console.log("Meals count:", result.data?.length);
      console.log("API filters sent:", apiFilters);
      console.log("API response filters:", result.filters);
      
      // Show a sample of dietary tags from the returned meals
      if (result.data && result.data.length > 0) {
        const sampleTags = result.data.slice(0, 5).map(m => ({ 
          name: m.name, 
          tags: m.dietary_tags 
        }));
        console.log("Sample meals with tags:", sampleTags);
      }
      
      setMeals(result.data || []);
      console.log("Applied filters:", apiFilters);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching meals:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMealsData = async () => {
    await fetchMealsWithFilters(selectedPreference, selectedMealTime);
  };

  const handlePreferenceSelect = async (preferenceId) => {
    console.log('Changing preference from', selectedPreference, 'to', preferenceId);
    setSelectedPreference(preferenceId);
    // Pass both the new preference and current mealTime to ensure correct filtering
    await fetchMealsWithFilters(preferenceId, selectedMealTime);
  };

  const handleMealTimeSelect = async (mealTimeId) => {
    console.log('Changing mealTime from', selectedMealTime, 'to', mealTimeId);
    setSelectedMealTime(mealTimeId);
    // Pass both current preference and new mealTime to ensure correct filtering
    await fetchMealsWithFilters(selectedPreference, mealTimeId);
  };

  // Helper functions for mapping
  const getDietaryTagsForPreference = (preferenceId) => {
    const mapping = {
      balanced: ["Balanced"],
      lowcarb: ["Low Carb"],
      protein: ["Protein Boost"],
      vegetarian: ["Vegetarian Kitchen"],
      chef: ["Chef's Choice"],
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

  useEffect(() => {
    fetchMealsData();
  }, []);

  return (
    <>
      <Header />
      <div
        className={`${font.className} max-w-6xl mx-auto p-6 bg-white min-h-screen mt-[100px]`}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">
            What's the flavor today, Chef?
          </h1>
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
                    <h3 className="font-bold text-lg text-black mb-1 line-clamp-1">
                      {meal.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {meal.description || "Delicious meal option"}
                    </p>
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
