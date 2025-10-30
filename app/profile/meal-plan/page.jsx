"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { font } from "../../components/font/font";
import { useUserData } from "../../contexts/UserDataContext";
import { useAuth } from "../../contexts/AuthContext";
import ApiService from "../../services/api";
import { useEffect, useMemo, useState } from "react";

export default function ProfileMealPlan() {
  const { userData, getBMIInfo, loadUserData } = useUserData();
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const bmiInfo = useMemo(() => getBMIInfo(), [userData.weight, userData.height, userData.weightUnit, userData.heightUnit]);

  const suggestions = useMemo(() => {
    // Suggest plans based on BMI category and user's goal
    const s = [];
    if (bmiInfo.category === "Normal") {
      s.push("Balanced", "Chef's Choice");
    } else if (bmiInfo.category === "Underweight") {
      s.push("Protein Boost", "Chef's Choice");
    } else if (bmiInfo.category === "Overweight") {
      s.push("Low Carb", "Keto");
    } else if (bmiInfo.category === "Obese") {
      s.push("Keto", "Low Carb");
    }

    if (userData.goal === "Weight Loss") {
      if (!s.includes("Low Carb")) s.unshift("Low Carb");
    } else if (userData.goal === "Weight Gain") {
      if (!s.includes("Protein Boost")) s.unshift("Protein Boost");
    }

    return Array.from(new Set(s)).slice(0, 2);
  }, [bmiInfo.category, userData.goal]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");

        // Resolve identity: prefer context.userId, else auth user.id/phone, else localStorage
        let resolvedUserId = userData?.userId || user?.id;
        let resolvedPhone = userData?.phone || user?.phone;
        if (!resolvedUserId && typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('habibi_user');
            if (stored) {
              const parsed = JSON.parse(stored);
              resolvedUserId = resolvedUserId || parsed?.id;
              resolvedPhone = resolvedPhone || parsed?.phone;
            }
          } catch {}
        }

        // Ensure we have freshest user data in context
        if (!userData.goal && (resolvedUserId || resolvedPhone)) {
          try {
            const res = resolvedUserId
              ? await ApiService.getUserById(resolvedUserId)
              : await ApiService.getUserByPhone(resolvedPhone);
            if (res?.data) loadUserData(res.data);
          } catch (_) {}
        }

        const effectiveUserId = userData?.userId || resolvedUserId;
        if (!effectiveUserId) {
          setLoading(false);
          return;
        }

        // Load recommendations based on current plan/goal
        if (userData?.plan) {
          try {
            const rec = await ApiService.getRecommendationsByPlan(userData.plan, userData.goal || null);
            setRecommended(Array.isArray(rec?.data) ? rec.data : (rec?.recommendations || []));
          } catch (_) {}
        }

        // Optionally load schedule silently for future use, but not required for UI now
        try {
          const res = await ApiService.getMealSchedule(effectiveUserId);
          const sched = res?.data || res?.schedule || null;
          setSchedule(sched);
        } catch (_) {
          // ignore missing schedule
        }
      } catch (e) {
        setError(e?.message || "Failed to load meal plan");
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.userId]);

  const weeks = useMemo(() => {
    if (!schedule) return [];
    if (Array.isArray(schedule?.weeks)) return schedule.weeks;
    if (Array.isArray(schedule)) return schedule;
    return [];
  }, [schedule]);

  return (
    <>
      <Header />
      <div className={`${font.className} max-w-5xl mx-auto px-6 py-10 mt-[100px]`}>
        <h1 className="text-3xl font-bold mt-6 text-gray-900 mb-2">Your Meal Plan</h1>
        <p className="text-gray-600 mb-6">Your saved plan, a quick preview, and suggestions</p>

        {/* Top summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Diet Plan</p>
            <p className="text-xl font-semibold text-gray-900">{userData?.plan || "—"}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Goal</p>
            <p className="text-xl font-semibold text-gray-900">{userData?.goal || "—"}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">BMI</p>
            <p className="text-xl font-semibold text-gray-900">{bmiInfo.bmi || "—"} <span className="text-xs text-gray-500">({bmiInfo.category || "—"})</span></p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">Selected Days</p>
            <p className="text-sm font-medium text-gray-900 break-words">{Array.isArray(userData?.selecteddays) ? userData.selecteddays.join(", ") : "—"}</p>
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Suggested Plans</h3>
          {suggestions.length === 0 ? (
            <p className="text-sm text-gray-600">We’ll suggest plans once your BMI and goal are set.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200">{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Plan rationale instead of week preview */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-10">
          <h3 className="font-semibold text-gray-900 mb-3">Why this plan is suggested for you</h3>
          <p className="text-sm text-gray-700 leading-6 mb-4">
            We consider your saved goal, current BMI, and activity level to recommend plans that
            best fit your targets and lifestyle.
          </p>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-2 mb-4">
            <li>
              <span className="font-medium text-gray-900">Goal</span>: {userData?.goal || '—'} — plan settings prioritize calories and macros aligned with this goal.
            </li>
            <li>
              <span className="font-medium text-gray-900">BMI</span>: {bmiInfo.bmi || '—'} ({bmiInfo.category || '—'}) — influences portion sizes and meal types.
            </li>
            <li>
              <span className="font-medium text-gray-900">Activity</span>: {userData?.activity || 'Sedentary'} — used to estimate daily energy needs.
            </li>
          </ul>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-800">
              Based on your profile, we suggest
              {" "}
              <span className="font-semibold text-gray-900">
                {suggestions.length > 0 ? suggestions.join(' or ') : (userData?.plan || 'a balanced plan')}
              </span>
              . {bmiInfo.category === 'Normal' ? 'You are in a healthy BMI range; balanced options help maintain progress.' : ''}
              {bmiInfo.category === 'Underweight' ? ' Higher-protein, calorie-dense meals can support healthy weight gain.' : ''}
              {bmiInfo.category === 'Overweight' || bmiInfo.category === 'Obese' ? ' Lower-carb, higher-satiety meals can help create a comfortable calorie deficit.' : ''}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              You can switch plans anytime. Changes will be reflected in future schedules.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}



