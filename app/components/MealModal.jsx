"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { useAuth } from "../contexts/AuthContext";

export default function MealModal({ isOpen, onClose, meal }) {
  const [isVisible, setIsVisible] = useState(false);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !meal) return null;

  // Get ingredient icons based on meal data
  const getIngredientIcons = (meal) => {
    const ingredients = [];

    if (meal.dietary_tags) {
      meal.dietary_tags.forEach((tag) => {
        if (tag.toLowerCase().includes("protein")) {
          ingredients.push({ name: "Protein", icon: "🥩" });
        }
        if (
          tag.toLowerCase().includes("vegetarian")
        ) {
          ingredients.push({ name: "Vegetables", icon: "🥬" });
        }
        if (tag.toLowerCase().includes("keto")) {
          ingredients.push({ name: "Healthy Fats", icon: "🥑" });
        }
        if (tag.toLowerCase().includes("chef")) {
          ingredients.push({ name: "Chef's Choice", icon: "🍽️" });
        }
        if (tag.toLowerCase().includes("carb")) {
          ingredients.push({ name: "Carbs", icon: "🌾" });
        }
      });
    }

    if (meal.category === "breakfast") {
      ingredients.push({ name: "Berries", icon: "🫐" });
      ingredients.push({ name: "Grains", icon: "🌾" });
    } else if (meal.category === "lunch") {
      ingredients.push({ name: "Fresh Greens", icon: "🥗" });
    } else if (meal.category === "dinner") {
      ingredients.push({ name: "Herbs", icon: "🌿" });
    } else if (meal.category === "snacks") {
      ingredients.push({ name: "Snacks", icon: "🍫" });
    } else if (meal.category === "dessert") {
      ingredients.push({ name: "Dessert", icon: "🍮" });
    }

    if (ingredients.length === 0) {
      ingredients.push(
        { name: "Fresh Ingredients", icon: "🥬" },
        { name: "Natural Spices", icon: "🌶️" },
        { name: "Quality Grains", icon: "🌾" }
      );
    }

    return ingredients.slice(0, 3);
  };

  const ingredients = getIngredientIcons(meal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <span className="text-black text-xl font-bold">×</span>
        </button>

        {/* Modal Content */}
        <div className="p-8">
          {/* Category Buttons */}
          <div className="flex gap-3 mb-6">
            <button className="px-4 py-2 rounded-full bg-green-500 text-white font-medium">
              {meal.dietary_tags && meal.dietary_tags.length > 0
                ? meal.dietary_tags[0]
                : "Balanced"}
            </button>
            <button className="px-4 py-2 rounded-full bg-green-500 text-white font-medium">
              {meal.category?.charAt(0).toUpperCase() +
                meal.category?.slice(1) || "Category"}
            </button>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-black mb-6">{meal.name}</h2>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative w-full h-80 bg-gray-100 rounded-xl overflow-hidden">
              <Image
                src={meal.image_url || "/images/dashboard/breakfast.png"}
                alt={meal.name}
                fill
                className="object-contain"
              />
            </div>

            {/* Description */}
            <div className="space-y-4">
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  {meal.description}
                </p>
              </div>

              {/* Ingredients */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-black mb-4">
                  Ingredients
                </h3>
                <div className="flex gap-4">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-2">
                        <span className="text-2xl">{ingredient.icon}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 text-center">
                        {ingredient.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
