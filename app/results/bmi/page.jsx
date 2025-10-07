'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

export default function BMIResultsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [bmi, setBmi] = useState(0);
  const [category, setCategory] = useState('');
  const [categoryColor, setCategoryColor] = useState('');

  useEffect(() => {
    // Get user data from localStorage
    const storedData = localStorage.getItem('userData');
    if (!storedData) {
      router.push('/onboarding');
      return;
    }

    const data = JSON.parse(storedData);
    setUserData(data);

    // Calculate BMI
    const calculatedBMI = calculateBMI(data);
    setBmi(calculatedBMI);

    // Determine BMI category
    const { category: bmiCategory, color } = getBMICategory(calculatedBMI);
    setCategory(bmiCategory);
    setCategoryColor(color);
  }, [router]);

  const calculateBMI = (data) => {
    // Convert weight to kg if needed
    let weightInKg = data.weight;
    if (data.weightUnit === 'lbs') {
      weightInKg = data.weight / 2.20462;
    }

    // Convert height to meters if needed
    let heightInM = data.height / 100; // cm to m
    if (data.heightUnit === 'inches') {
      heightInM = (data.height * 2.54) / 100;
    }

    // BMI = weight(kg) / height(m)²
    const bmi = weightInKg / (heightInM * heightInM);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) {
      return { category: 'Underweight', color: '#3B82F6' };
    } else if (bmi < 25) {
      return { category: 'Normal', color: '#10B981' };
    } else if (bmi < 30) {
      return { category: 'Overweight', color: '#F59E0B' };
    } else {
      return { category: 'Obese', color: '#EF4444' };
    }
  };

  const getBMIPosition = (bmi) => {
    let position;

    if (bmi < 18.5) {
      position = (bmi / 18.5) * 0.25;
    } else if (bmi < 25) {
      position = 0.25 + ((bmi - 18.5) / (25 - 18.5)) * 0.25;
    } else if (bmi < 30) {
      position = 0.5 + ((bmi - 25) / (30 - 25)) * 0.25;
    } else {
      position = 0.75 + Math.min(((bmi - 30) / 10) * 0.25, 0.25);
    }

    return Math.max(5, Math.min(95, position * 100));
  };

  const getRecommendation = (category) => {
    switch (category) {
      case 'Underweight':
        return 'Consider consulting with a healthcare provider about healthy weight gain strategies. Focus on nutrient-dense foods and strength training.';
      case 'Normal':
        return 'Great! You\'re in the healthy weight range. Maintain your current lifestyle with balanced nutrition and regular exercise.';
      case 'Overweight':
        return 'Consider making small lifestyle changes like increasing physical activity and choosing healthier food options. Even a 5-10% weight loss can have health benefits.';
      case 'Obese':
        return 'It\'s recommended to consult with a healthcare provider to develop a personalized weight management plan. Small, sustainable changes can make a big difference.';
      default:
        return '';
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#07da63]"></div>
      </div>
    );
  }

  const bmiPosition = getBMIPosition(parseFloat(bmi));

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="px-5 pt-8 pb-4">
        <button
          onClick={() => router.push('/onboarding')}
          className="flex items-center text-gray-600 hover:text-black transition-colors"
        >
          <IoChevronBack className="text-2xl" />
          <span className="ml-2 font-semibold">Back</span>
        </button>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-center mb-12"
      >
        <span className="text-[#07da63]">We Have Calculated Your</span> BMI
      </motion.h1>

      {/* Main Content */}
      <div className="px-5 pb-32 max-w-4xl mx-auto flex flex-row gap-10">
        <div>
          {/* BMI Display Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#07da63] rounded-3xl p-6 text-center mb-6 shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              {bmi}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-2xl md:text-3xl font-semibold text-white"
            >
              {category}
            </motion.div>
          </motion.div>

          {/* BMI Scale */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-center mb-6">BMI Scale</h2>

            <div className="relative">
              {/* Color Scale */}
              <div className="flex rounded-xl overflow-hidden h-16 mb-4">
                <div className="flex-1 bg-[#3B82F6] flex flex-col items-center justify-center">
                  <span className="text-white text-xs font-bold">Underweight</span>
                  <span className="text-white text-[10px]">&lt;18.5</span>
                </div>
                <div className="flex-1 bg-[#10B981] flex flex-col items-center justify-center">
                  <span className="text-white text-xs font-bold">Normal</span>
                  <span className="text-white text-[10px]">18.5-24.9</span>
                </div>
                <div className="flex-1 bg-[#F59E0B] flex flex-col items-center justify-center">
                  <span className="text-white text-xs font-bold">Overweight</span>
                  <span className="text-white text-[10px]">25-29.9</span>
                </div>
                <div className="flex-1 bg-[#EF4444] flex flex-col items-center justify-center">
                  <span className="text-white text-xs font-bold">Obese</span>
                  <span className="text-white text-[10px]">≥30</span>
                </div>
              </div>

              {/* BMI Indicator */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, type: "spring" }}
                className="absolute top-20"
                style={{ left: `${bmiPosition}%`, transform: 'translateX(-50%)' }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-black"></div>
                  <div className="bg-black text-white px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                    BMI = {bmi}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="bg-gray-50 rounded-2xl p-6 mb-8"
          >
            <p className="text-lg text-gray-700 text-center leading-relaxed">
              Your BMI is <span className="font-bold text-[#07da63]">{bmi}</span>, which falls within the{' '}
              <span className="font-bold" style={{ color: categoryColor }}>
                {category.toLowerCase()}
              </span>{' '}
              range.
            </p>
          </motion.div>
        </div>

        <div>
          {/* Recommendation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              Recommendation
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {getRecommendation(category)}
            </p>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-5"
          >
            <p className="text-sm text-gray-600 text-center">
              <strong>Note:</strong> BMI is a screening tool and doesn't directly measure body fat or health.
              Consult with a healthcare professional for personalized advice.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/results/tdee')}
          className="w-full bg-[#07da63] text-white py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          Calculate TDEE
          <IoChevronForward className="text-2xl" />
        </motion.button>
      </div>
    </div>
  );
}

