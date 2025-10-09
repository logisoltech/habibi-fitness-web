"use client";

import React, { createContext, useContext, useState } from 'react';
import ApiService from '../services/api';

// Create the context
const UserDataContext = createContext();

// Context provider component
export const UserDataProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    name: null,
    phone: null,
    age: null,
    gender: null,
    address: null,
    activity: null, // Activity level
    
    // Body Measurements
    weight: 70, // Default weight in kg
    weightUnit: 'kg',
    height: 170, // Default height in cm
    heightUnit: 'cm',
    
    // Goals and Preferences
    plan: null, // From foodprefer.js (selected meal/dietary plan)
    goal: null, // From detailform.js (what they want to achieve)
    allergies: [], // From allergies.js (array of selected allergies and health conditions)
    
    // Subscription and counts
    mealcount: null, // From howmany.js or meals selection
    mealtypes: null, // Selected meal types (breakfast, lunch, etc.)
    selecteddays: null, // Selected days of the week (MON, TUE, etc.)
    subscription: null, // Subscription type if applicable
    
    // Payment information
    cardnumber: null,
    cvc: null,
    expiry: null,
    service: null, // Service provider (VISA, Mastercard, etc.)
    
    // Calculated fields
    bmi: null,
    tdee: null, // Total Daily Energy Expenditure based on goal
    
    // Registration status
    isRegistered: false,
    userId: null,
  });

  // Function to update weight
  const updateWeight = (weight, unit = 'kg') => {
    setUserData(prev => ({
      ...prev,
      weight,
      weightUnit: unit
    }));
  };

  // Function to update height
  const updateHeight = (height, unit = 'cm') => {
    setUserData(prev => ({
      ...prev,
      height,
      heightUnit: unit
    }));
  };

  // Function to update name
  const updateName = (name) => {
    setUserData(prev => ({
      ...prev,
      name
    }));
  };

  // Function to update age and gender
  const updatePersonalInfo = (age, gender) => {
    setUserData(prev => ({
      ...prev,
      age,
      gender
    }));
  };

  // Function to update phone number
  const updatePhone = (phone) => {
    setUserData(prev => ({
      ...prev,
      phone
    }));
  };

  // Function to update address
  const updateAddress = (address) => {
    setUserData(prev => ({
      ...prev,
      address
    }));
  };

  // Function to update activity level
  const updateActivityLevel = (activity) => {
    setUserData(prev => ({
      ...prev,
      activity
    }));
  };

  // Function to update payment information
  const updatePaymentInfo = (cardnumber, cvc, expiry, service) => {
    setUserData(prev => ({
      ...prev,
      cardnumber,
      cvc,
      expiry,
      service
    }));
  };

  // Function to update TDEE
  const updateTDEE = (tdee) => {
    setUserData(prev => ({
      ...prev,
      tdee
    }));
  };

  // Function to update plan (from foodprefer.js)
  const updatePlan = (plan) => {
    setUserData(prev => ({
      ...prev,
      plan
    }));
  };

  // Function to update goal (from detailform.js)
  const updateGoal = (goal) => {
    setUserData(prev => ({
      ...prev,
      goal
    }));
  };

  // Function to update allergies (from allergies.js)
  const updateAllergies = (allergies) => {
    setUserData(prev => ({
      ...prev,
      allergies
    }));
  };

  // Function to update meal count
  const updateMealCount = (mealcount) => {
    setUserData(prev => ({
      ...prev,
      mealcount
    }));
  };

  // Function to update meal types
  const updateMealTypes = (mealtypes) => {
    setUserData(prev => ({
      ...prev,
      mealtypes
    }));
  };

  // Function to update selected days
  const updateSelectedDays = (selecteddays) => {
    setUserData(prev => ({
      ...prev,
      selecteddays
    }));
  };

  // Function to update subscription
  const updateSubscription = (subscription) => {
    setUserData(prev => ({
      ...prev,
      subscription
    }));
  };

  // Function to calculate BMI in real-time
  const calculateBMI = () => {
    let weightInKg = userData.weight;
    let heightInM = userData.height;

    // Convert weight to kg if needed
    if (userData.weightUnit === 'lbs') {
      weightInKg = userData.weight / 2.20462;
    }

    // Convert height to meters if needed
    if (userData.heightUnit === 'inches') {
      heightInM = (userData.height * 2.54) / 100;
    } else {
      heightInM = userData.height / 100; // cm to meters
    }

    const bmi = weightInKg / (heightInM * heightInM);
    return Math.round(bmi * 10) / 10; // Round to 1 decimal place
  };

  // Function to get BMI category and color
  const getBMIInfo = () => {
    const bmi = calculateBMI();
    let category, color;

    if (bmi < 18.5) {
      category = 'Underweight';
      color = '#ffc34d'; // Yellow
    } else if (bmi < 25) {
      category = 'Normal';
      color = '#07da63'; // Green
    } else if (bmi < 30) {
      category = 'Overweight';
      color = '#ff7f7f'; // Red
    } else {
      category = 'Obese';
      color = '#ff7f7f'; // Red
    }

    return { bmi, category, color };
  };

  // Function to check if a meal contains any user allergies
  const checkMealForAllergies = (meal) => {
    if (!userData.allergies || userData.allergies.length === 0) {
      return { isSafe: true, conflictingAllergies: [] };
    }

    if (!meal.ingredients || !Array.isArray(meal.ingredients)) {
      return { isSafe: true, conflictingAllergies: [] };
    }

    const conflictingAllergies = [];
    const userAllergies = userData.allergies.map(allergy => allergy.toLowerCase());
    
    // Enhanced allergen matching with common variations
    const allergenVariations = {
      'eggs': ['egg', 'eggs', 'egg white', 'egg yolk', 'scrambled', 'fried egg', 'boiled egg', 'omelet', 'omelette'],
      'dairy': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt', 'dairy', 'lactose'],
      'nuts': ['nuts', 'almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut', 'macadamia'],
      'gluten': ['wheat', 'gluten', 'flour', 'bread', 'pasta', 'barley', 'rye'],
      'shellfish': ['shrimp', 'crab', 'lobster', 'shellfish', 'prawns', 'scallops'],
      'soy': ['soy', 'soya', 'tofu', 'soy sauce', 'soybeans'],
    };

    // Check ingredients against user allergies with variations
    meal.ingredients.forEach(ingredient => {
      const ingredientLower = ingredient.toLowerCase();
      
      userAllergies.forEach(allergy => {
        // Direct match
        if (ingredientLower.includes(allergy) || allergy.includes(ingredientLower)) {
          if (!conflictingAllergies.includes(allergy)) {
            conflictingAllergies.push(allergy);
          }
          return;
        }

        // Check variations
        const variations = allergenVariations[allergy] || [allergy];
        variations.forEach(variation => {
          if (ingredientLower.includes(variation)) {
            if (!conflictingAllergies.includes(allergy)) {
              conflictingAllergies.push(allergy);
            }
          }
        });
      });
    });

    // Also check meal name and description for common allergens
    const mealText = `${meal.name || ''} ${meal.description || ''}`.toLowerCase();
    userAllergies.forEach(allergy => {
      // Direct match in meal text
      if (mealText.includes(allergy)) {
        if (!conflictingAllergies.includes(allergy)) {
          conflictingAllergies.push(allergy);
        }
        return;
      }

      // Check variations in meal text
      const variations = allergenVariations[allergy] || [allergy];
      variations.forEach(variation => {
        if (mealText.includes(variation)) {
          if (!conflictingAllergies.includes(allergy)) {
            conflictingAllergies.push(allergy);
          }
        }
      });
    });

    return {
      isSafe: conflictingAllergies.length === 0,
      conflictingAllergies: conflictingAllergies
    };
  };

  // Function to filter meals based on user allergies
  const filterMealsByAllergies = (meals) => {
    if (!userData.allergies || userData.allergies.length === 0) {
      return meals;
    }

    return meals.filter(meal => {
      const allergyCheck = checkMealForAllergies(meal);
      return allergyCheck.isSafe;
    });
  };

  // Function to calculate TDEE based on user's goal
  const calculateTDEEForGoal = () => {
    // Calculate BMR using Mifflin-St Jeor Equation
    let weightInKg = userData.weight;
    if (userData.weightUnit === 'lbs') {
      weightInKg = userData.weight / 2.20462;
    }

    let heightInCm = userData.height;
    if (userData.heightUnit === 'inches') {
      heightInCm = userData.height * 2.54;
    }

    const age = userData.age || 25;
    const gender = userData.gender || 'Male';

    let bmr;
    if (gender.toLowerCase() === 'male') {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) + 5;
    } else {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) - 161;
    }

    // Get activity multiplier
    const activity = userData.activity || 'Sedentary';
    const multipliers = {
      'Sedentary': 1.2,
      'Light': 1.375,
      'Moderate': 1.55,
      'Active': 1.725,
      'Very Active': 1.9,
    };
    const multiplier = multipliers[activity] || 1.2;

    // Calculate base TDEE
    const baseTDEE = Math.round(bmr * multiplier);

    // Adjust based on goal
    const goal = userData.goal;
    let finalTDEE;

    switch (goal) {
      case 'Weight Loss':
        finalTDEE = Math.round(baseTDEE * 0.8); // Aggressive Cut - 20% deficit
        break;
      case 'Weight Gain':
        finalTDEE = Math.round(baseTDEE * 1.15); // Aggressive Bulk - 15% surplus
        break;
      case 'Staying Fit':
      case 'Eating Healthy':
      case 'Keto Diet':
        finalTDEE = baseTDEE; // Maintenance
        break;
      default:
        finalTDEE = baseTDEE; // Default to maintenance
    }

    return finalTDEE;
  };

  // Function to register user (save to database)
  // Accepts optional overrides for values that might not be in context yet
  const registerUser = async (overrides = {}) => {
    try {
      // Calculate BMI before saving
      const bmiInfo = getBMIInfo();
      
      // Calculate TDEE based on goal
      const calculatedTDEE = calculateTDEEForGoal();
      
      // Merge userData with overrides (overrides take precedence)
      const mergedData = { ...userData, ...overrides };
      
      // Prepare user data for database
      const registrationData = {
        name: mergedData.name,
        phone: mergedData.phone,
        address: mergedData.address,
        activity: mergedData.activity,
        plan: mergedData.plan,
        goal: mergedData.goal,
        weight: mergedData.weight.toString(),
        height: mergedData.height.toString(),
        age: mergedData.age?.toString(),
        gender: mergedData.gender,
        mealcount: mergedData.mealcount?.toString(),
        mealtypes: mergedData.mealtypes,
        selecteddays: mergedData.selecteddays,
        subscription: mergedData.subscription || 'monthly', // Default to monthly
        bmi: bmiInfo.bmi.toString(),
        tdee: calculatedTDEE.toString(), // TDEE based on goal
        allergies: mergedData.allergies, // Array of allergies/health conditions
        // Payment fields - optional for now (can be added later)
        cardnumber: mergedData.cardnumber || null,
        cvc: mergedData.cvc || null,
        expiry: mergedData.expiry || null,
        service: mergedData.service || null,
      };

      console.log('📤 Sending registration data to API:', registrationData);

      const result = await ApiService.createUser(registrationData);

      if (result.success) {
        // Update context with registration success AND the final merged data
        setUserData(prev => ({
          ...prev,
          ...mergedData, // Update with merged data
          isRegistered: true,
          userId: result.data.id,
          bmi: bmiInfo.bmi,
          tdee: calculatedTDEE,
        }));
        
        return { success: true, user: result.data };
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to check if user exists by phone
  const checkUserExists = async (phone) => {
    try {
      const result = await ApiService.getUserByPhone(phone);
      return { exists: true, user: result.data };
    } catch (error) {
      if (error.message.includes('User not found')) {
        return { exists: false };
      }
      throw error;
    }
  };

  // Function to load existing user data
  const loadUserData = (user) => {
    setUserData(prev => ({
      ...prev,
      name: user.name,
      phone: user.phone,
      address: user.address,
      activity: user.activity,
      plan: user.plan,
      goal: user.goal,
      weight: parseInt(user.weight) || 70,
      height: parseInt(user.height) || 170,
      age: parseInt(user.age) || null,
      gender: user.gender,
      mealcount: parseInt(user.mealcount) || null,
      mealtypes: user.mealtypes ? (typeof user.mealtypes === 'string' ? JSON.parse(user.mealtypes) : user.mealtypes) : ['lunch', 'dinner'],
      selecteddays: user.selecteddays ? (typeof user.selecteddays === 'string' ? JSON.parse(user.selecteddays) : user.selecteddays) : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      subscription: user.subscription,
      bmi: parseFloat(user.bmi) || null,
      tdee: parseFloat(user.tdee) || null,
      allergies: user.allergies || [], // Load allergies array or empty array if not present
      cardnumber: user.cardnumber,
      cvc: user.cvc,
      expiry: user.expiry,
      service: user.service,
      isRegistered: true,
      userId: user.id,
    }));
  };

  const value = {
    userData,
    updateWeight,
    updateHeight,
    updateName,
    updatePersonalInfo,
    updatePhone,
    updateAddress,
    updateActivityLevel,
    updatePaymentInfo,
    updateTDEE,
    updatePlan,
    updateGoal,
    updateAllergies,
    updateMealCount,
    updateMealTypes,
    updateSelectedDays,
    updateSubscription,
    calculateBMI,
    getBMIInfo,
    checkMealForAllergies,
    filterMealsByAllergies,
    registerUser,
    checkUserExists,
    loadUserData,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

// Custom hook to use the context
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

export default UserDataContext;


