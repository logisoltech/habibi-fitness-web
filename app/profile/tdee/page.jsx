"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { font } from "../../components/font/font";
import { useUserData } from "../../contexts/UserDataContext";
import { useEffect, useMemo, useState } from "react";
import ApiService from "../../services/api";

export default function TDEEPage() {
  const { userData, loadUserData } = useUserData();
  const [isLoading, setIsLoading] = useState(false);

  // Normalize goal variants (case/spacing)
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
      "maintenance": "Maintenance",
    };
    return map[key] || g;
  };

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
        console.error("Failed to load user for TDEE page", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.goal, userData?.userId, userData?.phone]);

  const stats = useMemo(() => {
    const weightKg = userData?.weightUnit === "lbs"
      ? Number(userData?.weight || 0) / 2.20462
      : Number(userData?.weight || 0);

    const heightCm = userData?.heightUnit === "inches"
      ? Number(userData?.height || 0) * 2.54
      : Number(userData?.height || 0);

    const age = Number(userData?.age ?? 25);
    const gender = (userData?.gender || "Male").toLowerCase();

    let bmr = 0;
    if (weightKg && heightCm && age) {
      bmr = gender === "male"
        ? (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
        : (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }

    const activity = userData?.activity || "Sedentary";
    const multipliers = {
      Sedentary: 1.2,
      Light: 1.375,
      Moderate: 1.55,
      Active: 1.725,
      "Very Active": 1.9,
    };
    const multiplier = multipliers[activity] || 1.2;

    const baseTDEE = Math.round(bmr * multiplier) || 0;

    const goal = normalizeGoal(userData?.goal) || "Maintenance";
    let recommended = baseTDEE;
    if (goal === "Weight Loss") recommended = Math.round(baseTDEE * 0.8);
    if (goal === "Weight Gain") recommended = Math.round(baseTDEE * 1.15);

    return {
      weightKg: Math.round(weightKg * 10) / 10 || 0,
      heightCm: Math.round(heightCm) || 0,
      age,
      gender: gender === "male" ? "Male" : "Female",
      activity,
      multiplier,
      bmr: Math.round(bmr) || 0,
      tdee: baseTDEE,
      goal,
      recommended,
    };
  }, [userData]);

  const suggestions = useMemo(() => ([
    { label: "Aggressive Weight Loss (-20%)", value: Math.round(stats.tdee * 0.8) },
    { label: "Moderate Weight Loss (-10%)", value: Math.round(stats.tdee * 0.9) },
    { label: "Maintenance (±0%)", value: stats.tdee },
    { label: "Moderate Weight Gain (+10%)", value: Math.round(stats.tdee * 1.1) },
    { label: "Aggressive Weight Gain (+15%)", value: Math.round(stats.tdee * 1.15) },
  ]), [stats.tdee]);

  return (
    <>
      <Header />
      <div className={`${font.className} max-w-4xl mx-auto px-6 py-8 mt-[100px]`}>
        <h1 className="text-3xl font-bold mt-12 text-gray-900 mb-2">Your TDEE</h1>
        <p className="text-gray-600 mb-8">Estimated calories based on your saved stats</p>
        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 text-sm text-gray-600">
            Loading saved data...
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-green-500">TDEE</p>
            <p className="text-3xl font-extrabold text-gray-900">{stats.tdee || "—"}</p>
            <p className="text-xs text-green-500 mt-1">kcal/day</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-green-500">BMR</p>
            <p className="text-2xl font-bold text-gray-900">{stats.bmr || "—"}</p>
            <p className="text-xs text-green-500 mt-1">Mifflin-St Jeor</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-green-500">Activity</p>
            <p className="text-base font-semibold text-gray-900">{stats.activity}</p>
            <p className="text-xs text-green-500 mt-1">x {stats.multiplier}</p>
          </div>
        </div>

        {/* Saved stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-green-500">Height</p>
            <p className="text-lg font-semibold text-gray-900">{stats.heightCm || "—"} cm</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-green-500">Weight</p>
            <p className="text-lg font-semibold text-gray-900">{stats.weightKg || "—"} kg</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-green-500">Age</p>
            <p className="text-lg font-semibold text-gray-900">{stats.age || "—"}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-green-500">Gender</p>
            <p className="text-lg font-semibold text-gray-900">{stats.gender || "—"}</p>
          </div>
        </div>

        {/* Goal and recommendations */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recommendations</h3>
            <span className="text-sm text-gray-600">Goal: {normalizeGoal(stats.goal) || "—"}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
                <span className="text-sm text-gray-700">{s.label}</span>
                <span className="text-base font-semibold text-green-500">{s.value} kcal</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}


