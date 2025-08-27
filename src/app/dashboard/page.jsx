"use client";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";
import dayjs from "dayjs";

gsap.registerPlugin(ScrollTrigger);

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentMealIndex, setCurrentMealIndex] = useState(0);

  // Define meals array first
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

  // Statistics data
  const statisticsData = [
    { id: 0, value: 81, label: "Total Kcal", color: "#22c55e" },
    { id: 1, value: 22, label: "Protein", color: "#f97316" },
    { id: 2, value: 53, label: "Carbs", color: "#3b82f6" },
    { id: 3, value: 22, label: "Fats", color: "#eab308" },
    { id: 4, value: 52, label: "Fiber", color: "#6b7280" },
  ];

  // Weekly count data
  const weeklyData = [
    { day: "MON", value: 450 },
    { day: "TUE", value: 520 },
    { day: "WED", value: 480 },
    { day: "THU", value: 600 },
    { day: "FRI", value: 580 },
    { day: "SAT", value: 650 },
    { day: "SUN", value: 590 },
  ];

  // Meal plan data for carousel
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

  // Carousel responsive config
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

  // Initialize mainImageRefs with refs for each meal
  const mainImageRefs = useRef(meals.map(() => ({ current: null })));

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup (no animation yet)
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

      // Create ScrollTrigger for the entire section
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 80%", // Trigger when 80% of the section is in view
        end: "bottom 20%", // End when 20% is left in view
        onEnter: () => {
          // Animate all elements when entering the section
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
          // Reset animations when leaving back up
          gsap.set(
            [titleRef.current, priceRef.current, descriptionRef.current],
            { opacity: 0, y: 30 }
          );
          mainImageRefs.current.forEach((ref) =>
            gsap.set(ref.current, { opacity: 0, x: 300 })
          );
        },
      });

      // Individual meal transitions based on scroll position
      meals.forEach((meal, index) => {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: `${(index / meals.length) * 100}% top`,
          end: `${((index + 1) / meals.length) * 100}% top`,
          onEnter: () => {
            // Animate text elements with smooth transition
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
            // Fade out all images except current
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
            // Fade in current image
            gsap.fromTo(
              mainImageRefs.current[index].current,
              { opacity: 0, x: 300 },
              { opacity: 1, x: 0, duration: 1, ease: "power2.out" }
            );
          },
          onLeave: () => {
            // Prepare for next image
            if (index < meals.length - 1) {
              gsap.set(mainImageRefs.current[index + 1].current, {
                opacity: 0,
                x: 300,
              });
            }
          },
          onEnterBack: () => {
            // Animate text elements with smooth transition
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
            // Fade out all images except current
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
            // Fade in current image
            gsap.fromTo(
              mainImageRefs.current[index].current,
              { opacity: 0, x: 300 },
              { opacity: 1, x: 0, duration: 1, ease: "power2.out" }
            );
          },
        });
      });

      // Floating items: cycle positions with rotation
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

            floatingRefs.forEach((ref, i) => {
              const angle = baseAngle + i * 120;
              const x = centerX + Math.cos((angle * Math.PI) / 180) * radius;
              const y = centerY + Math.sin((angle * Math.PI) / 180) * radius;
              const xAdj = x - (i === 0 ? 48 : i === 1 ? 0 : 32);
              const yAdj = y - (i === 0 ? 16 : i === 1 ? 144 : 320);

              gsap.set(ref.current, {
                x: xAdj,
                y: yAdj,
                rotation: progress * 360,
                scale: 0.9,
              });
            });
          },
        });
      });

      // Ensure initial state is set
      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, [meals]);

  return (
    <>
      <Header />
      <main className="bg-white">
        {/* Fixed Section Container */}
        <div ref={containerRef} className="h-[300vh] relative">
          <div className="sticky top-0 h-screen flex items-center">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-16">
                {/* Content Side */}
                <div className="w-1/2">
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
                <div className="w-1/2 relative">
                  {/* Large Green Circle Background */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-96 h-96 bg-green-100 rounded-full opacity-80"></div>
                  </div>

                  {/* Dotted Circle Path */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[500px] h-[500px] border-2 border-dashed border-gray-300 rounded-full"></div>
                  </div>

                  {/* Main Food Images (stacked) */}
                  <div className="relative z-10 flex items-center justify-center h-96">
                    <div className="relative w-[300px] h-[300px]">
                      {meals.map((meal, index) => (
                        <Image
                          key={index}
                          ref={mainImageRefs.current[index]}
                          src={meal.image}
                          alt={meal.title}
                          width={300}
                          height={300}
                          className="absolute top-0 left-0 rounded-full shadow-lg"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Floating Food Items */}
                  <div
                    ref={floatingItem1Ref}
                    className="absolute top-4 left-12 z-20"
                  >
                    <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <Image
                        src="/images/dashboard/breakfast.png"
                        alt="Food item"
                        width={60}
                        height={60}
                        className="rounded-full"
                      />
                    </div>
                  </div>

                  <div
                    ref={floatingItem2Ref}
                    className="absolute top-36 left-0 z-20"
                  >
                    <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <Image
                        src="/images/dashboard/lunch.png"
                        alt="Food item"
                        width={70}
                        height={70}
                        className="rounded-full"
                      />
                    </div>
                  </div>

                  <div
                    ref={floatingItem3Ref}
                    className="absolute bottom-4 left-8 z-20"
                  >
                    <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <Image
                        src="/images/dashboard/dinner.png"
                        alt="Food item"
                        width={60}
                        height={60}
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
                <h2 className="text-xl font-bold text-gray-900">
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
                {/* Main Pie Chart */}
                <div className="col-span-2 lg:col-span-1 flex flex-col items-center">
                  <PieChart
                    series={[
                      {
                        data: [
                          {
                            id: 0,
                            value: 81,
                            label: "Total",
                            color: "#22c55e",
                          },
                        ],
                        innerRadius: 60,
                        outerRadius: 80,
                      },
                    ]}
                    width={200}
                    height={200}
                    slotProps={{
                      legend: { hidden: true },
                    }}
                  />
                  <div className="text-center mt-2">
                    <p className="text-2xl font-bold text-gray-900">81%</p>
                    <p className="text-sm text-gray-600">Total Kcal</p>
                  </div>
                </div>

                {/* Small Charts */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <PieChart
                      series={[
                        {
                          data: [
                            { id: 0, value: 22, color: "#f97316" },
                            { id: 1, value: 78, color: "#e5e7eb" },
                          ],
                          innerRadius: 25,
                          outerRadius: 35,
                        },
                      ]}
                      width={100}
                      height={100}
                      slotProps={{
                        legend: { hidden: true },
                      }}
                    />
                    <p className="text-xs text-gray-600 mt-1">Protein</p>
                    <p className="text-sm font-bold">22%</p>
                  </div>

                  <div className="text-center">
                    <PieChart
                      series={[
                        {
                          data: [
                            { id: 0, value: 53, color: "#3b82f6" },
                            { id: 1, value: 47, color: "#e5e7eb" },
                          ],
                          innerRadius: 25,
                          outerRadius: 35,
                        },
                      ]}
                      width={100}
                      height={100}
                      slotProps={{
                        legend: { hidden: true },
                      }}
                    />
                    <p className="text-xs text-gray-600 mt-1">Carbs</p>
                    <p className="text-sm font-bold">53%</p>
                  </div>

                  <div className="text-center">
                    <PieChart
                      series={[
                        {
                          data: [
                            { id: 0, value: 22, color: "#eab308" },
                            { id: 1, value: 78, color: "#e5e7eb" },
                          ],
                          innerRadius: 25,
                          outerRadius: 35,
                        },
                      ]}
                      width={100}
                      height={100}
                      slotProps={{
                        legend: { hidden: true },
                      }}
                    />
                    <p className="text-xs text-gray-600 mt-1">Fats</p>
                    <p className="text-sm font-bold">22%</p>
                  </div>

                  <div className="text-center">
                    <PieChart
                      series={[
                        {
                          data: [
                            { id: 0, value: 52, color: "#6b7280" },
                            { id: 1, value: 48, color: "#e5e7eb" },
                          ],
                          innerRadius: 25,
                          outerRadius: 35,
                        },
                      ]}
                      width={100}
                      height={100}
                      slotProps={{
                        legend: { hidden: true },
                      }}
                    />
                    <p className="text-xs text-gray-600 mt-1">Fiber</p>
                    <p className="text-sm font-bold">52%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Weekly Count Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
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

                              <LineChart
                  width={400}
                  height={200}
                  series={[
                    {
                      data: weeklyData.map((item) => item.value),
                      area: true,
                      color: "#22c55e",
                    },
                  ]}
                  xAxis={[{
                    scaleType: 'point',
                    data: weeklyData.map(item => item.day),
                    hideTooltip: true,
                    tickLabelStyle: { display: 'none' },
                    axisLine: false,
                    tickLine: false,
                  }]}
                  yAxis={[{
                    hideTooltip: true,
                    tickLabelStyle: { display: 'none' },
                    axisLine: false,
                    tickLine: false,
                    grid: false,
                  }]}
                  margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
                />

              <div className="mt-4 text-center">
                <p className="text-lg font-bold text-gray-900">659 Kcal</p>
                <p className="text-xs text-gray-600">
                  Turn system flow off track competitive city
                </p>
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
                autoPlay
                autoPlaySpeed={3000}
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
                      <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
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
