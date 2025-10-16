'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { IoMan, IoWoman, IoFitness, IoCheckmarkCircle } from 'react-icons/io5';
import { useUserData } from '../contexts/UserDataContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { 
    userData,
    updateWeight, 
    updateHeight, 
    updateName, 
    updatePersonalInfo, 
    updateAddress, 
    updateActivityLevel 
  } = useUserData();
  
  // Weight states - Initialize from context if available
  const [weight, setWeight] = useState(userData.weight || 70);
  const [weightUnit, setWeightUnit] = useState(userData.weightUnit || 'kg');
  
  // Height states - Initialize from context if available
  const [height, setHeight] = useState(userData.height || 170);
  const [heightUnit, setHeightUnit] = useState(userData.heightUnit || 'cm');
  
  // Personal details states - Initialize from context if available
  const [age, setAge] = useState(userData.age ? userData.age.toString() : '');
  const [gender, setGender] = useState(userData.gender || '');
  const [address, setAddress] = useState(userData.address || '');
  const [activityLevel, setActivityLevel] = useState(userData.activity || 'Moderate');
  const [showActivityModal, setShowActivityModal] = useState(false);
  
  const activityLevels = [
    { value: 'Sedentary', label: 'Sedentary', description: 'little or no exercise' },
    { value: 'Light', label: 'Light', description: 'exercise 1-3 times/week' },
    { value: 'Moderate', label: 'Moderate', description: 'exercise 4-5 times/week' },
    { value: 'Active', label: 'Active', description: 'Daily Exercise' },
    { value: 'Very Active', label: 'Very Active', description: 'intense exercise 6-7 times/week' },
  ];

  // Weight conversion
  const minWeight = weightUnit === 'kg' ? 30 : 66;
  const maxWeight = weightUnit === 'kg' ? 200 : 440;

  const convertWeight = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'kg' && toUnit === 'lbs') return Math.round(value * 2.20462);
    if (fromUnit === 'lbs' && toUnit === 'kg') return Math.round(value / 2.20462);
    return value;
  };

  const handleWeightUnitChange = (newUnit) => {
    if (newUnit !== weightUnit) {
      const convertedWeight = convertWeight(weight, weightUnit, newUnit);
      setWeight(convertedWeight);
      setWeightUnit(newUnit);
      // Update context in real-time
      updateWeight(convertedWeight, newUnit);
    }
  };

  // Update context when weight changes
  const handleWeightChange = (newWeight) => {
    setWeight(newWeight);
    updateWeight(newWeight, weightUnit);
  };

  // Height conversion
  const minHeight = heightUnit === 'cm' ? 100 : 39;
  const maxHeight = heightUnit === 'cm' ? 250 : 98;

  const convertHeight = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'cm' && toUnit === 'inches') return Math.round(value / 2.54);
    if (fromUnit === 'inches' && toUnit === 'cm') return Math.round(value * 2.54);
    return value;
  };

  const handleHeightUnitChange = (newUnit) => {
    if (newUnit !== heightUnit) {
      const convertedHeight = convertHeight(height, heightUnit, newUnit);
      setHeight(convertedHeight);
      setHeightUnit(newUnit);
      // Update context in real-time
      updateHeight(convertedHeight, newUnit);
    }
  };

  // Update context when height changes
  const handleHeightChange = (newHeight) => {
    setHeight(newHeight);
    updateHeight(newHeight, heightUnit);
  };

  const isFormValid = () => {
    return age.trim() && gender && address.trim() && activityLevel;
  };

  const handleSubmit = () => {
    if (!isFormValid()) return;
    
    // Save all data to UserDataContext
    updateWeight(weight, weightUnit);
    updateHeight(height, heightUnit);
    updatePersonalInfo(parseInt(age), gender);
    updateAddress(address);
    updateActivityLevel(activityLevel);
    
    // Also save to localStorage as backup
    const userDataBackup = {
      weight,
      weightUnit,
      height,
      heightUnit,
      age: parseInt(age),
      gender,
      address,
      activityLevel
    };
    localStorage.setItem('userData', JSON.stringify(userDataBackup));
    
    // Navigate to goal page (next step in registration)
    router.push('/goal');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Let's Calculate Your <span className="text-[#07da63]">Fitness Metrics</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl">
            Enter your details below to get your personalized BMI and TDEE
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
        >
          {/* Left Column - Body Metrics */}
          <div className="space-y-6">
            {/* Weight Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-lg p-6 md:p-8 card-hover">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Weight</h2>
                <div className="flex bg-gray-100 rounded-full p-1">
                  <button
                    onClick={() => handleWeightUnitChange('kg')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      weightUnit === 'kg' ? 'bg-[#FFD700] text-black' : 'text-gray-600'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    onClick={() => handleWeightUnitChange('lbs')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      weightUnit === 'lbs' ? 'bg-[#FFD700] text-black' : 'text-gray-600'
                    }`}
                  >
                    lbs
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#F5F5DC] to-[#f0efd0] rounded-2xl p-8 mb-6">
                <motion.div
                  key={weight}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  <div className="text-6xl md:text-7xl font-bold text-gray-800">{weight}</div>
                  <div className="text-xl text-gray-600 mt-2">{weightUnit}</div>
                </motion.div>
              </div>

              <input
                type="range"
                min={minWeight}
                max={maxWeight}
                value={weight}
                onChange={(e) => handleWeightChange(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#07da63]"
                style={{
                  background: `linear-gradient(to right, #07da63 0%, #07da63 ${((weight - minWeight) / (maxWeight - minWeight)) * 100}%, #e0e0e0 ${((weight - minWeight) / (maxWeight - minWeight)) * 100}%, #e0e0e0 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{minWeight}</span>
                <span>{maxWeight}</span>
              </div>
            </motion.div>

            {/* Height Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-lg p-6 md:p-8 card-hover">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Height</h2>
                <div className="flex bg-gray-100 rounded-full p-1">
                  <button
                    onClick={() => handleHeightUnitChange('cm')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      heightUnit === 'cm' ? 'bg-[#FFD700] text-black' : 'text-gray-600'
                    }`}
                  >
                    cm
                  </button>
                  <button
                    onClick={() => handleHeightUnitChange('inches')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      heightUnit === 'inches' ? 'bg-[#FFD700] text-black' : 'text-gray-600'
                    }`}
                  >
                    inches
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#a9eda5] to-[#93e38e] rounded-2xl p-8 mb-6">
                <motion.div
                  key={height}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  <div className="text-6xl md:text-7xl font-bold text-gray-800">{height}</div>
                  <div className="text-xl text-gray-600 mt-2">{heightUnit}</div>
                </motion.div>
              </div>

              <input
                type="range"
                min={minHeight}
                max={maxHeight}
                value={height}
                onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#07da63]"
                style={{
                  background: `linear-gradient(to right, #07da63 0%, #07da63 ${((height - minHeight) / (maxHeight - minHeight)) * 100}%, #e0e0e0 ${((height - minHeight) / (maxHeight - minHeight)) * 100}%, #e0e0e0 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{minHeight}</span>
                <span>{maxHeight}</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Personal Details */}
          <div className="space-y-6">
            {/* Personal Information Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-lg p-6 md:p-8 card-hover">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
              
              <div className="space-y-5">
                {/* Age Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#07da63] focus:border-transparent transition-all"
                  />
                </div>

                {/* Gender Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Gender
                  </label>
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGender('male')}
                      className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        gender === 'male' 
                          ? 'border-[#07da63] bg-green-50' 
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <IoMan className={`text-4xl ${gender === 'male' ? 'text-[#07da63]' : 'text-gray-400'}`} />
                      <span className={`font-medium ${gender === 'male' ? 'text-[#07da63]' : 'text-gray-600'}`}>
                        Male
                      </span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGender('female')}
                      className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        gender === 'female' 
                          ? 'border-[#07da63] bg-green-50' 
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <IoWoman className={`text-4xl ${gender === 'female' ? 'text-[#07da63]' : 'text-gray-400'}`} />
                      <span className={`font-medium ${gender === 'female' ? 'text-[#07da63]' : 'text-gray-600'}`}>
                        Female
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Address & Activity Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-lg p-6 md:p-8 card-hover">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Additional Details</h2>
              
              <div className="space-y-5">
                {/* Address Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    placeholder="Enter your delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#07da63] focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Activity Level
                  </label>
                  <button
                    onClick={() => setShowActivityModal(true)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-left flex justify-between items-center hover:border-[#07da63] transition-all group"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{activityLevel}</div>
                      <div className="text-sm text-gray-500">
                        {activityLevels.find(l => l.value === activityLevel)?.description}
                      </div>
                    </div>
                    <IoFitness className="text-[#07da63] text-2xl group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className={`px-12 py-4 rounded-full font-bold text-lg text-white shadow-xl flex items-center gap-3 transition-all ${
              isFormValid() 
                ? 'bg-[#07da63] hover:shadow-2xl' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <span>Calculate BMI & TDEE</span>
            <IoCheckmarkCircle className="text-2xl" />
          </motion.button>
        </motion.div>

        {/* Activity Level Modal */}
        {showActivityModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowActivityModal(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900">Select Activity Level</h3>
                  <button
                    onClick={() => setShowActivityModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-3">
                  {activityLevels.map((level, index) => (
                    <motion.button
                      key={level.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        setActivityLevel(level.value);
                        setShowActivityModal(false);
                      }}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        activityLevel === level.value
                          ? 'bg-green-50 border-2 border-[#07da63] shadow-md'
                          : 'bg-gray-50 border-2 border-gray-200 hover:border-[#07da63] hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className={`font-semibold text-lg ${
                            activityLevel === level.value ? 'text-[#07da63]' : 'text-gray-900'
                          }`}>
                            {level.label}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {level.description}
                          </div>
                        </div>
                        {activityLevel === level.value && (
                          <IoCheckmarkCircle className="text-[#07da63] text-3xl" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
