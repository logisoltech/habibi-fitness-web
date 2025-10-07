'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { IoChevronBack, IoFitness, IoTrendingDown, IoTrendingUp, IoRemoveCircle } from 'react-icons/io5';

export default function TDEEResultsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [bmr, setBmr] = useState(0);
  const [tdee, setTdee] = useState(0);
  const [activityMultiplier, setActivityMultiplier] = useState(0);

  useEffect(() => {
    // Get user data from localStorage
    const storedData = localStorage.getItem('userData');
    if (!storedData) {
      router.push('/onboarding');
      return;
    }

    const data = JSON.parse(storedData);
    setUserData(data);

    // Calculate BMR and TDEE
    const calculatedBMR = calculateBMR(data);
    const multiplier = getActivityMultiplier(data.activityLevel);
    const calculatedTDEE = Math.round(calculatedBMR * multiplier);

    setBmr(calculatedBMR);
    setTdee(calculatedTDEE);
    setActivityMultiplier(multiplier);
  }, [router]);

  const calculateBMR = (data) => {
    // Convert weight to kg if needed
    let weightInKg = data.weight;
    if (data.weightUnit === 'lbs') {
      weightInKg = data.weight / 2.20462;
    }

    // Convert height to cm if needed
    let heightInCm = data.height;
    if (data.heightUnit === 'inches') {
      heightInCm = data.height * 2.54;
    }

    const age = data.age;
    const gender = data.gender;

    let bmr;
    if (gender.toLowerCase() === 'male') {
      // Mifflin-St Jeor Equation for men: 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) + 5
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) + 5;
    } else {
      // Mifflin-St Jeor Equation for women: 10 × weight(kg) + 6.25 × height(cm) - 5 × age(y) - 161
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) - 161;
    }

    return Math.round(bmr);
  };

  const getActivityMultiplier = (activityLevel) => {
    const multipliers = {
      'Sedentary': 1.2,
      'Light': 1.375,
      'Moderate': 1.55,
      'Active': 1.725,
      'Very Active': 1.9,
    };
    return multipliers[activityLevel] || 1.2;
  };

  const getActivityDescription = (activityLevel) => {
    const descriptions = {
      'Sedentary': 'Little or no exercise',
      'Light': 'Exercise 1-3 times per week',
      'Moderate': 'Exercise 4-5 times per week',
      'Active': 'Daily Exercise',
      'Very Active': 'Intense exercise 6-7 times per week',
    };
    return descriptions[activityLevel] || 'Not specified';
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#07da63]"></div>
      </div>
    );
  }

  const maintenanceCalories = tdee;
  const aggressiveCutCalories = Math.round(tdee * 0.8); // 20% deficit
  const moderateCutCalories = Math.round(tdee * 0.9); // 10% deficit
  const leanBulkCalories = Math.round(tdee * 1.1); // 10% surplus
  const aggressiveBulkCalories = Math.round(tdee * 1.15); // 15% surplus

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="px-5 pt-8 pb-4">
        <button
          onClick={() => router.push('/results/bmi')}
          className="flex items-center text-gray-600 hover:text-black transition-colors"
        >
          <IoChevronBack className="text-2xl" />
          <span className="ml-2 font-semibold">Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-5 pb-32 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold text-center mb-12 leading-tight"
        >
          <span className="text-[#07da63]">Your Total Daily</span> Energy Expenditure
        </motion.h1>

        {/* TDEE Display Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#07da63] rounded-3xl p-12 text-center mb-8 shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="text-7xl md:text-8xl font-bold text-white mb-2"
          >
            {tdee}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl font-semibold text-white"
          >
            calories/day
          </motion.div>
        </motion.div>

        {/* Activity Level Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-50 rounded-2xl p-5 mb-8"
        >
          <div className="flex items-center mb-2">
            <IoFitness className="text-[#07da63] text-2xl mr-3" />
            <span className="text-lg font-bold text-gray-900">{userData.activityLevel}</span>
          </div>
          <p className="text-gray-600 ml-9">{getActivityDescription(userData.activityLevel)}</p>
        </motion.div>

        {/* Metabolism Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Your Metabolism Breakdown</h2>
          
          <div className="space-y-4">
            {/* BMR Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">Basal Metabolic Rate (BMR)</span>
                <span className="text-2xl font-bold text-[#07da63]">{bmr} cal</span>
              </div>
              <p className="text-sm text-gray-600">Calories burned at complete rest</p>
            </div>

            {/* Activity Multiplier Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">Activity Multiplier</span>
                <span className="text-2xl font-bold text-[#07da63]">×{activityMultiplier}</span>
              </div>
              <p className="text-sm text-gray-600">Based on your activity level</p>
            </div>

            {/* TDEE Card */}
            <div className="bg-green-50 border-2 border-[#07da63] rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">Total Daily Energy</span>
                <span className="text-2xl font-bold text-[#07da63]">{tdee} cal</span>
              </div>
              <p className="text-sm text-gray-600">Calories needed to maintain current weight</p>
            </div>
          </div>
        </motion.div>

        {/* Calorie Goals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Recommended Calorie Goals</h2>

          <div className="space-y-4">
            {/* Weight Loss Card */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#07da63] transition-all">
              <div className="flex items-center mb-4 pb-3 border-b border-gray-200">
                <IoTrendingDown className="text-[#07da63] text-3xl mr-3" />
                <h3 className="text-xl font-bold">Weight Loss</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Aggressive Cut (20% deficit)</p>
                  <p className="text-3xl font-bold text-[#07da63]">{aggressiveCutCalories} cal/day</p>
                  <p className="text-sm text-gray-500 italic">~0.9 kg per week</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">Moderate Cut (10% deficit)</p>
                  <p className="text-3xl font-bold text-[#07da63]">{moderateCutCalories} cal/day</p>
                  <p className="text-sm text-gray-500 italic">~0.45 kg per week</p>
                </div>
              </div>
            </div>

            {/* Maintenance Card */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#07da63] transition-all">
              <div className="flex items-center mb-4 pb-3 border-b border-gray-200">
                <IoRemoveCircle className="text-[#07da63] text-3xl mr-3" />
                <h3 className="text-xl font-bold">Maintenance</h3>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Maintain Current Weight</p>
                <p className="text-3xl font-bold text-[#07da63]">{maintenanceCalories} cal/day</p>
                <p className="text-sm text-gray-500 italic">No change expected</p>
              </div>
            </div>

            {/* Weight Gain Card */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#07da63] transition-all">
              <div className="flex items-center mb-4 pb-3 border-b border-gray-200">
                <IoTrendingUp className="text-[#07da63] text-3xl mr-3" />
                <h3 className="text-xl font-bold">Weight Gain</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Lean Bulk (10% surplus)</p>
                  <p className="text-3xl font-bold text-[#07da63]">{leanBulkCalories} cal/day</p>
                  <p className="text-sm text-gray-500 italic">~0.45 kg per week</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">Aggressive Bulk (15% surplus)</p>
                  <p className="text-3xl font-bold text-[#07da63]">{aggressiveBulkCalories} cal/day</p>
                  <p className="text-sm text-gray-500 italic">~0.7 kg per week</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Important Notes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
            <span className="text-2xl mr-2">📝</span>
            Important Notes
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>These are estimates based on the Mifflin-St Jeor equation</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Individual results may vary based on metabolism</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Adjust calories based on your progress</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Consult a healthcare provider for personalized advice</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dashboard')}
          className="w-full bg-[#07da63] text-white py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
        >
          Continue to Dashboard
        </motion.button>
      </div>
    </div>
  );
}

