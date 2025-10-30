"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { font } from "../../components/font/font";
import { useUserData } from "../../contexts/UserDataContext";
import { useEffect, useState } from "react";
import ApiService from "../../services/api";

const goalDescriptions = {
  "Weight Loss": "A calorie deficit approach to reduce body fat while preserving muscle mass.",
  "Weight Gain": "A calorie surplus approach to build muscle and increase body weight.",
  "Staying Fit": "Balanced nutrition to sustain energy and overall wellbeing.",
  "Eating Healthy": "Wholesome meals prioritizing nutrients, variety, and balance.",
  "Keto Diet": "Low-carb, higher-fat meals supporting ketosis and stable energy.",
};

export default function GoalPage() {
  const { userData, loadUserData } = useUserData();
  const [isLoading, setIsLoading] = useState(false);

  // Attempt to load user data if goal is missing
  useEffect(() => {
    const load = async () => {
      if (userData?.goal) return;
      if (!userData?.userId && !userData?.phone) return;
      try {
        setIsLoading(true);
        let user = null;
        if (userData?.userId) {
          const res = await ApiService.getUserById(userData.userId);
          user = res.data;
        } else if (userData?.phone) {
          const res = await ApiService.getUserByPhone(userData.phone);
          user = res.data;
        }
        if (user) loadUserData(user);
      } catch (e) {
        console.error("Failed to load user for goal page", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.goal, userData?.userId, userData?.phone]);

  // Normalize goal variants (case/spacing) so display is consistent
  const normalizeGoal = (g) => {
    if (!g || typeof g !== "string") return "";
    const key = g.toLowerCase().replace(/\s+/g, " ").trim();
    const map = {
      "weight loss": "Weight Loss",
      "weightloss": "Weight Loss",
      "lose weight": "Weight Loss",
      "weight gain": "Weight Gain",
      "weightgain": "Weight Gain",
      "gain weight": "Weight Gain",
      "staying fit": "Staying Fit",
      "stay fit": "Staying Fit",
      "eating healthy": "Eating Healthy",
      "healthy eating": "Eating Healthy",
      "keto": "Keto Diet",
      "keto diet": "Keto Diet",
      "maintenance": "Staying Fit",
    };
    return map[key] || g;
  };

  const goal = normalizeGoal(userData?.goal) || "Not set";
  const activity = userData?.activity || "Sedentary";
  const plan = userData?.plan || "Balanced";

  const description = goalDescriptions[goal] || "Your selected goal tailors meals and calories to your needs.";

  return (
    <>
      <Header />
      <div className={`${font.className} max-w-4xl mx-auto px-6 py-10 mt-[100px]`}>
        <h1 className="text-3xl font-bold mt-12 text-gray-900 mb-2">Your Goal</h1>
        <p className="text-gray-600 mb-8">Based on your saved preferences</p>
        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 text-sm text-gray-600">
            Loading saved goal...
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-500">Goal</p>
            <p className="text-xl font-semibold text-gray-900">{goal}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-500">Diet Plan</p>
            <p className="text-xl font-semibold text-gray-900">{plan}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-500">Activity</p>
            <p className="text-xl font-semibold text-gray-900">{activity}</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">About your goal</h3>
          <p className="text-sm text-gray-700 leading-6">{description}</p>
        </div>

        {/* What this means section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">What this means for your meals</h3>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-2">
            <li>Meal selections prioritize your goal-aligned nutrient profile.</li>
            <li>Portion sizes and calories adapt to your activity and subscription plan.</li>
            <li>Snack and breakfast options may vary based on your chosen plan.</li>
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
}


