# Habibi Fitness - Onboarding & Results Pages

## Overview
This documentation describes the new Next.js onboarding flow and results pages that replace the React Native screens.

## Project Structure

```
app/
├── onboarding/
│   └── page.jsx           # Combined onboarding form (3 steps)
├── results/
│   ├── bmi/
│   │   └── page.jsx       # BMI calculation results
│   └── tdee/
│       └── page.jsx       # TDEE calculation results
├── animations.css         # Custom CSS animations
└── globals.css           # Global styles (updated)
```

## Features Implemented

### 1. Onboarding Page (`/onboarding`)
A multi-step form that combines three React Native screens into one seamless experience:

#### Step 1: Weight Input
- Interactive weight selection with unit toggle (kg/lbs)
- Real-time unit conversion
- Beautiful beige background (#F5F5DC)
- Smooth range slider with visual feedback
- Min: 30kg (66lbs) | Max: 200kg (440lbs)

#### Step 2: Height Input
- Interactive height selection with unit toggle (cm/inches)
- Real-time unit conversion
- Light green background (#a9eda5)
- Smooth range slider with visual feedback
- Min: 100cm (39in) | Max: 250cm (98in)

#### Step 3: Personal Details
- Name input
- Age input
- Phone number input
- Delivery address (textarea)
- Activity level selection (modal dropdown)
- Gender selection (Male/Female with icons)

**Activity Levels:**
- Sedentary (1.2x multiplier)
- Light (1.375x multiplier)
- Moderate (1.55x multiplier)
- Active (1.725x multiplier)
- Very Active (1.9x multiplier)

### 2. BMI Results Page (`/results/bmi`)

**Features:**
- Accurate BMI calculation using the formula: BMI = weight(kg) / height(m)²
- Automatic unit conversion for calculations
- Visual BMI scale with 4 categories:
  - Underweight: < 18.5 (Blue - #3B82F6)
  - Normal: 18.5-24.9 (Green - #10B981)
  - Overweight: 25-29.9 (Orange - #F59E0B)
  - Obese: ≥ 30 (Red - #EF4444)
- Dynamic indicator showing user's position on the scale
- Personalized recommendations based on BMI category
- Smooth animations and transitions

**BMI Calculation Formula:**
```javascript
// Convert to metric units
weightInKg = weightUnit === 'lbs' ? weight / 2.20462 : weight;
heightInM = heightUnit === 'inches' ? (height * 2.54) / 100 : height / 100;

// Calculate BMI
BMI = weightInKg / (heightInM * heightInM);
```

### 3. TDEE Results Page (`/results/tdee`)

**Features:**
- Accurate TDEE calculation using Mifflin-St Jeor Equation
- BMR (Basal Metabolic Rate) calculation
- Activity level multiplier
- Comprehensive calorie recommendations for different goals:
  - **Weight Loss:**
    - Aggressive Cut: 20% deficit (~0.9 kg/week)
    - Moderate Cut: 10% deficit (~0.45 kg/week)
  - **Maintenance:** No deficit/surplus
  - **Weight Gain:**
    - Lean Bulk: 10% surplus (~0.45 kg/week)
    - Aggressive Bulk: 15% surplus (~0.7 kg/week)

**BMR Calculation (Mifflin-St Jeor Equation):**
```javascript
// For Men:
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5

// For Women:
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

// TDEE Calculation:
TDEE = BMR × Activity_Multiplier
```

## Design & UI/UX

### Color Scheme
- Primary Green: `#07da63`
- Secondary Green (Light): `#74EB6E`
- Gold/Yellow (Toggle): `#FFD700`
- Beige (Weight card): `#F5F5DC`
- Light Green (Height card): `#a9eda5`
- Gray shades for text and backgrounds

### Animations
All animations are implemented using **Framer Motion** for smooth, performant transitions:

1. **Page Transitions:** Slide animations between steps
2. **Progress Bar:** Smooth width animation
3. **Value Changes:** Scale animation when adjusting weight/height
4. **Cards:** Scale-in animation on load
5. **Buttons:** Hover and tap animations
6. **Modals:** Fade and scale animations

### Custom CSS Animations (`animations.css`)
- Fade in/out effects
- Slide transitions
- Scale animations
- Pulse effects
- Gradient text animation
- Custom range slider styling
- Smooth scrollbar
- Loading spinner
- Button ripple effect
- Input focus glow

## Data Flow

### 1. Onboarding → BMI
```javascript
// Data saved to localStorage
const userData = {
  weight: 70,
  weightUnit: 'kg',
  height: 170,
  heightUnit: 'cm',
  name: 'John Doe',
  age: 25,
  phone: '+1 234 567 8900',
  gender: 'male',
  address: '123 Main St',
  activityLevel: 'Moderate'
};

localStorage.setItem('userData', JSON.stringify(userData));
```

### 2. BMI → TDEE
Data is retrieved from localStorage and used for calculations on both pages.

### 3. TDEE → Dashboard
After viewing TDEE results, users can continue to the dashboard.

## Responsive Design

All pages are fully responsive with:
- Mobile-first approach
- Adaptive layouts for tablets and desktop
- Touch-friendly controls
- Optimized font sizes for different screen sizes
- Max-width containers for better readability on large screens

## Dependencies

### Required Packages
- `framer-motion`: ^11.x - For smooth animations
- `react-icons`: ^5.x - For consistent iconography
- `next`: ^15.x - Next.js framework
- `react`: ^19.x - React library

### Installation
```bash
npm install framer-motion
```

## Usage

### Navigation Flow
1. User starts at `/onboarding`
2. Completes 3 steps (weight, height, details)
3. Redirects to `/results/bmi` for BMI results
4. Clicks "Calculate TDEE" button
5. Views TDEE results at `/results/tdee`
6. Clicks "Continue to Dashboard" to complete onboarding

### Accessing Pages Directly
- All pages check for userData in localStorage
- If no data found, user is redirected to `/onboarding`
- This prevents accessing results pages without completing the form

## Accessibility

- Semantic HTML elements
- Proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Readable color contrast ratios
- Screen reader friendly

## Performance Optimizations

1. **Code Splitting:** Each page is a separate chunk
2. **Lazy Loading:** Animations load on demand
3. **Optimized Re-renders:** React.memo and proper state management
4. **LocalStorage:** Persistent data without server calls
5. **Framer Motion:** Hardware-accelerated animations

## Future Enhancements

- Add form validation with error messages
- Implement data persistence to backend/database
- Add progress saving (continue later feature)
- Include metric/imperial system preferences
- Add more detailed health metrics
- Integrate with wearable devices
- Add social sharing of results
- Include meal plan recommendations based on TDEE

## Testing Checklist

- [ ] Weight unit conversion (kg ↔ lbs)
- [ ] Height unit conversion (cm ↔ inches)
- [ ] BMI calculation accuracy
- [ ] TDEE calculation accuracy
- [ ] Activity level selection
- [ ] Gender selection
- [ ] Form validation
- [ ] Navigation between pages
- [ ] LocalStorage data persistence
- [ ] Responsive design on mobile
- [ ] Responsive design on tablet
- [ ] Responsive design on desktop
- [ ] Animation smoothness
- [ ] Button interactions
- [ ] Modal functionality

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- All calculations are performed client-side
- Data is stored in browser localStorage (not secure for sensitive data)
- For production, consider implementing backend storage
- BMI and TDEE are estimates and should not replace medical advice
- Formulas used are standard and widely accepted in fitness industry

## Contact

For questions or issues, please contact the development team.

---

**Last Updated:** October 3, 2025
**Version:** 1.0.0

