"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext";
import { useUserData } from "../../contexts/UserDataContext";

export default function Signup() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    phone: "",
    fullName: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const containerRef = useRef(null);
  const leaf1Ref = useRef(null);
  const leaf2Ref = useRef(null);
  const leaf3Ref = useRef(null);
  const router = useRouter();
  const { signUp, loading, error, clearError } = useAuth();
  const { updatePhone, updateName, checkUserExists, loadUserData } = useUserData();

  useEffect(() => {
    // Trigger entrance animation with leaves coming from login page
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    // Mouse move handler for parallax effect
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    // Scroll handler for parallax
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (leaf1Ref.current && leaf2Ref.current && leaf3Ref.current) {
        leaf1Ref.current.style.transform = `translateY(${scrollY * 0.4}px) rotate(${scrollY * 0.15}deg)`;
        leaf2Ref.current.style.transform = `translateY(${scrollY * -0.6}px) rotate(${180 + scrollY * -0.12}deg)`;
        leaf3Ref.current.style.transform = `translateY(${scrollY * 0.3}px) rotate(${90 + scrollY * 0.08}deg)`;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLoginTransition = (e) => {
    e.preventDefault();
    setIsTransitioning(true);

    // Animate leaves out during transition
    if (leaf1Ref.current && leaf2Ref.current && leaf3Ref.current) {
      leaf1Ref.current.style.transform = `translateX(200px) translateY(-100px) rotate(-45deg) scale(0.7)`;
      leaf2Ref.current.style.transform = `translateX(-200px) translateY(100px) rotate(135deg) scale(0.7)`;
      leaf3Ref.current.style.transform = `translateX(0) translateY(-200px) rotate(270deg) scale(0.5)`;
    }

    // Delay navigation for smooth transition
    setTimeout(() => {
      router.push("/auth/login");
    }, 300);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (submitError) setSubmitError("");
    if (error) clearError();
  };

  // OLD SIGN UP WITH OTP VERIFICATION - COMMENTED OUT
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   
  //   if (!formData.phone || !formData.fullName) {
  //     setSubmitError("Please fill in all fields");
  //     return;
  //   }
  //
  //   setIsSubmitting(true);
  //   setSubmitError("");
  //
  //   try {
  //     const result = await signUp(formData.phone, formData.fullName);
  //     
  //     // Store phone number for OTP verification
  //     sessionStorage.setItem('signup_phone', formData.phone);
  //     sessionStorage.setItem('signup_fullName', formData.fullName);
  //     
  //     // Navigate to OTP verification page
  //     router.push('/auth/verify-otp');
  //   } catch (error) {
  //     setSubmitError(error.message);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // NEW REGISTRATION FLOW - Navigate to onboarding
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone || !formData.fullName) {
      setSubmitError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Check if user already exists
      const userCheck = await checkUserExists(formData.phone);

      if (userCheck.exists) {
        // User exists - load their data and go to dashboard
        loadUserData(userCheck.user);
        
        // Save user data to localStorage for Header authentication
        localStorage.setItem('user_data', JSON.stringify(userCheck.user));
        
        setSubmitError("Account already exists! Redirecting to dashboard...");
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
        return;
      }

      // New user - save phone and name to context
      updatePhone(formData.phone);
      updateName(formData.fullName);

      // Store in session as backup
      sessionStorage.setItem('signup_phone', formData.phone);
      sessionStorage.setItem('signup_fullName', formData.fullName);

      // Navigate to onboarding page to continue registration
      router.push('/onboarding');
    } catch (error) {
      setSubmitError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate parallax offset based on mouse position
  const getParallaxStyle = (intensity = 1, reverse = false) => {
    const offsetX = (mousePosition.x - 0.5) * intensity * (reverse ? -1 : 1);
    const offsetY = (mousePosition.y - 0.5) * intensity * (reverse ? -1 : 1);
    return {
      transform: `translate(${offsetX * 25}px, ${offsetY * 25}px)`,
      transition: 'transform 0.15s ease-out',
    };
  };

  return (
    <section className="relative text-white overflow-hidden">
      <Header />

      {/* Signup Background */}
      <div
        ref={containerRef}
        className="relative min-h-screen flex items-center justify-center transition-all duration-500 ease-in-out"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(/images/login-bg.jpg)`,
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      >
        {/* Animated Leaf 01 - Top Left with Enhanced Parallax */}
        <div
          ref={leaf1Ref}
          className={`absolute top-36 left-16 z-20 transition-all duration-1200 ease-out ${isLoaded && !isTransitioning
              ? "translate-x-0 translate-y-0 opacity-100 scale-100"
              : isTransitioning
                ? "translate-x-[200px] translate-y-[-100px] opacity-0 scale-70 rotate-[-45deg]"
                : "translate-x-[-150px] translate-y-[-80px] opacity-0 scale-80"
            }`}
          style={{
            ...getParallaxStyle(1.8),
            animation: isLoaded ? 'floatSignupLeaf1 7s ease-in-out infinite' : 'none',
          }}
        >
          <Image
            src="/images/leaf.png"
            width={110}
            height={110}
            alt="Leaf"
            className="drop-shadow-2xl filter rotate-12"
          />
        </div>

        {/* Animated Glass Panel with Enhanced Parallax */}
        <div
          className={`mt-10 w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xs shadow-[0_20px_90px_-20px_rgba(0,0,0,.6)] transition-all duration-700 ease-out transform z-10 ${isLoaded && !isTransitioning
              ? "translate-y-0 opacity-100 scale-100"
              : isTransitioning
                ? "translate-y-8 opacity-0 scale-95"
                : "translate-y-8 opacity-0 scale-95"
            }`}
        >
          <div className="px-4 py-4 md:px-8 text-white">
            {/* Animated Logo */}
            <div
              className={`flex items-center justify-center mb-8 transition-all duration-500 delay-200 ${isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
                }`}
            >
              <img
                src="/images/logo-white.png"
                alt="Habibi Fitness"
                className="h-20 w-auto opacity-90 transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Error Message */}
            {(submitError || error) && (
              <div className={`mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm transition-all duration-500 delay-200 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}>
                {submitError || error}
              </div>
            )}

            {/* Animated Form */}
            <form
              onSubmit={handleSubmit}
              className={`space-y-5 md:space-y-6 transition-all duration-500 delay-300 ${isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
                }`}
            >
              {/* Phone Number Input */}
              <div className="relative">
                <label htmlFor="phone" className="sr-only">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter Your Phone Number"
                  className="input-transition w-full rounded-lg border border-black/10 bg-white text-black placeholder:text-gray-500 px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#18BD0F] focus:border-transparent"
                />
              </div>

              {/* Full Name Input with staggered animation */}
              <div className={`relative transition-all duration-500 delay-100 ${isLoaded ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                }`}>
                <label htmlFor="full_name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter Your Full Name"
                  className="input-transition w-full rounded-lg border border-black/10 bg-white text-black placeholder:text-gray-500 px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#18BD0F] focus:border-transparent"
                  required
                />
              </div>

              {/* Animated Signup button */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="btn-transition bg-[#18BD0F] hover:bg-[#18BD0F]/80 disabled:bg-gray-500 disabled:cursor-not-allowed w-full select-none rounded-full px-6 py-3.5 font-semibold text-white shadow-lg"
              >
                <span className="inline-block">
                  {isSubmitting || loading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner mr-2"></div>
                      {isSubmitting ? "Signing Up..." : "Loading..."}
                    </div>
                  ) : (
                    "Sign Up"
                  )}
                </span>
              </button>
            </form>

            {/* Animated Footer text */}
            <p className={`mt-7 text-center text-sm text-white/90 transition-all duration-500 delay-500 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}>
              Already have an account?{" "}
              <Link
                href="/auth/login"
                onClick={handleLoginTransition}
                className="underline font-semibold hover:opacity-90 transition-all duration-200 hover:scale-105 inline-block"
                style={{ color: "#74EB6E" }}
              >
                Login Here
              </Link>
            </p>
          </div>
        </div>

        {/* Animated Leaf 02 - Bottom Right with Enhanced Parallax */}
        <div
          ref={leaf2Ref}
          className={`absolute bottom-16 right-16 z-20 transition-all duration-1400 ease-out ${isLoaded && !isTransitioning
              ? "translate-x-0 translate-y-0 opacity-100 scale-100"
              : isTransitioning
                ? "translate-x-[-200px] translate-y-[100px] opacity-0 scale-70 rotate-[135deg]"
                : "translate-x-[150px] translate-y-[80px] opacity-0 scale-80"
            }`}
          style={{
            ...getParallaxStyle(1.5, true),
            animation: isLoaded ? 'floatSignupLeaf2 9s ease-in-out infinite' : 'none',
          }}
        >
          <Image
            src="/images/leaf.png"
            width={130}
            height={130}
            alt="Leaf"
            className="rotate-180 drop-shadow-2xl filter"
          />
        </div>

        {/* Animated Leaf 03 - Center Top with Unique Animation */}
        <div
          ref={leaf3Ref}
          className={`absolute top-10 left-1/2 transform -translate-x-1/2 z-15 transition-all duration-1600 ease-out ${isLoaded && !isTransitioning
              ? "translate-y-0 opacity-70 scale-100"
              : isTransitioning
                ? "translate-y-[-200px] opacity-0 scale-50 rotate-[270deg]"
                : "translate-y-[-100px] opacity-0 scale-60"
            }`}
          style={{
            ...getParallaxStyle(2.0),
            animation: isLoaded ? 'floatSignupLeaf3 11s ease-in-out infinite' : 'none',
          }}
        >
          <Image
            src="/images/leaf.png"
            width={90}
            height={90}
            alt="Leaf"
            className="rotate-90 drop-shadow-xl filter blur-[1px]"
          />
        </div>

        {/* Additional ambient leaves */}
        <div
          className={`absolute top-2/3 left-8 z-5 transition-all duration-2000 delay-600 ${isLoaded ? "opacity-50" : "opacity-0"
            }`}
          style={{
            ...getParallaxStyle(1.2),
            animation: isLoaded ? 'floatAmbient1 14s ease-in-out infinite' : 'none',
          }}
        >
          <Image
            src="/images/leaf.png"
            width={50}
            height={50}
            alt="Leaf"
            className="rotate-[120deg] blur-sm"
          />
        </div>

        <div
          className={`absolute bottom-2/3 right-8 z-5 transition-all duration-2000 delay-800 ${isLoaded ? "opacity-30" : "opacity-0"
            }`}
          style={{
            ...getParallaxStyle(0.9, true),
            animation: isLoaded ? 'floatAmbient2 16s ease-in-out infinite' : 'none',
          }}
        >
          <Image
            src="/images/leaf.png"
            width={70}
            height={70}
            alt="Leaf"
            className="rotate-[-60deg] blur-sm"
          />
        </div>

        {/* Animated vignette */}
        <div className="pointer-events-none absolute inset-0 rounded-none bg-gradient-to-b from-transparent via-transparent to-black/10 transition-opacity duration-500" />
      </div>

      <style jsx>{`
        @keyframes floatSignupLeaf1 {
          0%, 100% {
            transform: translateY(0) rotate(12deg) scale(1);
          }
          25% {
            transform: translateY(-12px) rotate(15deg) scale(1.08);
          }
          50% {
            transform: translateY(-8px) rotate(9deg) scale(0.95);
          }
          75% {
            transform: translateY(-18px) rotate(18deg) scale(1.02);
          }
        }

        @keyframes floatSignupLeaf2 {
          0%, 100% {
            transform: translateY(0) rotate(180deg) scale(1);
          }
          30% {
            transform: translateY(-15px) rotate(185deg) scale(1.05);
          }
          60% {
            transform: translateY(-10px) rotate(175deg) scale(0.92);
          }
          85% {
            transform: translateY(-20px) rotate(188deg) scale(1.08);
          }
        }

        @keyframes floatSignupLeaf3 {
          0%, 100% {
            transform: translateY(0) rotate(90deg) scale(1);
          }
          35% {
            transform: translateY(-25px) rotate(95deg) scale(1.15);
          }
          70% {
            transform: translateY(-12px) rotate(85deg) scale(0.88);
          }
        }

        @keyframes floatAmbient1 {
          0%, 100% {
            transform: translateY(0) rotate(120deg) scale(1);
          }
          50% {
            transform: translateY(-30px) rotate(135deg) scale(1.2);
          }
        }

        @keyframes floatAmbient2 {
          0%, 100% {
            transform: translateY(0) rotate(-60deg) scale(1);
          }
          50% {
            transform: translateY(-25px) rotate(-45deg) scale(1.1);
          }
        }

        @keyframes slideInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideOutDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-30px);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}