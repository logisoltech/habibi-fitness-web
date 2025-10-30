"use client";

import { useMemo } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { font } from "../../components/font/font";
import { useUserData } from "../../contexts/UserDataContext";

export default function BMIPage() {
  const { userData, calculateBMI } = useUserData();

  const weightKg = Number(userData?.weight || 0);
  const heightCm = Number(userData?.height || 0);
  const bmi = useMemo(() => calculateBMI(), [calculateBMI, weightKg, heightCm]);

  const bmiCategory = useMemo(() => {
    if (bmi === 0) return { label: "—", color: "bg-gray-300" };
    if (bmi < 18.5) return { label: "Underweight", color: "bg-blue-400" };
    if (bmi < 25) return { label: "Normal", color: "bg-green-500" };
    if (bmi < 30) return { label: "Overweight", color: "bg-yellow-400" };
    return { label: "Obese", color: "bg-red-500" };
  }, [bmi]);

  const segments = [
    { label: "Underweight", range: "< 18.5", color: "bg-blue-400", width: "w-[20%]" },
    { label: "Normal", range: "18.5 – 24.9", color: "bg-green-500", width: "w-[35%]" },
    { label: "Overweight", range: "25 – 29.9", color: "bg-yellow-400", width: "w-[25%]" },
    { label: "Obese", range: "≥ 30", color: "bg-red-500", width: "w-[20%]" },
  ];

  const indicatorLeft = useMemo(() => {
    // Map BMI to 0–100 scale based on common bounds 14–40
    const min = 14;
    const max = 40;
    const clamped = Math.max(min, Math.min(max, bmi || 0));
    const pct = ((clamped - min) / (max - min)) * 100;
    return `${pct}%`;
  }, [bmi]);

  return (
    <>
      <Header />
      <div className={`${font.className} max-w-4xl mx-auto px-6 py-10 mt-[100px]`}>
        <h1 className="text-3xl font-bold mt-12 text-gray-900 mb-2">Your BMI</h1>
        <p className="text-gray-600 mb-8">Based on your saved height and weight</p>

        {/* Result card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Your BMI</p>
              <p className="text-4xl font-extrabold text-gray-900">{bmi || "—"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Category</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${bmiCategory.color}`}>
                {bmiCategory.label}
              </span>
            </div>
          </div>

          {/* Saved stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500">Height</p>
              <p className="text-lg font-semibold text-gray-900">{heightCm || "—"} cm</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500">Weight</p>
              <p className="text-lg font-semibold text-gray-900">{weightKg || "—"} kg</p>
            </div>
          </div>

          {/* BMI Chart */}
          <div className="mt-6">
            <div className="flex w-full h-4 rounded-full overflow-hidden">
              {segments.map((s, idx) => (
                <div key={idx} className={`${s.color} ${s.width}`} />
              ))}
            </div>
            {/* Ticks */}
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
            </div>
            {/* Indicator */}
            <div className="relative mt-4 h-6">
              <div className="absolute -top-3 -translate-x-1/2" style={{ left: indicatorLeft }}>
                <div className="flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-green-500" />
                  <div className="text-xs text-gray-700 mt-1">{bmi || "—"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">What is BMI?</h3>
            <p className="text-sm text-gray-600 leading-6">
              Body Mass Index (BMI) is a simple index of weight-for-height used to
              classify underweight, normal weight, overweight and obesity in adults.
              It is calculated as weight in kilograms divided by the square of height in meters.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Limitations</h3>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Does not directly measure body fat.</li>
              <li>May misclassify muscular individuals.</li>
              <li>Other factors like age, sex, and fitness matter.</li>
            </ul>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">BMI Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {segments.map((s, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-sm ${s.color}`} />
                <div className="text-gray-800 font-medium w-36">{s.label}</div>
                <div className="text-gray-500">{s.range}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}


