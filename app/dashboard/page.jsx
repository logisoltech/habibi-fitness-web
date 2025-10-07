"use client";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import { useCountUp } from 'use-count-up';

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import dayjs from "dayjs";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { useAuth } from "../contexts/AuthContext";
import { useUserData } from "../contexts/UserDataContext";
import { useRouter } from "next/navigation";
import ApiService from "../services/api";

gsap.registerPlugin(ScrollTrigger);

// Circular Progress Component from Home Page
const HomeCircularProgress = ({ value, max = 100, size = 120, strokeWidth = 8, color = "#07da63", trackColor = "#e5e7eb", children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / max) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentMealIndex, setCurrentMealIndex] = useState(0);
  const [screenWidth, setScreenWidth] = useState(0);
  const [meals, setMeals] = useState({});
  const [mealsLoading, setMealsLoading] = useState(true);
  const [macroData, setMacroData] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0
  });

  const { user, isAuthenticated, logout } = useAuth();
  const { userData, loadUserData, getBMIInfo, updateWeight } = useUserData();
  const router = useRouter();

  // Weight Tracker state
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [updatingWeight, setUpdatingWeight] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { bmi: currentBMI, color: bmiColor } = getBMIInfo();

  // Calculate total macros from macroData
  const calculateTotalMacros = () => {
    return {
      calories: macroData.calories || 0,
      protein: macroData.protein || 0,
      carbs: macroData.carbs || 0,
      fats: macroData.fats || 0,
      fiber: macroData.fiber || 0
    };
  };

  const macroTotals = calculateTotalMacros();
  const totalCalories = macroTotals.calories;

  // useEffect(() => {
  //   if (!isAuthenticated()) {
  //     router.push("/auth/login");
  //   }
  // }, [isAuthenticated, router]);

  const calculateLeftPosition = (baseLeft, screenWidth) => {
    const referenceWidth = 1326; 
    const scaleFactor = screenWidth / referenceWidth;
    return Math.round(baseLeft * scaleFactor);
  };

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };

    updateScreenWidth();
    window.addEventListener('resize', updateScreenWidth);
    return () => window.removeEventListener('resize', updateScreenWidth);
  }, []);

  // Set client-side flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load user data and calculate macros
  useEffect(() => {
    const loadUserDataAndCalculateMacros = async () => {
      try {
        // Check if we're on the client side to avoid hydration issues
        if (typeof window === 'undefined') return;
        
        const storedUserData = localStorage.getItem('user_data');
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          loadUserData(parsedUserData);
          
          // Fetch meal schedule to calculate macros
          const userId = parsedUserData?.userId || parsedUserData?.id;
          if (userId) {
            try {
              let result = await ApiService.getMealSchedule(userId);
              if (!result.success) {
                result = await ApiService.generateMealSchedule(userId, 4);
              }
              
              if (result.success && result.data?.weeks?.[0]) {
                const currentWeek = result.data.weeks[0];
                const allWeekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
                const dayMapping = {
                  'MON': 'monday',
                  'TUE': 'tuesday', 
                  'WED': 'wednesday',
                  'THU': 'thursday',
                  'FRI': 'friday',
                  'SAT': 'saturday',
                  'SUN': 'sunday'
                };
                
                const today = new Date().getDay();
                const todayKey = today === 0 ? 'sunday' : 
                                today === 1 ? 'monday' : 
                                today === 2 ? 'tuesday' : 
                                today === 3 ? 'wednesday' : 
                                today === 4 ? 'thursday' : 
                                today === 5 ? 'friday' : 'saturday';
                
                const todayMeals = currentWeek.days[todayKey] || {};
                
                // Calculate totals for today
                let totals = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
                Object.values(todayMeals).forEach(meal => {
                  if (meal) {
                    totals.calories += parseInt(meal.calories) || 0;
                    totals.protein += parseFloat(meal.protein) || 0;
                    totals.carbs += parseFloat(meal.carbs) || 0;
                    totals.fats += parseFloat(meal.fat || meal.fats) || 0;
                    totals.fiber += parseFloat(meal.fiber) || 0;
                  }
                });
                
                setMacroData(totals);
                
                // Debug logging
                console.log('Dashboard macro data:', totals);
                console.log('User TDEE:', parsedUserData.tdee);
                console.log('Calories percentage:', Math.round((totals.calories / parsedUserData.tdee) * 100));
                
                // Calculate weekly data for chart
                const weeklyTotals = [];
                allWeekDays.forEach(day => {
                  const dayKey = dayMapping[day];
                  const dayData = currentWeek.days[dayKey];
                  let dayTotal = 0;
                  
                  if (dayData) {
                    Object.values(dayData).forEach(meal => {
                      if (meal) {
                        dayTotal += parseInt(meal.calories) || 0;
                      }
                    });
                  }
                  
                  weeklyTotals.push({ day, value: dayTotal });
                });
                
                setWeeklyData(weeklyTotals);
              }
            } catch (error) {
              console.error('Error fetching meal data:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setMealsLoading(false);
      }
    };

    loadUserDataAndCalculateMacros();
  }, []); // Remove loadUserData dependency to prevent infinite re-renders

  // Handle weight update function
  const handleUpdateWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      alert('Please enter a valid weight number');
      return;
    }

    const weightValue = parseFloat(newWeight);
    if (weightValue <= 0 || weightValue > 500) {
      alert('Please enter a weight between 0 and 500 kg');
      return;
    }

    try {
      setUpdatingWeight(true);
      const userId = userData?.userId || userData?.id;
      
      if (!userId) {
        throw new Error('User not found');
      }

      // Update weight in database
      const response = await ApiService.updateUser(userId, {
        weight: weightValue.toString()
      });

      if (response.success) {
        // Update UserDataContext
        updateWeight(weightValue, userData.weightUnit || 'kg');
        
        // Update localStorage
        const updatedUserData = { ...userData, weight: weightValue.toString() };
        localStorage.setItem('user_data', JSON.stringify(updatedUserData));
        
        alert('Weight updated successfully!');
        setShowWeightModal(false);
        setNewWeight('');
      } else {
        throw new Error(response.message || 'Failed to update weight');
      }
    } catch (error) {
      console.error('Error updating weight:', error);
      alert('Failed to update weight. Please try again.');
    } finally {
      setUpdatingWeight(false);
    }
  };

  const heroMeals = [
    {
      id: "breakfast",
      image: "/images/dashboard/breakfast.png",
      title: "Breakfast of Champions",
      price: "AED 10.00",
      description:
        "Fluffy pancakes topped with fresh blueberries and strawberries, drizzled with pure maple syrup. A delicious way to start your day!",
    },
    {
      id: "lunch",
      image: "/images/dashboard/lunch.png",
      title: "Healthy Lunch",
      price: "AED 10.00",
      description:
        "A vibrant quinoa salad with cherry tomatoes, cucumber, and a zesty lemon vinaigrette. Packed with nutrients, it's the perfect midday boost!",
    },
    {
      id: "dinner",
      image: "/images/dashboard/dinner.png",
      title: "Healthy Dinner",
      price: "AED 10.00",
      description:
        "A delicious grilled salmon served with a side of steamed asparagus and quinoa. This nutritious meal is rich in omega-3 fatty acids and perfect for a satisfying dinner!",
    },
  ];

  const CircularProgressChart = ({ targetValue, color, trackColor = '#f0f0f0', label, size = 'lg' }) => {
    const { value } = useCountUp({
      isCounting: true,
      duration: 2,
      start: 0,
      end: targetValue,
    });

    const progressSize = size === 'lg' ? 140 : 80;
    const thickness = size === 'lg' ? 12 : 8;

    return (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: progressSize, height: progressSize }}>
          <CircularProgress 
            determinate 
            value={value}
            sx={{
              width: progressSize,
              height: progressSize,
              '--CircularProgress-size': `${progressSize}px`,
              '--CircularProgress-thickness': `${thickness}px`,
              '--CircularProgress-progressColor': color,
              '--CircularProgress-trackColor': trackColor,
            }}
          >
            <Typography 
              level={size === 'lg' ? 'h3' : 'body-lg'}
              sx={{ 
                fontWeight: 600,
                color: '#374151'
              }}
            >
              {Math.round(value)}%
            </Typography>
          </CircularProgress>
        </div>
        <Typography 
          level={size === 'lg' ? 'body-md' : 'body-sm'}
          sx={{ 
            mt: size === 'lg' ? 2 : 1,
            color: '#6b7280',
            fontWeight: 500
          }}
        >
          {label}
        </Typography>
      </div>
    );
  };

  const [weeklyData, setWeeklyData] = useState([
    { day: "MON", value: 450 },
    { day: "TUE", value: 520 },
    { day: "WED", value: 480 },
    { day: "THU", value: 600 },
    { day: "FRI", value: 580 },
    { day: "SAT", value: 650 },
    { day: "SUN", value: 590 },
  ]);

  const chartData = {
    labels: weeklyData.map(item => item.day),
    datasets: [{
      label: 'Weekly Count',
      data: weeklyData.map(item => item.value),
      fill: true,
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      pointBackgroundColor: 'rgb(34, 197, 94)',
      pointBorderColor: 'rgb(34, 197, 94)',
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const mealPlanData = [
    {
      id: 1,
      title: "Cabbage Bok Choy",
      price: "AED 16.00",
      image: "/images/dashboard/meals/meal-1.png",
      category: "Breakfast",
    },
    {
      id: 2,
      title: "Cabbage Bok Choy",
      price: "AED 24.00",
      image: "/images/dashboard/meals/meal-2.png",
      category: "Lunch",
    },
    {
      id: 3,
      title: "Cabbage Bok Choy",
      price: "AED 18.00",
      image: "/images/dashboard/meals/meal-3.png",
      category: "Dinner",
    },
    {
      id: 4,
      title: "Cabbage Bok Choy",
      price: "AED 12.00",
      image: "/images/dashboard/meals/meal-1.png",
      category: "Snacks",
    },
    {
      id: 5,
      title: "Cabbage Bok Choy",
      price: "AED 12.00",
      image: "/images/dashboard/meals/meal-2.png",
      category: "Snacks",
    },
    {
      id: 6,
      title: "Cabbage Bok Choy",
      price: "AED 12.00",
      image: "/images/dashboard/meals/meal-3.png",
      category: "Snacks",
    },
    {
      id: 7,
      title: "Cabbage Bok Choy",
      price: "AED 12.00",
      image: "/images/dashboard/meals/meal-1.png",
      category: "Snacks",
    },
    {
      id: 8,
      title: "Cabbage Bok Choy",
      price: "AED 12.00",
      image: "/images/dashboard/meals/meal-2.png",
      category: "Snacks",
    },
    {
      id: 9,
      title: "Cabbage Bok Choy",
      price: "AED 12.00",
      image: "/images/dashboard/meals/meal-3.png",
      category: "Snacks",
    },
  ];

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      partialVisibilityGutter: 40,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      partialVisibilityGutter: 30,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      partialVisibilityGutter: 30,
    },
  };

  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const priceRef = useRef(null);
  const descriptionRef = useRef(null);
  const floatingItem1Ref = useRef(null);
  const floatingItem2Ref = useRef(null);
  const floatingItem3Ref = useRef(null);

  const mainImageRefs = useRef(heroMeals.map(() => ({ current: null })));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, priceRef.current, descriptionRef.current], {
        opacity: 0,
        y: 30,
      });
      mainImageRefs.current.forEach((ref) =>
        gsap.set(ref.current, { opacity: 0, x: 300 })
      );
      if (titleRef.current) titleRef.current.textContent = heroMeals[0].title;
      if (priceRef.current) priceRef.current.textContent = heroMeals[0].price;
      if (descriptionRef.current)
        descriptionRef.current.textContent = heroMeals[0].description;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 80%", 
        end: "bottom 20%", 
        onEnter: () => {
          gsap.fromTo(
            [titleRef.current, priceRef.current, descriptionRef.current],
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power2.out" }
          );
          gsap.fromTo(
            mainImageRefs.current[0].current,
            { opacity: 0, x: 300 },
            { opacity: 1, x: 0, duration: 1, ease: "power2.out" }
          );
        },
        onLeaveBack: () => {
          gsap.set(
            [titleRef.current, priceRef.current, descriptionRef.current],
            { opacity: 0, y: 30 }
          );
          mainImageRefs.current.forEach((ref) =>
            gsap.set(ref.current, { opacity: 0, x: 300 })
          );
        },
      });

      heroMeals.forEach((meal, index) => {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: `${(index / heroMeals.length) * 100}% top`,
          end: `${((index + 1) / heroMeals.length) * 100}% top`,
          onEnter: () => {
            gsap.fromTo(
              [titleRef.current, priceRef.current, descriptionRef.current],
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power2.out",
                onStart: () => {
                  if (titleRef.current)
                    titleRef.current.textContent = meal.title;
                  if (priceRef.current)
                    priceRef.current.textContent = meal.price;
                  if (descriptionRef.current)
                    descriptionRef.current.textContent = meal.description;
                },
              }
            );
            mainImageRefs.current.forEach((ref, i) => {
              if (i !== index) {
                gsap.to(ref.current, {
                  opacity: 0,
                  x: 300,
                  duration: 0.5,
                  ease: "power2.out",
                });
              }
            });
            gsap.fromTo(
              mainImageRefs.current[index].current,
              { opacity: 0, x: 300 },
              { opacity: 1, x: 0, duration: 1, ease: "power2.out" }
            );
          },
          onLeave: () => {
            if (index < heroMeals.length - 1) {
              gsap.set(mainImageRefs.current[index + 1].current, {
                opacity: 0,
                x: 300,
              });
            }
          },
          onEnterBack: () => {
            gsap.fromTo(
              [titleRef.current, priceRef.current, descriptionRef.current],
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power2.out",
                onStart: () => {
                  if (titleRef.current)
                    titleRef.current.textContent = meal.title;
                  if (priceRef.current)
                    priceRef.current.textContent = meal.price;
                  if (descriptionRef.current)
                    descriptionRef.current.textContent = meal.description;
                },
              }
            );
            mainImageRefs.current.forEach((ref, i) => {
              if (i !== index) {
                gsap.to(ref.current, {
                  opacity: 0,
                  x: 300,
                  duration: 0.5,
                  ease: "power2.out",
                });
              }
            });
            gsap.fromTo(
              mainImageRefs.current[index].current,
              { opacity: 0, x: 300 },
              { opacity: 1, x: 0, duration: 1, ease: "power2.out" }
            );
          },
        });
      });

      const floatingRefs = [
        floatingItem1Ref,
        floatingItem2Ref,
        floatingItem3Ref,
      ];
      heroMeals.forEach((meal, index) => {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: `${(index / heroMeals.length) * 100}% top`,
          end: `${((index + 1) / heroMeals.length) * 100}% top`,
          onUpdate: (self) => {
            const progress = self.progress;
            const radius = 250;
            const centerX = 250;
            const centerY = 200;
            const baseAngle = (index / heroMeals.length) * 360 + progress * 120;

            // floatingRefs.forEach((ref, i) => {
            //   const angle = baseAngle + i * 120;
            //   const x = centerX + Math.cos((angle * Math.PI) / 180) * radius;
            //   const y = centerY + Math.sin((angle * Math.PI) / 180) * radius;
            //   // Adjusted for new positions: top-right, middle-left, bottom-left
            //   const xAdj = x - (i === 0 ? 320 : i === 1 ? -32 : 16);
            //   const yAdj = y - (i === 0 ? 32 : i === 1 ? 200 : 320);

            //   gsap.set(ref.current, {
            //     x: xAdj,
            //     y: yAdj,
            //     rotation: progress * 360,
            //     scale: 0.9,
            //   });
            // });
          },
        });
      });

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []); // Remove meals dependency to prevent constant re-initialization

  return (
    <>
      <Header />
      <main className="bg-white">
        {/* Fixed Section Container */}
        <div ref={containerRef} className="mt-25 h-[300vh] relative">
          {/* <h1 className="text-4xl font-bold text-gray-900 mb-4 px-10">Hello {user?.user_metadata?.full_name || 'User'}!</h1> */}
          <div className="sticky top-0 h-screen flex items-center">
            <div className="min-h-screen overflow-hidden flex justify-center 2xl:justify-between 2xl:w-full mx-auto">
              <div className="flex items-center gap-16">
                {/* Content Side */}
                <div className="w-1/2 ml-10">
                  <h1
                    ref={titleRef}
                    className="text-4xl font-bold text-gray-900 mb-4"
                  >
                    {heroMeals[0].title}
                  </h1>
                  <div
                    ref={priceRef}
                    className="text-3xl font-bold text-green-500 mb-6"
                  >
                    {heroMeals[0].price}
                  </div>
                  <p
                    ref={descriptionRef}
                    className="text-lg text-gray-600 mb-8 leading-relaxed"
                  >
                    {heroMeals[0].description}
                  </p>
                  <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-full transition-colors duration-200">
                    Add to Cart
                  </button>
                </div>

                {/* Image Side with Decorative Elements */}
                <div className="w-1/2 relative -right-10">
                  {/* Large Green Circle Background */}
                  <div className="absolute inset-0 -right-50 flex items-center justify-center">
                    <div className="w-[650px] h-[650px] max-xl:w-[550px] max-xl:h-[550px] bg-green-100 rounded-full opacity-80"></div>
                  </div>

                  {/* Dotted Circle Path */}
                  <div className="absolute inset-0 -right-120 flex items-center justify-center">
                    <div className="w-[1100px] h-[800px] max-xl:w-[1000px] max-xl:h-[700px] border-2 border-dashed border-gray-500 rounded-full"></div>
                  </div>

                  {/* Main Food Images (stacked) */}
                  <div className="relative -right-15 z-10 flex items-center justify-center h-100">
                    <div className="relative w-[550px] h-[550px] max-xl:w-[450px] max-xl:h-[450px]">
                      {heroMeals.map((meal, index) => (
                        <Image
                          key={index}
                          ref={mainImageRefs.current[index]}
                          src={meal.image}
                          alt={meal.title}
                          width={550}
                          height={550}
                          className="absolute rounded-full shadow-lg"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Floating Food Items */}
                  <div
                    ref={floatingItem1Ref}
                    className="absolute -top-10 z-20"
                    style={{ 
                      left: `${calculateLeftPosition(0, screenWidth)}px` // Base left: 40px for left-10
                    }}
                  >
                    <div className="w-28 h-28 max-xl:w-20 max-xl:h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <Image
                        src="/images/dashboard/breakfast.png"
                        alt="Food item"
                        width={100}
                        height={100}
                        className="rounded-full"
                      />
                    </div>
                  </div>

                  <div
                    ref={floatingItem2Ref}
                    className="absolute top-40 z-20"
                    style={{ 
                      left: `${calculateLeftPosition(-40, screenWidth)}px` // Base left: 0px
                    }}
                  >
                    <div className="w-28 h-28 max-xl:w-20 max-xl:h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <Image
                        src="/images/dashboard/lunch.png"
                        alt="Food item"
                        width={100}
                        height={100}
                        className="rounded-full"
                      />
                    </div>
                  </div>

                  <div
                    ref={floatingItem3Ref}
                    className="absolute -bottom-20 z-20"
                    style={{ 
                      left: `${calculateLeftPosition(0, screenWidth)}px` // Base left: 60px for left-15
                    }}
                  >
                    <div className="w-28 h-28 max-xl:w-20 max-xl:h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <Image
                        src="/images/dashboard/dinner.png"
                        alt="Food item"
                        width={100}
                        height={100}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Statistics Sections */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Macros Log - Takes 1 column */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-green-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Macros Log</h2>
              
              {mealsLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
                  <p className="mt-4 text-lg text-gray-600">Loading Macros...</p>
                </div>
              ) : (
                <>
                  {/* Circular Progress with Calories */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-4">
                      <HomeCircularProgress
                        value={totalCalories}
                        max={userData?.tdee || 2000}
                        size={160}
                        strokeWidth={12}
                        color="#07da63"
                        trackColor="#e5f8ed"
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{isClient ? (totalCalories || 0) : 0}</div>
                          <div className="text-xs text-gray-500">Calories</div>
              </div>
                      </HomeCircularProgress>
                </div>

                    <div className="flex justify-between w-full text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">{isClient && userData?.tdee ? Math.round(userData.tdee * 0.9) : 1431}</div>
                        <div className="text-xs text-gray-500">Min</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">{isClient && userData?.tdee ? Math.round(userData.tdee * 1.1) : 2706}</div>
                        <div className="text-xs text-gray-500">Max</div>
                      </div>
                    </div>
                  </div>

                  {/* Macros Row */}
                  <div className="flex justify-between mb-4 px-2">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Protein</div>
                      <div className="text-lg font-bold text-gray-900">{isClient ? Math.round(macroTotals.protein) : 0}g</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Fat</div>
                      <div className="text-lg font-bold text-gray-900">{isClient ? Math.round(macroTotals.fats) : 0}g</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Carbs</div>
                      <div className="text-lg font-bold text-gray-900">{isClient ? Math.round(macroTotals.carbs) : 0}g</div>
                    </div>
                  </div>

                  {/* Single Tab Display */}
                  <div className="bg-gray-100 rounded-xl p-1">
                    <div className="bg-black rounded-lg py-2 text-center">
                      <span className="text-sm font-semibold text-white">Total Macros Today</span>
                    </div>
                  </div>
                </>
              )}
                  </div>

            {/* Weight Tracker Section */}
            <div className="bg-green-50 rounded-3xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Weight Tracker</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-500">Current Weight</span>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                  </div>
                </div>
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-gray-900">{userData?.weight || '0'}</span>
                    <span className="text-gray-400 ml-2 mb-1">{userData?.weightUnit || 'Kgs'}</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-500">BMI</span>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <span className="text-3xl font-bold" style={{ color: bmiColor }}>{currentBMI}</span>
                    <span className="text-gray-400 ml-2 mb-1">Index</span>
                  </div>
              </div>
            </div>

              <p className="text-sm text-gray-500 mb-6">
                Last Updated: {new Date().toLocaleDateString()}
              </p>

              <button 
                className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold hover:bg-green-600 transition-colors"
                onClick={() => {
                  setNewWeight(userData?.weight?.toString() || '');
                  setShowWeightModal(true);
                }}
              >
                UPDATE WEIGHT
              </button>
              </div>

            {/* Insights & Analytics Section */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-green-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Insights & Analytics</h2>
              <div className="space-y-6">
                {/* Weight Trend */}
                <div className="bg-gray-50 rounded-2xl p-4">
              <div className="mb-4">
                    <h4 className="text-lg font-bold text-gray-900">Weight Trend</h4>
                    <p className="text-sm text-gray-500">Sep 30 - Now</p>
                  </div>
                  <div className="flex items-end justify-between h-20 gap-2">
                    {[65, 45, 55, 70, 50, 75, 60].map((height, index) => (
                      <div 
                        key={index} 
                        className={`flex-1 rounded-sm ${
                          index % 2 === 0 ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                  ))}
                </div>
              </div>

                {/* BMI Status */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-gray-900">BMI Status</h4>
                    <p className="text-sm text-gray-500">Current</p>
              </div>
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold mb-2" style={{ color: bmiColor }}>{currentBMI}</div>
                    <div className="text-sm text-gray-500 mb-4">Body Mass Index</div>
                    <button 
                      className="flex items-center gap-2 text-sm font-semibold text-green-500 hover:text-green-600 transition-colors mx-auto"
                      onClick={() => router.push('/results/bmi?fromHome=true')}
                    >
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Select A Day and Plan Your Meals Section */}
          <div className="grid grid-cols-1 col-span-6 lg:grid-cols-6 gap-8">
            {/* Select A Day Section */}
            <div className="col-span-2">
              <h2 className="text-xl font-bold text-gray-500 mb-6">
                Select A Day
              </h2>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  sx={{
                    "& .MuiPickersDay-dayWithMargin": {
                      "&.Mui-selected": {
                        backgroundColor: "#22c55e",
                        "&:hover": {
                          backgroundColor: "#16a34a",
                        },
                      },
                    },
                    "& .MuiPickersCalendarHeader-root": {
                      "& .MuiPickersCalendarHeader-labelContainer": {
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>

            {/* Plan Your Meals Section */}
            <div className="col-span-4">
              <h2 className="text-xl font-bold text-gray-500 mb-6">
                Plan Your Meals
              </h2>

              {/* Meal Category Tabs */}
              <div className="flex gap-2 mb-6">
                <button className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Breakfast
                </button>
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-300">
                  Lunch
                </button>
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-300">
                  Dinner
                </button>
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-300">
                  Snacks
                </button>
              </div>

              {/* Meals Carousel */}
              <Carousel
                responsive={responsive}
                additionalTransfrom={0}
                arrows
                centerMode={false}
                containerClass="container-with-dots"
                draggable
                infinite
                keyBoardControl
                minimumTouchDrag={80}
                itemClass="px-2"
                rtl={false}
                shouldResetAutoplay
                slidesToSlide={1}
                swipeable
                pauseOnHover={true}
              >
                {mealPlanData.map((meal) => (
                  <div
                    key={meal.id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg"
                  >
                    <div className="relative h-36">
                      <Image
                        src={meal.image}
                        alt={meal.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 text-sm mb-1">
                        {meal.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-green-600 font-bold text-sm">
                          {meal.price}
                        </span>
                        <button className="bg-green-500 text-white rounded-full p-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </Carousel>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "70%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Weight Update Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-11/12 max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Update Weight</h3>
              <button 
                onClick={() => setShowWeightModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <label className="block text-base text-gray-600 mb-4">
              Enter your current weight (kg)
            </label>
            <input
              type="number"
              className="w-full bg-gray-50 rounded-xl p-5 text-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g. 70.5"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              autoFocus
            />

            <div className="flex gap-4 mt-8">
              <button
                className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                onClick={() => setShowWeightModal(false)}
                disabled={updatingWeight}
              >
                Cancel
              </button>
              <button
                className={`flex-1 py-4 rounded-xl font-bold text-white transition-colors ${
                  updatingWeight ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'
                }`}
                onClick={handleUpdateWeight}
                disabled={updatingWeight}
              >
                {updatingWeight ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
