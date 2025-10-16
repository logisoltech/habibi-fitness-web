# Habibi Fitness - Complete User Registration Flow Documentation

## Overview
This document provides a **complete, implementation-ready guide** for the user registration flow. Use this as instructions for building the registration system in any platform (web, mobile, etc.).

---

## Table of Contents
1. [Registration Flow Overview](#registration-flow-overview)
2. [Required Data Fields](#required-data-fields)
3. [Page-by-Page Implementation](#page-by-page-implementation)
4. [API Integration](#api-integration)
5. [State Management](#state-management)
6. [Calculations & Formulas](#calculations--formulas)
7. [Complete Code References](#complete-code-references)
8. [Testing Checklist](#testing-checklist)

---

## Registration Flow Overview

### Linear Flow (13 Steps)
```
1. Landing Page (Skip/Onboarding)
   ↓
2. Login/Phone Check
   ├─→ Existing User: Load data → Dashboard
   └─→ New User: Registration Flow (Steps 3-13)
   ↓
3. Goal Selection
   ↓
4. Weight Input
   ↓
5. Height Input
   ↓
6. Personal Details (Name, Age, Gender, Address, Activity)
   ↓
7. Payment Method
   ↓
8. Allergies & Health Conditions
   ↓
9. BMI Display (Auto-calculated)
   ↓
10. Dietary Plan Selection (BMI-based recommendations)
   ↓
11. TDEE Display + Account Creation (Auto-calculated + Save to DB)
   ↓
12. Meal Type Selection (Breakfast, Lunch, Dinner, Snacks)
   ↓
13. Dashboard (Generate meal schedule)
```

### Data Collection Summary
| Step | Data Collected | Validation | Context Update |
|------|---------------|------------|----------------|
| 2 | Phone number | Required, unique | `updatePhone(phone)` |
| 3 | Goal | Required | `updateGoal(goal)` |
| 4 | Weight, Unit | Required | `updateWeight(weight, unit)` |
| 5 | Height, Unit | Required | `updateHeight(height, unit)` |
| 6 | Name, Age, Gender, Address, Activity | All required | Multiple updates |
| 7 | Card details | Required | `updatePaymentInfo(...)` |
| 8 | Allergies | Optional (can be empty) | `updateAllergies(allergies)` |
| 9 | BMI | Auto-calculated | Calculated in context |
| 10 | Dietary Plan | Required | `updatePlan(plan)` |
| 11 | TDEE | Auto-calculated + Save to DB | `registerUser()` API call |
| 12 | Meal types, count | Required (min 2) | `updateMealTypes(types)` |

---

## Required Data Fields

### Complete User Object Structure
```javascript
{
  // === PERSONAL INFORMATION ===
  name: string,              // Required | Example: "John Doe"
  phone: string,             // Required, Unique | Example: "+1 234 567 8900"
  age: number,               // Required | Example: 25
  gender: string,            // Required | Values: "male" | "female"
  address: string,           // Required | Full delivery address
  
  // === BODY MEASUREMENTS ===
  weight: number,            // Required | Example: 70
  weightUnit: string,        // Required | Values: "kg" | "lbs"
  height: number,            // Required | Example: 170
  heightUnit: string,        // Required | Values: "cm" | "inches"
  
  // === ACTIVITY & FITNESS ===
  activity: string,          // Required | Values: "Sedentary" | "Light" | "Moderate" | "Active" | "Very Active"
  goal: string,              // Required | Values: "Weight Loss" | "Weight Gain" | "Staying Fit" | "Eating Healthy" | "Keto Diet"
  
  // === DIETARY PREFERENCES ===
  plan: string,              // Required | Values: "Balanced" | "Low Carb" | "Protein Boost" | "Vegetarian Kitchen" | "Chef's Choice" | "Keto"
  allergies: string[],       // Optional | Example: ["dairy", "nuts", "shellfish"]
  
  // === MEAL PREFERENCES ===
  mealcount: number,         // Required | Example: 3
  mealtypes: string[],       // Required | Example: ["breakfast", "lunch", "dinner"]
  selecteddays: string[],    // Optional | Example: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  subscription: string,      // Optional | Values: "weekly" | "monthly" | "quarterly"
  
  // === PAYMENT INFORMATION ===
  cardnumber: string,        // Required | Example: "4111111111111111"
  cvc: string,               // Required | Example: "123"
  expiry: string,            // Required | Example: "12/25"
  service: string,           // Required | Example: "VISA" | "Mastercard"
  
  // === CALCULATED FIELDS (Auto-generated) ===
  bmi: number,               // Auto-calculated | Example: 23.5
  tdee: number,              // Auto-calculated | Example: 2100
  
  // === SYSTEM FIELDS ===
  isRegistered: boolean,     // Auto-set after successful registration
  userId: number            // Auto-set from database after creation
}
```

---

## Page-by-Page Implementation

### Page 1: Login / Phone Check
**File Reference**: `app/login.js`

**Purpose**: Check if user exists or start new registration

**UI Elements**:
- Phone number input field (with country code)
- "Login to my account" button
- "Create an account" button

**Implementation**:
```javascript
// State
const [phone, setPhone] = useState('');
const [loading, setLoading] = useState(false);

// Validation
const isPhoneValid = phone.trim().length > 0;

// API Call 1: Check if user exists
const handleLogin = async () => {
  setLoading(true);
  
  // Update context
  updatePhone(phone);
  
  try {
    // API: GET /users/phone/:phone
    const result = await ApiService.getUserByPhone(phone);
    
    if (result.success && result.data) {
      // User exists - Load their data
      loadUserData(result.data);
      // Navigate to Dashboard
      router.push('/dashboard');
    }
  } catch (error) {
    if (error.message.includes('User not found')) {
      // New user - Start registration
      Alert.alert('New User', 'Create your account');
      router.push('/goal-selection'); // Go to step 3
    } else {
      // Network or other error
      Alert.alert('Error', 'Something went wrong');
    }
  } finally {
    setLoading(false);
  }
};
```

**Context Functions Used**:
```javascript
updatePhone(phone)           // Save phone to context
checkUserExists(phone)       // Check if user in DB
loadUserData(user)          // Load existing user data
```

**API Endpoints**:
```javascript
// GET /api/users/phone/:phone
ApiService.getUserByPhone(phone)

// Response if user exists:
{
  success: true,
  data: {
    id: 123,
    name: "John Doe",
    phone: "+1234567890",
    // ... all user fields
  }
}

// Response if user doesn't exist:
{
  success: false,
  message: "User not found"
}
```

**Navigation**:
- User exists → Dashboard
- User doesn't exist → Goal Selection (Page 2)

---

### Page 2: Goal Selection
**File Reference**: `app/detailform.js`

**Purpose**: Select fitness goal (affects TDEE and meal recommendations)

**UI Elements**:
- 5 radio buttons/cards for goals:
  1. Weight Gain
  2. Weight Loss
  3. Staying Fit
  4. Eating Healthy
  5. Keto Diet
- "Next" button (disabled until selection)
- "Back" button

**Implementation**:
```javascript
// State
const [selectedGoal, setSelectedGoal] = useState(null);

// Goal options
const goalOptions = [
  'Weight Gain',
  'Weight Loss',
  'Staying Fit',
  'Eating Healthy',
  'Keto Diet'
];

// Validation
const isFormValid = selectedGoal !== null;

// Handle next
const handleNext = () => {
  updateGoal(selectedGoal);  // Save to context
  router.push('/body-weight'); // Go to Page 3
};
```

**Context Functions Used**:
```javascript
updateGoal(goal)  // Save selected goal to context
```

**What Happens to This Data**:
- Saved to context immediately
- Used later in TDEE calculation:
  - Weight Loss → 20% calorie deficit
  - Weight Gain → 15% calorie surplus
  - Others → Maintenance calories
- Used in meal sorting:
  - Weight Loss → Prioritize low-calorie meals
  - Weight Gain → Prioritize high-calorie meals
  - Staying Fit → Prioritize high-protein meals
  - Eating Healthy → Prioritize high-fiber meals
  - Keto Diet → Prioritize low-carb meals

**Navigation**: Next → Weight Input (Page 3)

---

### Page 3: Weight Input
**File Reference**: `app/bodydetails.js`

**Purpose**: Collect user's weight with unit selection

**UI Elements**:
- Unit toggle: kg / lbs (yellow highlight for selected)
- Large weight display (72px font size)
- Horizontal scrollable scale (30-200 kg or 66-440 lbs)
- Interactive slider with indicator
- "Next" button
- "Back" button

**Implementation**:
```javascript
// State
const [weight, setWeight] = useState(70);
const [unit, setUnit] = useState('kg');

// Unit conversion
const convertWeight = (value, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return value;
  if (fromUnit === 'kg' && toUnit === 'lbs') 
    return Math.round(value * 2.20462);
  if (fromUnit === 'lbs' && toUnit === 'kg') 
    return Math.round(value / 2.20462);
  return value;
};

// Handle unit change
const handleUnitChange = (newUnit) => {
  if (newUnit !== unit) {
    const convertedWeight = convertWeight(weight, unit, newUnit);
    setWeight(convertedWeight);
    setUnit(newUnit);
    updateWeight(convertedWeight, newUnit); // Update context
  }
};

// Handle scroll/slider change
const handleWeightChange = (newWeight) => {
  setWeight(newWeight);
  updateWeight(newWeight, unit); // Real-time context update
};

// Handle next
const handleNext = () => {
  router.push('/height'); // Go to Page 4
};
```

**Context Functions Used**:
```javascript
updateWeight(weight, unit)  // Updates weight and weightUnit in context
```

**Real-Time Effects**:
- BMI is automatically recalculated as weight changes
- Available via `calculateBMI()` function in context

**Validation**:
- Weight must be between min and max (30-200 kg or 66-440 lbs)

**Navigation**: Next → Height Input (Page 4)

---

### Page 4: Height Input
**File Reference**: `app/height.js`

**Purpose**: Collect user's height with unit selection

**UI Elements**:
- Unit toggle: cm / inches (yellow highlight for selected)
- Large height display (72px font size)
- Horizontal scrollable scale (100-250 cm or 39-98 inches)
- Interactive slider with indicator
- "Next" button
- "Back" button

**Implementation**:
```javascript
// State
const [height, setHeight] = useState(170);
const [unit, setUnit] = useState('cm');

// Unit conversion
const convertHeight = (value, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return value;
  if (fromUnit === 'cm' && toUnit === 'inches') 
    return Math.round(value / 2.54);
  if (fromUnit === 'inches' && toUnit === 'cm') 
    return Math.round(value * 2.54);
  return value;
};

// Handle unit change
const handleUnitChange = (newUnit) => {
  if (newUnit !== unit) {
    const convertedHeight = convertHeight(height, unit, newUnit);
    setHeight(convertedHeight);
    setUnit(newUnit);
    updateHeight(convertedHeight, newUnit); // Update context
  }
};

// Handle scroll/slider change
const handleHeightChange = (newHeight) => {
  setHeight(newHeight);
  updateHeight(newHeight, unit); // Real-time context update
};

// Handle next
const handleNext = () => {
  router.push('/personal-details'); // Go to Page 5
};
```

**Context Functions Used**:
```javascript
updateHeight(height, unit)  // Updates height and heightUnit in context
```

**Real-Time Effects**:
- BMI is automatically recalculated as height changes
- Available via `calculateBMI()` function in context

**Validation**:
- Height must be between min and max (100-250 cm or 39-98 inches)

**Navigation**: Next → Personal Details (Page 5)

---

### Page 5: Personal Details & Activity Level
**File Reference**: `app/furtherdetails.js`

**Purpose**: Collect name, age, gender, address, and activity level

**UI Elements**:
- Name input field (text)
- Age input field (number)
- Phone input field (number) - pre-filled from Page 1
- Gender selection (2 circular buttons with icons: male/female)
- Address textarea (multiline)
- "Detect My Location" button (GPS-based)
- Activity Level dropdown/modal with 5 options
- "Next" button (disabled until all fields filled)
- "Back" button

**Implementation**:
```javascript
// State
const [name, setName] = useState('');
const [age, setAge] = useState('');
const [phone, setPhone] = useState(''); // Can pre-fill from context
const [selectedGender, setSelectedGender] = useState(null);
const [address, setAddress] = useState('');
const [activityLevel, setActivityLevel] = useState('Moderate');
const [isDetectingLocation, setIsDetectingLocation] = useState(false);

// Activity level options
const activityLevels = [
  { value: 'Sedentary', label: 'Sedentary', description: 'little or no exercise' },
  { value: 'Light', label: 'Light', description: 'exercise 1-3 times/week' },
  { value: 'Moderate', label: 'Moderate', description: 'exercise 4-5 times/week' },
  { value: 'Active', label: 'Active', description: 'Daily Exercise' },
  { value: 'Very Active', label: 'Very Active', description: 'intense exercise 6-7 times/week' }
];

// Validation
const isFormValid = 
  name.trim() !== '' && 
  age.trim() !== '' && 
  phone.trim() !== '' && 
  selectedGender !== null && 
  address.trim() !== '' && 
  activityLevel !== null;

// GPS Location Detection
const detectLocation = async () => {
  setIsDetectingLocation(true);
  try {
    // Request location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Enable location in settings');
      return;
    }
    
    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    
    // Reverse geocode
    const geocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });
    
    if (geocode.length > 0) {
      const addressData = geocode[0];
      const fullAddress = [
        addressData.streetNumber,
        addressData.street,
        addressData.district,
        addressData.city,
        addressData.region,
        addressData.postalCode,
        addressData.country
      ].filter(Boolean).join(', ');
      
      setAddress(fullAddress);
      Alert.alert('Success', 'Address detected!');
    }
  } catch (error) {
    Alert.alert('Error', 'Could not detect location. Enter manually.');
  } finally {
    setIsDetectingLocation(false);
  }
};

// Handle next
const handleNext = () => {
  // Update all fields in context
  updateName(name);
  updatePersonalInfo(parseInt(age), selectedGender);
  updatePhone(phone);
  updateAddress(address);
  updateActivityLevel(activityLevel);
  
  router.push('/payment-method'); // Go to Page 6
};
```

**Context Functions Used**:
```javascript
updateName(name)                        // Save name
updatePersonalInfo(age, gender)         // Save age and gender together
updatePhone(phone)                      // Save/update phone
updateAddress(address)                  // Save delivery address
updateActivityLevel(activity)           // Save activity level
```

**What Happens to This Data**:
- **Activity Level** is used in TDEE calculation:
  - Sedentary: BMR × 1.2
  - Light: BMR × 1.375
  - Moderate: BMR × 1.55
  - Active: BMR × 1.725
  - Very Active: BMR × 1.9
- **Age & Gender** are used in BMR calculation (Mifflin-St Jeor equation)
- **Address** is saved for meal delivery
- **Name & Phone** are user identifiers

**Validation**:
- All fields are required
- Age must be a number
- Gender must be selected (male or female)
- Phone must be valid format

**Navigation**: Next → Payment Method (Page 6)

---

### Page 6: Payment Method
**File Reference**: `app/paymentmethod.js`

**Purpose**: Collect payment card details

**UI Elements**:
- Card number input (16 digits, formatted as XXXX XXXX XXXX XXXX)
- CVC input (3-4 digits)
- Expiry date input (MM/YY format)
- Card type selection or auto-detection (VISA, Mastercard, Amex, etc.)
- Visual card preview showing entered details
- "Next" button (disabled until all fields valid)
- "Back" button

**Implementation**:
```javascript
// State
const [cardnumber, setCardnumber] = useState('');
const [cvc, setCvc] = useState('');
const [expiry, setExpiry] = useState('');
const [service, setService] = useState('VISA'); // Auto-detect from card number

// Card number formatting
const formatCardNumber = (text) => {
  // Remove non-digits
  const cleaned = text.replace(/\D/g, '');
  // Add spaces every 4 digits
  const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
  return formatted;
};

// Expiry formatting
const formatExpiry = (text) => {
  // Remove non-digits
  const cleaned = text.replace(/\D/g, '');
  // Add slash after 2 digits
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
};

// Card type detection
const detectCardType = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.startsWith('4')) return 'VISA';
  if (cleaned.startsWith('5')) return 'Mastercard';
  if (cleaned.startsWith('3')) return 'Amex';
  return 'Unknown';
};

// Validation
const isFormValid = 
  cardnumber.replace(/\s/g, '').length === 16 &&
  cvc.length >= 3 &&
  expiry.length === 5 && // MM/YY format
  service !== 'Unknown';

// Handle card number change
const handleCardNumberChange = (text) => {
  const formatted = formatCardNumber(text);
  setCardnumber(formatted);
  setService(detectCardType(formatted));
};

// Handle expiry change
const handleExpiryChange = (text) => {
  const formatted = formatExpiry(text);
  setExpiry(formatted);
};

// Handle next
const handleNext = () => {
  // Update context
  updatePaymentInfo(
    cardnumber.replace(/\s/g, ''), // Remove spaces
    cvc,
    expiry,
    service
  );
  
  router.push('/allergies'); // Go to Page 7
};
```

**Context Functions Used**:
```javascript
updatePaymentInfo(cardnumber, cvc, expiry, service)  // Save all payment details together
```

**Validation**:
- Card number: Exactly 16 digits (Amex: 15 digits)
- CVC: 3-4 digits
- Expiry: Valid future date in MM/YY format
- Card type must be detected/selected

**Security Notes**:
- In production, use payment gateway (Stripe, PayPal)
- Never store raw card numbers
- This is simplified for demo purposes

**Navigation**: Next → Allergies (Page 7)

---

### Page 7: Allergies & Health Conditions
**File Reference**: `app/allergies.js`

**Purpose**: Collect user's allergies and health conditions for meal filtering

**UI Elements**:
- 8 predefined option buttons:
  - Diabetes
  - Dairy
  - High Blood Pressure
  - Shellfish
  - Gluten
  - Eggs
  - Nuts
  - Soy
- Custom allergy input field
- "Add" button for custom allergies
- Chip/tag display for added custom allergies (with X to remove)
- "Submit" button (enabled always, can skip if no allergies)

**Implementation**:
```javascript
// State
const [selectedConditions, setSelectedConditions] = useState([]);
const [customCondition, setCustomCondition] = useState('');
const [customAllergies, setCustomAllergies] = useState([]);

// Predefined options
const conditionOptions = [
  'Diabetes', 'Dairy', 'High Blood Pressure', 'Shellfish',
  'Gluten', 'Eggs', 'Nuts', 'Soy'
];

// Toggle predefined condition
const toggleCondition = (value) => {
  setSelectedConditions(prev =>
    prev.includes(value)
      ? prev.filter(item => item !== value)
      : [...prev, value]
  );
};

// Add custom allergy
const addCustomAllergy = () => {
  const trimmed = customCondition.trim();
  if (trimmed && 
      !customAllergies.includes(trimmed) && 
      !selectedConditions.includes(trimmed)) {
    setCustomAllergies(prev => [...prev, trimmed]);
    setCustomCondition('');
  }
};

// Remove custom allergy
const removeCustomAllergy = (allergyToRemove) => {
  setCustomAllergies(prev => 
    prev.filter(allergy => allergy !== allergyToRemove)
  );
};

// Handle submit
const handleSubmit = () => {
  // Combine predefined and custom allergies
  const allAllergies = [...selectedConditions, ...customAllergies];
  
  // Update context (can be empty array if user has no allergies)
  updateAllergies(allAllergies);
  
  router.push('/bmi-display'); // Go to Page 8
};
```

**Context Functions Used**:
```javascript
updateAllergies(allergies)  // Save array of allergies to context
```

**What Happens to This Data**:
- Allergies are used to **filter out meals** that contain these ingredients
- Advanced matching with allergen variations:
  - "dairy" → detects milk, cheese, butter, cream, yogurt
  - "eggs" → detects egg, scrambled, omelet, egg white
  - "nuts" → detects almond, walnut, cashew, etc.
- Checked against:
  1. meal.ingredients array
  2. meal.name
  3. meal.description
- Any meal with matching allergen is **completely excluded** from recommendations

**Validation**:
- Optional - user can proceed with no allergies
- No duplicates allowed between predefined and custom

**Navigation**: Submit → BMI Display (Page 8)

---

### Page 8: BMI Display (Read-Only)
**File Reference**: `app/bmi.js`

**Purpose**: Show calculated BMI and health status

**UI Elements**:
- Large BMI value display (72px font)
- BMI category label (Underweight/Normal/Overweight/Obese)
- Visual BMI scale with 4 colored segments:
  - Blue: Underweight (<18.5)
  - Green: Normal (18.5-24.9)
  - Orange: Overweight (25-29.9)
  - Red: Obese (≥30)
- Indicator arrow showing user's position on scale
- Descriptive text explaining BMI
- "Next" button
- "Back" button

**Implementation**:
```javascript
// No state needed - all data from context

// Get BMI info from context
const bmiInfo = getBMIInfo();
// Returns: { bmi: 23.5, category: 'Normal', color: '#07da63' }

// Calculate BMI position on scale (0-100%)
const getBMIPosition = (bmi) => {
  let position;
  if (bmi < 18.5) {
    position = (bmi / 18.5) * 0.25; // 0-25% of scale
  } else if (bmi < 25) {
    position = 0.25 + ((bmi - 18.5) / (25 - 18.5)) * 0.25; // 25-50%
  } else if (bmi < 30) {
    position = 0.5 + ((bmi - 25) / (30 - 25)) * 0.25; // 50-75%
  } else {
    position = 0.75 + Math.min(((bmi - 30) / 10) * 0.25, 0.25); // 75-100%
  }
  return `${Math.max(5, Math.min(95, position * 100))}%`;
};

// Handle next
const handleNext = () => {
  router.push('/dietary-plan'); // Go to Page 9
};
```

**Context Functions Used**:
```javascript
getBMIInfo()  // Returns { bmi, category, color }
// Internally calls calculateBMI() which uses:
//   - userData.weight
//   - userData.weightUnit
//   - userData.height
//   - userData.heightUnit
```

**BMI Calculation Formula**:
```javascript
// 1. Convert weight to kg
let weightInKg = weight;
if (weightUnit === 'lbs') {
  weightInKg = weight / 2.20462;
}

// 2. Convert height to meters
let heightInM = height / 100; // cm to meters
if (heightUnit === 'inches') {
  heightInM = (height * 2.54) / 100;
}

// 3. Calculate BMI
const bmi = weightInKg / (heightInM * heightInM);

// 4. Round to 1 decimal place
return Math.round(bmi * 10) / 10;
```

**BMI Categories & Colors**:
```javascript
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
```

**What Happens to This Data**:
- BMI is displayed but NOT saved yet
- Will be saved to database in Page 10 (TDEE/Registration)
- BMI is used to recommend dietary plans on next page

**Navigation**: Next → Dietary Plan Selection (Page 9)

---

### Page 9: Dietary Plan Selection
**File Reference**: `app/foodprefer.js`

**Purpose**: Select dietary plan with BMI-based recommendations

**UI Elements**:
- BMI-based recommendation card (top):
  - Shows user's BMI value
  - Shows BMI category
  - Displays personalized message
  - Lists recommended plans as highlighted tags
- 6 dietary plan cards:
  1. Balanced (Blue) - "Balanced in proteins, carbs and fats"
  2. Low Carb (Orange) - "Low in carbs, more fats"
  3. Protein Boost (Red) - "High in protein, moderate low in fats and carbs"
  4. Vegetarian Kitchen (Green) - "All organic and pure vegetarian"
  5. Chef's Choice (Purple) - "Curated specials of the day"
  6. Keto (Blue) - "Healthy fats and low carbs to enhance ketosis"
- Each card is color-coded and clickable
- Selection navigates immediately (no next button needed)

**Implementation**:
```javascript
// State
const [selectedPreference, setSelectedPreference] = useState(null);

// Get BMI info from context
const bmiInfo = getBMIInfo();
const currentBMI = bmiInfo.bmi;

// BMI-based recommendations
const getRecommendedPlans = () => {
  if (currentBMI < 18.5) {
    // Underweight
    return {
      category: 'Underweight',
      icon: '💪',
      message: 'We recommend high-protein and balanced meals to help you gain healthy weight.',
      plans: ['Protein Boost', 'Balanced'],
      color: '#07da63'
    };
  } else if (currentBMI >= 18.5 && currentBMI < 25) {
    // Normal
    return {
      category: 'Healthy Range',
      icon: '✨',
      message: 'Your BMI is perfect! Choose any plan that fits your lifestyle.',
      plans: ['Balanced', "Chef's Choice", 'Vegetarian Kitchen'],
      color: '#07da63'
    };
  } else if (currentBMI >= 25 && currentBMI < 30) {
    // Overweight
    return {
      category: 'Overweight',
      icon: '🎯',
      message: 'We recommend low-carb or keto plans to help you achieve your weight loss goals.',
      plans: ['Low Carb', 'Keto'],
      color: '#07da63'
    };
  } else {
    // Obese
    return {
      category: 'Obese',
      icon: '🔥',
      message: 'Low-carb and keto plans can help kickstart your weight loss journey effectively.',
      plans: ['Low Carb', 'Keto'],
      color: '#07da63'
    };
  }
};

const recommendation = getRecommendedPlans();

// Plan options with colors
const planOptions = [
  { 
    label: 'Balanced', 
    value: 'Balanced',
    description: 'Balanced in proteins, carbs and fats.',
    color: '#7293dd'
  },
  { 
    label: 'Low Carb', 
    value: 'Low Carb',
    description: 'Low in carbs, more fats.',
    color: '#f0ad19'
  },
  { 
    label: 'Protein Boost', 
    value: 'Protein Boost',
    description: 'High in protein, moderate low in fats and carbs.',
    color: '#e96250'
  },
  { 
    label: 'Vegetarian Kitchen', 
    value: 'Vegetarian Kitchen',
    description: 'All organic and pure vegetarian.',
    color: '#5abe17'
  },
  { 
    label: "Chef's Choice", 
    value: "Chef's Choice",
    description: 'Curated specials of the day.',
    color: '#8d79e9'
  },
  { 
    label: 'Keto', 
    value: 'Keto',
    description: 'Healthy fats and low carbs to enhance ketosis and burn fat.',
    color: '#7293dd'
  }
];

// Handle plan selection
const selectPreference = (value) => {
  setSelectedPreference(value);
  updatePlan(value); // Save to context
  
  // Auto-navigate after short delay for visual feedback
  setTimeout(() => {
    router.push('/tdee-display'); // Go to Page 10
  }, 200);
};
```

**Context Functions Used**:
```javascript
getBMIInfo()      // Get BMI to show recommendations
updatePlan(plan)  // Save selected dietary plan
```

**What Happens to This Data**:
- **Dietary Plan** is used for meal filtering
- Each plan maps to dietary tags:
  ```javascript
  'Balanced'           → ['High Protein', 'Gluten-Free']
  'Low Carb'           → ['Low Carb']
  'Protein Boost'      → ['High Protein']
  'Vegetarian Kitchen' → ['Vegetarian']
  'Chef's Choice'      → ['High Protein', 'Low Carb', 'Keto']
  'Keto'               → ['Keto']
  ```
- Only meals with matching tags will be recommended
- Combined with goal to sort meals

**Validation**:
- Must select one plan to proceed

**Navigation**: Immediately after selection → TDEE Display & Registration (Page 10)

---

### Page 10: TDEE Display & Registration (CRITICAL)
**File Reference**: `app/tdee.js`

**Purpose**: Display calculated TDEE, explain calorie goals, and **CREATE USER ACCOUNT**

**UI Elements**:
- Large TDEE value display (64px font)
- "calories/day" label
- Activity level info card
- Metabolism breakdown section:
  - BMR value
  - Activity multiplier
  - Final TDEE (highlighted in green)
- Calorie goals section with 3 cards:
  1. Weight Loss (Aggressive 20% + Moderate 10% deficit)
  2. Maintenance (no change)
  3. Weight Gain (Lean 10% + Aggressive 15% surplus)
- Important notes section
- "Create Account & Continue" button (TRIGGERS REGISTRATION)
- Loading spinner during registration
- "Back" button

**Implementation**:
```javascript
// State
const [registering, setRegistering] = useState(false);

// Get user data from context
const { userData, registerUser } = useUserData();

// Calculate BMR (Basal Metabolic Rate)
const calculateBMR = () => {
  // Convert to kg and cm
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
  
  // Mifflin-St Jeor Equation
  let bmr;
  if (gender.toLowerCase() === 'male') {
    bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) + 5;
  } else {
    bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) - 161;
  }
  
  return Math.round(bmr);
};

// Get activity multiplier
const getActivityMultiplier = () => {
  const activity = userData.activity || 'Sedentary';
  const multipliers = {
    'Sedentary': 1.2,
    'Light': 1.375,
    'Moderate': 1.55,
    'Active': 1.725,
    'Very Active': 1.9
  };
  return multipliers[activity] || 1.2;
};

// Calculate TDEE
const calculateTDEE = () => {
  const bmr = calculateBMR();
  const multiplier = getActivityMultiplier();
  return Math.round(bmr * multiplier);
};

// Calculate values for display
const bmr = calculateBMR();
const tdee = calculateTDEE();
const activityMultiplier = getActivityMultiplier();

// Calorie goals
const maintenanceCalories = tdee;
const cuttingCalories = Math.round(tdee * 0.8);      // 20% deficit
const bulkingCalories = Math.round(tdee * 1.15);     // 15% surplus
const mildCuttingCalories = Math.round(tdee * 0.9);  // 10% deficit
const mildBulkingCalories = Math.round(tdee * 1.1);  // 10% surplus

// === REGISTRATION FUNCTION ===
const handleRegistration = async () => {
  setRegistering(true);
  
  try {
    // Call registerUser from context
    // This function:
    // 1. Calculates BMI
    // 2. Calculates TDEE based on goal
    // 3. Prepares registration data
    // 4. Calls API: POST /api/users
    // 5. Saves user to database
    // 6. Updates context with userId and isRegistered
    
    const result = await registerUser();
    
    if (result.success) {
      Alert.alert(
        'Registration Successful!',
        'Your account has been created successfully.',
        [
          {
            text: 'Continue to Dashboard',
            onPress: () => router.push('/meal-selection') // Go to Page 11
          }
        ]
      );
    } else {
      Alert.alert(
        'Registration Failed',
        result.error || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    Alert.alert(
      'Error',
      'Failed to register. Please try again.',
      [{ text: 'OK' }]
    );
  } finally {
    setRegistering(false);
  }
};
```

**Context Functions Used**:
```javascript
registerUser()  // THE MAIN REGISTRATION FUNCTION
// Internally does:
//   1. getBMIInfo() - calculate BMI
//   2. calculateTDEEForGoal() - calculate TDEE with goal adjustment
//   3. ApiService.createUser(registrationData) - API call
//   4. Updates context with userId and isRegistered status
```

**TDEE Calculation with Goal Adjustment**:
```javascript
// In UserDataContext.js - calculateTDEEForGoal()
const calculateTDEEForGoal = () => {
  // 1. Calculate BMR
  let bmr;
  if (gender === 'male') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }
  
  // 2. Apply activity multiplier
  const baseTDEE = Math.round(bmr * activityMultiplier);
  
  // 3. Adjust based on goal
  let finalTDEE;
  switch (userData.goal) {
    case 'Weight Loss':
      finalTDEE = Math.round(baseTDEE * 0.8);  // 20% deficit
      break;
    case 'Weight Gain':
      finalTDEE = Math.round(baseTDEE * 1.15); // 15% surplus
      break;
    case 'Staying Fit':
    case 'Eating Healthy':
    case 'Keto Diet':
      finalTDEE = baseTDEE; // Maintenance
      break;
    default:
      finalTDEE = baseTDEE;
  }
  
  return finalTDEE;
};
```

**API Call - User Registration**:
```javascript
// In UserDataContext.js - registerUser()
const registerUser = async () => {
  // 1. Calculate BMI
  const bmiInfo = getBMIInfo();
  
  // 2. Calculate TDEE based on goal
  const calculatedTDEE = calculateTDEEForGoal();
  
  // 3. Prepare registration data
  const registrationData = {
    name: userData.name,
    phone: userData.phone,
    address: userData.address,
    activity: userData.activity,
    plan: userData.plan,
    goal: userData.goal,
    weight: userData.weight.toString(),
    height: userData.height.toString(),
    age: userData.age?.toString(),
    gender: userData.gender,
    mealcount: userData.mealcount?.toString(),
    mealtypes: userData.mealtypes,           // Array
    selecteddays: userData.selecteddays,      // Array
    subscription: userData.subscription,
    bmi: bmiInfo.bmi.toString(),
    tdee: calculatedTDEE.toString(),          // Goal-adjusted TDEE
    allergies: userData.allergies,            // Array
    cardnumber: userData.cardnumber,
    cvc: userData.cvc,
    expiry: userData.expiry,
    service: userData.service
  };
  
  // 4. Call API
  const result = await ApiService.createUser(registrationData);
  
  // 5. Update context if successful
  if (result.success) {
    setUserData(prev => ({
      ...prev,
      isRegistered: true,
      userId: result.data.id,
      bmi: bmiInfo.bmi,
      tdee: calculatedTDEE
    }));
    
    return { success: true, user: result.data };
  } else {
    throw new Error(result.message || 'Registration failed');
  }
};
```

**API Endpoint Details**:
```javascript
// POST /api/users
// Request body:
{
  name: "John Doe",
  phone: "+1234567890",
  address: "123 Main St, City, State, ZIP",
  activity: "Moderate",
  plan: "Keto",
  goal: "Weight Loss",
  weight: "70",
  height: "175",
  age: "25",
  gender: "male",
  mealcount: "3",
  mealtypes: ["breakfast", "lunch", "dinner"],  // Converted to JSON string in API
  selecteddays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  subscription: "monthly",
  bmi: "22.9",
  tdee: "1680",  // Already adjusted for Weight Loss goal (20% deficit)
  allergies: ["dairy", "nuts"],
  cardnumber: "4111111111111111",
  cvc: "123",
  expiry: "12/25",
  service: "VISA"
}

// Response on success:
{
  success: true,
  data: {
    id: 123,
    name: "John Doe",
    phone: "+1234567890",
    // ... all other fields
    created_at: "2025-10-03T10:30:00Z"
  },
  message: "User registered successfully"
}

// Response on error:
{
  success: false,
  message: "Phone number already exists" // or other error
}
```

**What Happens in Database**:
```sql
-- User is inserted into 'users' table
INSERT INTO users (
  name, phone, address, activity, plan, goal,
  weight, height, age, gender,
  mealcount, mealtypes, selecteddays, subscription,
  bmi, tdee, allergies,
  cardnumber, cvc, expiry, service,
  created_at, updated_at
) VALUES (
  'John Doe', '+1234567890', '123 Main St...', 'Moderate', 'Keto', 'Weight Loss',
  '70', '175', '25', 'male',
  '3', '["breakfast","lunch","dinner"]', '["MON","TUE",...]', 'monthly',
  '22.9', '1680', '["dairy","nuts"]',
  '4111...', '123', '12/25', 'VISA',
  NOW(), NOW()
);

-- Returns new user with ID
```

**Critical Notes**:
- **This is the ONLY page that saves data to database**
- All previous pages only update context (in-memory state)
- TDEE stored in database is already goal-adjusted (not base TDEE)
- If registration fails, user must retry (data remains in context)
- Once successful, userId is set and isRegistered = true

**Navigation**: 
- Success → Meal Type Selection (Page 11)
- Failure → Stay on page, show error, allow retry

---

### Page 11: Meal Type Selection
**File Reference**: `app/meals.js`

**Purpose**: Select which meal types user wants (breakfast, lunch, dinner, snacks)

**UI Elements**:
- 4 meal option buttons with emojis:
  1. Breakfast 🥞 (Optional)
  2. Lunch 🍱 (Required - pre-selected, disabled)
  3. Snacks 🍙 (Optional)
  4. Dinner 🍔 (Required - pre-selected, disabled)
- Note: "Lunch and Dinner are required (pre-selected)"
- "Submit" button (enabled when at least 2 meals selected)
- Lunch and Dinner are always selected and cannot be unselected

**Implementation**:
```javascript
// State - Pre-select lunch and dinner
const [selectedMeals, setSelectedMeals] = useState(['lunch', 'dinner']);

// Meal options
const mealOptions = [
  { label: 'Breakfast 🥞', value: 'breakfast', required: false },
  { label: 'Lunch 🍱', value: 'lunch', required: true },
  { label: 'Snacks 🍙', value: 'snacks', required: false },
  { label: 'Dinner 🍔', value: 'dinner', required: true }
];

// Validation
const isFormValid = selectedMeals.length >= 2;

// Handle meal toggle
const handleMealToggle = (mealValue) => {
  const option = mealOptions.find(opt => opt.value === mealValue);
  
  // Don't allow unselecting required meals
  if (option.required) {
    return; // Lunch and dinner cannot be unselected
  }
  
  setSelectedMeals(prev => {
    if (prev.includes(mealValue)) {
      // Unselect (but keep at least 2 meals)
      if (prev.length <= 2) {
        return prev; // Can't go below 2 meals
      }
      return prev.filter(meal => meal !== mealValue);
    } else {
      // Select
      return [...prev, mealValue];
    }
  });
};

// Handle submit
const handleSubmit = () => {
  // Update context
  updateMealCount(selectedMeals.length);  // e.g., 3
  updateMealTypes(selectedMeals);          // e.g., ['breakfast', 'lunch', 'dinner']
  
  // Navigate to dashboard or schedule generation
  router.push('/dashboard'); // Go to Page 12/Dashboard
};
```

**Context Functions Used**:
```javascript
updateMealCount(count)       // Save number of meals per day
updateMealTypes(types)       // Save array of meal types
```

**What Happens to This Data**:
- **Meal Types** determine which meals are generated in schedule
- If user selects 3 meals: ['breakfast', 'lunch', 'dinner']
  - Scheduler will assign 3 meals per day
  - Only breakfast, lunch, and dinner categories will be used
- If user selects 4 meals: ['breakfast', 'lunch', 'snacks', 'dinner']
  - Scheduler will assign 4 meals per day
  - All four categories will be used

**Validation**:
- Minimum 2 meals required (lunch + dinner)
- Maximum 4 meals (all options)
- Lunch and dinner are mandatory

**Navigation**: Submit → Dashboard / Meal Schedule Generation (Page 12)

---

### Page 12: Dashboard & Meal Schedule Generation
**File Reference**: `app/home.js` (basic), Schedule generation happens via API

**Purpose**: Display user's dashboard and generate meal schedule

**UI Elements**:
- Welcome message with user's name
- Quick stats (BMI, TDEE, Goal, Plan)
- "Generate My Meal Schedule" button (if not generated yet)
- Weekly meal calendar view (if schedule exists)
- Navigation menu
- View recipes/menu link

**Implementation**:
```javascript
// State
const [schedule, setSchedule] = useState(null);
const [loading, setLoading] = useState(false);

// Get user data from context
const { userData } = useUserData();

// Check if schedule exists on mount
useEffect(() => {
  checkExistingSchedule();
}, []);

// Check for existing schedule
const checkExistingSchedule = async () => {
  try {
    const result = await ApiService.getMealSchedule(userData.userId);
    if (result.success) {
      setSchedule(result.data);
    }
  } catch (error) {
    // No schedule exists yet
    console.log('No schedule found, will generate new one');
  }
};

// Generate meal schedule
const generateSchedule = async () => {
  setLoading(true);
  
  try {
    // API: POST /api/schedule/generate
    const result = await ApiService.generateMealSchedule(
      userData.userId,
      4  // Generate 4 weeks by default
    );
    
    if (result.success) {
      setSchedule(result.data);
      Alert.alert(
        'Success!',
        'Your personalized meal schedule has been generated.'
      );
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to generate schedule. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

**API Call - Generate Meal Schedule**:
```javascript
// POST /api/schedule/generate
// Request:
{
  userId: 123,
  weeks: 4
}

// Response:
{
  success: true,
  data: {
    userId: 123,
    subscription: "monthly",
    plan: "Monthly Plan",
    startDate: "2025-10-03T00:00:00Z",
    generatedAt: "2025-10-03T10:30:00Z",
    totalMeals: 84,      // 3 meals × 7 days × 4 weeks
    fiveStarMeals: 4,    // 1 per week for monthly plan
    weeks: [
      {
        week: 1,
        totalMeals: 21,
        fiveStarMeals: 1,
        days: {
          monday: {
            breakfast: { id: 45, name: "Oatmeal", calories: 300, ... },
            lunch: { id: 78, name: "Grilled Chicken", calories: 450, ... },
            dinner: { id: 23, name: "Salmon", calories: 500, ... }
          },
          tuesday: { ... },
          // ... rest of week
        }
      },
      // ... weeks 2-4
    ]
  },
  message: "Meal schedule generated successfully"
}
```

**What Happens During Schedule Generation** (Server-side):

1. **Fetch User Data**:
   ```javascript
   // GET user by ID from database
   // Parse mealtypes from JSON string to array
   ```

2. **Fetch All Meals**:
   ```javascript
   // GET all meals from database
   // Parse dietary_tags and ingredients from JSON
   ```

3. **Filter Meals by User's Plan**:
   ```javascript
   // Keep only meals with matching dietary tags
   // Example: If plan = "Keto", keep meals with "Keto" tag
   ```

4. **Remove Meals with User's Allergens**:
   ```javascript
   // Check each meal against user's allergies
   // Use allergen variations for thorough checking
   // Exclude any meal with conflicting ingredients
   ```

5. **Categorize by Rating**:
   ```javascript
   // Group meals into:
   // fiveStar, fourStar, threeStar, twoStar, oneStar
   // Each with subcategories: breakfast, lunch, dinner, snacks
   ```

6. **Generate Weekly Schedules**:
   ```javascript
   for (week = 1; week <= 4; week++) {
     // Determine if this week gets 5-star meals (based on subscription)
     for (day in ['monday', 'tuesday', ..., 'sunday']) {
       for (mealType in userSelectedMealTypes) {
         // Select meal based on:
         // - Rating (5-star if budget allows)
         // - Goal (sort by calories/protein/fiber/carbs)
         // - Uniqueness (no repeats in same week)
         assignMealToDay(week, day, mealType);
       }
     }
   }
   ```

7. **Save to Database**:
   ```javascript
   // Save complete schedule to meal_schedules table
   // Populate user_meals table with individual assignments
   ```

**Navigation**: User can now browse their meal schedule, view recipes, place orders, etc.

---

## API Integration

### API Service Configuration
**File**: `app/services/api.js`

```javascript
const API_BASE_URL = 'http://192.168.100.18:3000/api';

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // === USER ENDPOINTS ===

  // Create new user (registration)
  static async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Get user by phone (login check)
  static async getUserByPhone(phone) {
    return this.request(`/users/phone/${encodeURIComponent(phone)}`);
  }

  // Update user
  static async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // === MEAL SCHEDULE ENDPOINTS ===

  // Generate meal schedule
  static async generateMealSchedule(userId, weeks = 4) {
    return this.request('/schedule/generate', {
      method: 'POST',
      body: JSON.stringify({ userId, weeks }),
    });
  }

  // Get user's meal schedule
  static async getMealSchedule(userId, week = null) {
    const weekParam = week ? `?week=${week}` : '';
    return this.request(`/schedule/${userId}${weekParam}`);
  }

  // Get specific week's meals
  static async getWeeklyMeals(userId, weekNumber) {
    return this.request(`/schedule/${userId}/week/${weekNumber}`);
  }

  // === RECOMMENDATIONS ENDPOINTS ===

  // Get recommendations for user
  static async getRecommendationsForUser(userId) {
    return this.request(`/recommendations/${userId}`);
  }

  // Get recommendations by plan (no auth required)
  static async getRecommendationsByPlan(plan, goal = null) {
    const goalParam = goal ? `?goal=${encodeURIComponent(goal)}` : '';
    return this.request(`/recommendations/plan/${encodeURIComponent(plan)}${goalParam}`);
  }
}

export default ApiService;
```

---

## State Management

### UserDataContext Structure
**File**: `app/contexts/UserDataContext.js`

```javascript
// Complete state object
const [userData, setUserData] = useState({
  // Personal Info
  name: null,
  phone: null,
  age: null,
  gender: null,
  address: null,
  
  // Body Measurements
  weight: 70,
  weightUnit: 'kg',
  height: 170,
  heightUnit: 'cm',
  
  // Activity
  activity: null,
  
  // Goals & Preferences
  plan: null,
  goal: null,
  allergies: [],
  
  // Meal Preferences
  mealcount: null,
  mealtypes: null,
  selecteddays: null,
  subscription: null,
  
  // Payment
  cardnumber: null,
  cvc: null,
  expiry: null,
  service: null,
  
  // Calculated
  bmi: null,
  tdee: null,
  
  // Status
  isRegistered: false,
  userId: null
});
```

### Key Context Functions

```javascript
// === UPDATE FUNCTIONS ===
updateWeight(weight, unit)
updateHeight(height, unit)
updateName(name)
updatePersonalInfo(age, gender)
updatePhone(phone)
updateAddress(address)
updateActivityLevel(activity)
updatePaymentInfo(cardnumber, cvc, expiry, service)
updateGoal(goal)
updatePlan(plan)
updateAllergies(allergies)
updateMealCount(mealcount)
updateMealTypes(mealtypes)
updateSelectedDays(selecteddays)
updateSubscription(subscription)

// === CALCULATION FUNCTIONS ===
calculateBMI() // Returns BMI number
getBMIInfo()   // Returns { bmi, category, color }
calculateTDEEForGoal() // Returns goal-adjusted TDEE

// === MEAL FILTERING FUNCTIONS ===
checkMealForAllergies(meal) // Returns { isSafe, conflictingAllergies }
filterMealsByAllergies(meals) // Returns filtered meal array

// === AUTH FUNCTIONS ===
registerUser()           // Main registration - saves to DB
checkUserExists(phone)   // Check if user exists
loadUserData(user)       // Load existing user data
```

---

## Calculations & Formulas

### 1. BMI Calculation
```javascript
// Input: weight, weightUnit, height, heightUnit
// Output: BMI value (rounded to 1 decimal)

function calculateBMI(weight, weightUnit, height, heightUnit) {
  // Step 1: Convert weight to kg
  let weightInKg = weight;
  if (weightUnit === 'lbs') {
    weightInKg = weight / 2.20462;
  }
  
  // Step 2: Convert height to meters
  let heightInM = height / 100; // cm to m
  if (heightUnit === 'inches') {
    heightInM = (height * 2.54) / 100;
  }
  
  // Step 3: Calculate BMI
  const bmi = weightInKg / (heightInM * heightInM);
  
  // Step 4: Round to 1 decimal
  return Math.round(bmi * 10) / 10;
}

// BMI Categories
// < 18.5      → Underweight (Yellow)
// 18.5 - 24.9 → Normal (Green)
// 25 - 29.9   → Overweight (Red)
// ≥ 30        → Obese (Red)
```

### 2. BMR Calculation (Mifflin-St Jeor)
```javascript
// Input: weight (kg), height (cm), age, gender
// Output: BMR in calories

function calculateBMR(weightKg, heightCm, age, gender) {
  let bmr;
  
  if (gender === 'male') {
    // Men: BMR = 10W + 6.25H - 5A + 5
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    // Women: BMR = 10W + 6.25H - 5A - 161
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }
  
  return Math.round(bmr);
}
```

### 3. TDEE Calculation
```javascript
// Input: BMR, activity level
// Output: Base TDEE (maintenance calories)

function calculateBaseTDEE(bmr, activityLevel) {
  const multipliers = {
    'Sedentary': 1.2,      // Little/no exercise
    'Light': 1.375,        // Exercise 1-3 times/week
    'Moderate': 1.55,      // Exercise 4-5 times/week
    'Active': 1.725,       // Daily exercise
    'Very Active': 1.9     // Intense exercise 6-7 times/week
  };
  
  const multiplier = multipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}
```

### 4. Goal-Adjusted TDEE
```javascript
// Input: Base TDEE, goal
// Output: Final calorie target

function calculateGoalAdjustedTDEE(baseTDEE, goal) {
  let finalTDEE;
  
  switch (goal) {
    case 'Weight Loss':
      finalTDEE = Math.round(baseTDEE * 0.8);   // 20% deficit
      break;
    case 'Weight Gain':
      finalTDEE = Math.round(baseTDEE * 1.15);  // 15% surplus
      break;
    case 'Staying Fit':
    case 'Eating Healthy':
    case 'Keto Diet':
      finalTDEE = baseTDEE;                      // Maintenance
      break;
    default:
      finalTDEE = baseTDEE;
  }
  
  return finalTDEE;
}

// Example:
// Base TDEE: 2100 cal
// Goal: Weight Loss
// Final TDEE: 2100 * 0.8 = 1680 cal (20% deficit)
```

### 5. Complete TDEE Calculation Flow
```javascript
// Full calculation from user data to final TDEE

function calculateCompleteTDEE(userData) {
  // 1. Convert units
  let weightKg = userData.weight;
  if (userData.weightUnit === 'lbs') {
    weightKg = userData.weight / 2.20462;
  }
  
  let heightCm = userData.height;
  if (userData.heightUnit === 'inches') {
    heightCm = userData.height * 2.54;
  }
  
  // 2. Calculate BMR
  const bmr = calculateBMR(weightKg, heightCm, userData.age, userData.gender);
  
  // 3. Calculate base TDEE
  const baseTDEE = calculateBaseTDEE(bmr, userData.activity);
  
  // 4. Apply goal adjustment
  const finalTDEE = calculateGoalAdjustedTDEE(baseTDEE, userData.goal);
  
  return {
    bmr,
    baseTDEE,
    finalTDEE,
    activityMultiplier: getMultiplier(userData.activity),
    goalAdjustment: getAdjustment(userData.goal)
  };
}
```

---

## Complete Code References

### Registration Data Preparation
```javascript
// In UserDataContext.js - registerUser()

const registrationData = {
  // Personal info
  name: userData.name,                    // From Page 5
  phone: userData.phone,                  // From Page 1 & 5
  address: userData.address,              // From Page 5
  
  // Activity & goals
  activity: userData.activity,            // From Page 5
  goal: userData.goal,                    // From Page 2
  plan: userData.plan,                    // From Page 9
  
  // Body measurements
  weight: userData.weight.toString(),     // From Page 3
  height: userData.height.toString(),     // From Page 4
  age: userData.age?.toString(),          // From Page 5
  gender: userData.gender,                // From Page 5
  
  // Meal preferences
  mealcount: userData.mealcount?.toString(),  // From Page 11
  mealtypes: userData.mealtypes,              // From Page 11 (array)
  selecteddays: userData.selecteddays,        // Optional
  subscription: userData.subscription,        // Optional
  
  // Calculated values
  bmi: bmiInfo.bmi.toString(),            // Auto-calculated
  tdee: calculatedTDEE.toString(),        // Auto-calculated with goal
  
  // Health info
  allergies: userData.allergies,          // From Page 7 (array)
  
  // Payment
  cardnumber: userData.cardnumber,        // From Page 6
  cvc: userData.cvc,                      // From Page 6
  expiry: userData.expiry,                // From Page 6
  service: userData.service               // From Page 6
};
```

### Server-side Registration Handling
```javascript
// In server.js - POST /api/users

app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'phone', 'plan', 'goal', 'weight', 'height', 'gender'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Convert mealtypes array to JSON string
    if (userData.mealtypes && Array.isArray(userData.mealtypes)) {
      userData.mealtypes = JSON.stringify(userData.mealtypes);
    }
    
    // Insert into database
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to register user'
    });
  }
});
```

---

## Testing Checklist

### Pre-Registration Validation
- [ ] Phone number is unique (not already registered)
- [ ] All required fields are filled
- [ ] Weight is within valid range (30-200 kg or 66-440 lbs)
- [ ] Height is within valid range (100-250 cm or 39-98 inches)
- [ ] Age is a valid number
- [ ] Gender is selected
- [ ] Goal is selected
- [ ] Dietary plan is selected
- [ ] Address is provided
- [ ] Activity level is selected
- [ ] Payment details are valid
- [ ] At least 2 meal types selected (lunch & dinner)

### During Registration
- [ ] BMI is calculated correctly
- [ ] TDEE is calculated with proper goal adjustment
- [ ] Allergies array is properly formatted
- [ ] Mealtypes array is properly formatted
- [ ] API call succeeds
- [ ] User is created in database
- [ ] userId is returned and saved to context
- [ ] isRegistered flag is set to true

### Post-Registration
- [ ] User can access dashboard
- [ ] Meal schedule can be generated
- [ ] Meals are filtered by dietary plan
- [ ] Meals with allergens are excluded
- [ ] Meals are sorted by goal
- [ ] Schedule respects selected meal types
- [ ] User data persists across sessions

### Error Scenarios
- [ ] Network failure - show error, allow retry
- [ ] Phone already exists - show error, redirect to login
- [ ] Missing fields - show validation errors
- [ ] Invalid data format - show validation errors
- [ ] Database connection failure - show error, allow retry

---

## Summary

### Data Flow
1. **Pages 1-9**: Collect data, update context only (in-memory)
2. **Page 10**: Calculate BMI & TDEE, call API, save to database
3. **Pages 11+**: Additional preferences, generate meal schedule

### Critical Points
- **Only Page 10** saves data to database
- **TDEE is goal-adjusted** before saving (not maintenance)
- **Allergies are safety-critical** - thoroughly filtered
- **Meal schedule** is generated separately after registration

### API Endpoints Used
1. `GET /api/users/phone/:phone` - Check if user exists (Page 1)
2. `POST /api/users` - Register new user (Page 10)
3. `POST /api/schedule/generate` - Generate meal schedule (Page 12)
4. `GET /api/schedule/:userId` - Get existing schedule (Page 12)

### Context Functions Called
- 15+ update functions throughout pages 1-11
- 1 main registration function on page 10
- Multiple calculation functions (BMI, TDEE) on pages 8-10

---

**Use this document as a complete implementation guide for building the registration system in any platform (web, mobile, desktop app).**


