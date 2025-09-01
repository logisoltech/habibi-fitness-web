"use client";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
import { useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentMealIndex, setCurrentMealIndex] = useState(0);
  const [screenWidth, setScreenWidth] = useState(0);

  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

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

  const meals = [
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

  const weeklyData = [
    { day: "MON", value: 450 },
    { day: "TUE", value: 520 },
    { day: "WED", value: 480 },
    { day: "THU", value: 600 },
    { day: "FRI", value: 580 },
    { day: "SAT", value: 650 },
    { day: "SUN", value: 590 },
  ];

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

  const mainImageRefs = useRef(meals.map(() => ({ current: null })));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, priceRef.current, descriptionRef.current], {
        opacity: 0,
        y: 30,
      });
      mainImageRefs.current.forEach((ref) =>
        gsap.set(ref.current, { opacity: 0, x: 300 })
      );
      if (titleRef.current) titleRef.current.textContent = meals[0].title;
      if (priceRef.current) priceRef.current.textContent = meals[0].price;
      if (descriptionRef.current)
        descriptionRef.current.textContent = meals[0].description;

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

      meals.forEach((meal, index) => {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: `${(index / meals.length) * 100}% top`,
          end: `${((index + 1) / meals.length) * 100}% top`,
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
            if (index < meals.length - 1) {
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
      meals.forEach((meal, index) => {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: `${(index / meals.length) * 100}% top`,
          end: `${((index + 1) / meals.length) * 100}% top`,
          onUpdate: (self) => {
            const progress = self.progress;
            const radius = 250;
            const centerX = 250;
            const centerY = 200;
            const baseAngle = (index / meals.length) * 360 + progress * 120;

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
  }, [meals]);

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
                    {meals[0].title}
                  </h1>
                  <div
                    ref={priceRef}
                    className="text-3xl font-bold text-green-500 mb-6"
                  >
                    {meals[0].price}
                  </div>
                  <p
                    ref={descriptionRef}
                    className="text-lg text-gray-600 mb-8 leading-relaxed"
                  >
                    {meals[0].description}
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
                      {meals.map((meal, index) => (
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Your Statistics Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-500">
                  Your Statistics
                </h2>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Main Circular Progress Chart */}
                <div className="col-span-2 lg:col-span-1 flex flex-col items-center justify-center p-6">
                  <CircularProgressChart 
                    targetValue={81} 
                    color="#10b981" 
                    trackColor="#dcfce7"
                    label="Total Kcal" 
                    size="lg"
                  />
                </div>

                {/* Small Circular Progress Charts */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-3">
                    <CircularProgressChart 
                      targetValue={22} 
                      color="#f97316" 
                      trackColor="#fed7aa"
                      label="Protein" 
                      size="sm"
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center p-3">
                    <CircularProgressChart 
                      targetValue={62} 
                      color="#60a5fa" 
                      trackColor="#dbeafe"
                      label="Carbs" 
                      size="sm"
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center p-3">
                    <CircularProgressChart 
                      targetValue={22} 
                      color="#fbbf24" 
                      trackColor="#fef3c7"
                      label="Fats" 
                      size="sm"
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center p-3">
                    <CircularProgressChart 
                      targetValue={62} 
                      color="#9ca3af" 
                      trackColor="#f3f4f6"
                      label="Fiber" 
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Your Weekly Count Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-500">
                  Your Weekly Count
                </h2>
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  {weeklyData.map((day) => (
                    <span key={day.day}>{day.day}</span>
                  ))}
                </div>
              </div>

              <div style={{ width: '100%', height: '200px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>

              <div className="mt-4 text-center">
                <p className="text-lg font-bold text-gray-900">659 Kcal</p>
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
      <Footer />
    </>
  );
}
