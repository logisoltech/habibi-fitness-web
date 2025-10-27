"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserData } from '../contexts/UserDataContext';

const GoalPage = () => {
    const router = useRouter();
    const { updateGoal, updateAllergies } = useUserData();

    // Goal selection state
    const [selectedGoal, setSelectedGoal] = useState(null);

    // Allergies state
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [customCondition, setCustomCondition] = useState('');
    const [customAllergies, setCustomAllergies] = useState([]);

    const goalOptions = [
        {
            name: 'Weight Gain',
            icon: '💪',
            description: 'Build muscle and increase body mass'
        },
        {
            name: 'Weight Loss',
            icon: '🔥',
            description: 'Burn fat and achieve your ideal weight'
        },
        {
            name: 'Staying Fit',
            icon: '⚡',
            description: 'Maintain your current fitness level'
        },
        {
            name: 'Eating Healthy',
            icon: '🥗',
            description: 'Focus on balanced, nutritious meals'
        },
        {
            name: 'Keto Diet',
            icon: '🥑',
            description: 'Low-carb, high-fat ketogenic approach'
        },
    ];

    const conditionOptions = [
        { name: 'Diabetes', icon: '💉' },
        { name: 'Dairy', icon: '🥛' },
        { name: 'High Blood Pressure', icon: '❤️' },
        { name: 'Shellfish', icon: '🦐' },
        { name: 'Gluten', icon: '🌾' },
        { name: 'Eggs', icon: '🥚' },
        { name: 'Nuts', icon: '🥜' },
        { name: 'Soy', icon: '🫘' }
    ];

    const toggleCondition = (value) => {
        setSelectedConditions((prev) =>
            prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value]
        );
    };

    const addCustomAllergy = () => {
        const trimmedCondition = customCondition.trim();
        if (trimmedCondition && !customAllergies.includes(trimmedCondition) && !selectedConditions.includes(trimmedCondition)) {
            setCustomAllergies((prev) => [...prev, trimmedCondition]);
            setCustomCondition('');
        }
    };

    const removeCustomAllergy = (allergyToRemove) => {
        setCustomAllergies((prev) => prev.filter((allergy) => allergy !== allergyToRemove));
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addCustomAllergy();
        }
    };

    const isFormValid = selectedGoal !== null;

  const handleSubmit = () => {
    if (!isFormValid) return;

    // Save goal to context
    updateGoal(selectedGoal);
    
    // Combine selected conditions and custom allergies, or use 'none' if empty
    const allergies = [...selectedConditions, ...customAllergies];
    updateAllergies(allergies.length > 0 ? allergies : ['none']);
    
    // Navigate to user-preference page (next step: dietary plan + meal selection)
    router.push('/user-preference');
  };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-30 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 -z-10"></div>

            {/* Progress Bar Section */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-700">Your Progress</span>
                        <span className="text-xs text-gray-500">Step 2 of 4</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full w-1/2 bg-gradient-to-r from-green-400 to-[#07da63] rounded-full transition-all duration-500 ease-out shadow-lg shadow-green-200"></div>
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Page Title */}
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
                        <span>
                            Your Fitness Journey
                        </span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Tell us about your goals and health considerations so we can personalize your meal plan
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">

                    {/* LEFT SIDE: Goal Selection */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-[#07da63] rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    Your Goal
                                </h2>
                                <p className="text-sm text-gray-500">Choose what you want to achieve</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-8 pl-15">
                            This will help us customize your nutrition plan perfectly for you
                        </p>

                        <div className="space-y-3">
                            {goalOptions.map((goal, index) => (
                                <button
                                    key={index}
                                    className={`group w-full p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${selectedGoal === goal.name
                                        ? 'bg-gradient-to-r from-green-400 to-[#07da63] border-[#07da63] text-white shadow-xl shadow-green-200'
                                        : 'bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-lg'
                                        }`}
                                    onClick={() => setSelectedGoal(goal.name)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`text-4xl transition-transform duration-300 ${selectedGoal === goal.name ? 'scale-110' : 'group-hover:scale-110'
                                            }`}>
                                            {goal.icon}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className={`font-bold text-lg mb-1 ${selectedGoal === goal.name ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                {goal.name}
                                            </div>
                                            <div className={`text-sm ${selectedGoal === goal.name ? 'text-white/90' : 'text-gray-500'
                                                }`}>
                                                {goal.description}
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedGoal === goal.name
                                            ? 'border-white bg-white'
                                            : 'border-gray-300'
                                            }`}>
                                            {selectedGoal === goal.name && (
                                                <div className="w-3 h-3 bg-[#07da63] rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SIDE: Allergies & Health Conditions */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-2xl">🏥</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    Health Profile
                                </h2>
                                <p className="text-sm text-gray-500">Allergies & conditions</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-8 pl-15">
                            Help us ensure your meals are safe and suitable for you
                        </p>

                        {/* Condition Options Grid */}
                        <div className="space-y-3 mb-6">
                            {/* First Row: Diabetes & Dairy */}
                            <div className="grid grid-cols-2 gap-3">
                                {conditionOptions.slice(0, 8).map((item, index) => (
                                    <button
                                        key={index}
                                        className={`group p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${selectedConditions.includes(item.name)
                                            ? 'bg-gradient-to-br from-[#07da63] to-green-600 border-[#07da63] text-white shadow-lg shadow-green-200'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-md'
                                            }`}
                                        onClick={() => toggleCondition(item.name)}
                                    >
                                        <div className="text-2xl mb-2">{item.icon}</div>
                                        <div className={`text-sm font-semibold ${selectedConditions.includes(item.name) ? 'text-white' : 'text-gray-700'
                                            }`}>
                                            {item.name}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Condition Section */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-100">
                            <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
                                <span className="text-xl">✏️</span>
                                Add Custom Allergies
                            </label>

                            {/* Custom Allergies Chips */}
                            {customAllergies.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {customAllergies.map((allergy, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center bg-gradient-to-r from-[#07da63] to-green-600 text-white rounded-full px-4 py-2 text-sm font-semibold shadow-lg shadow-green-200 animate-slide-in"
                                        >
                                            <span>{allergy}</span>
                                            <button
                                                onClick={() => removeCustomAllergy(allergy)}
                                                className="ml-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all hover:rotate-90 duration-200"
                                            >
                                                <span className="text-white font-bold text-lg leading-none">×</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customCondition}
                                    onChange={(e) => setCustomCondition(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type and press Enter..."
                                    className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#07da63] focus:border-transparent transition-all shadow-sm"
                                />
                                {customCondition.trim().length > 0 && (
                                    <button
                                        onClick={addCustomAllergy}
                                        className="bg-gradient-to-r from-[#07da63] to-green-600 text-white rounded-xl px-6 py-3 text-sm font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
                                    >
                                        Add
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => router.back()}
                            className="group w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all duration-200 hover:scale-110 shadow-md"
                        >
                            <svg
                                className="w-6 h-6 text-gray-600 group-hover:-translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={!isFormValid}
                            className={`group px-10 py-4 rounded-full flex items-center gap-3 font-bold text-lg transition-all duration-300 ${isFormValid
                                ? 'bg-gradient-to-r from-green-400 to-[#07da63] text-white hover:shadow-2xl hover:scale-105 shadow-xl shadow-green-200'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <span>Continue to Next Step</span>
                            <svg
                                className={`w-5 h-5 transition-transform ${isFormValid ? 'group-hover:translate-x-1' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default GoalPage;

