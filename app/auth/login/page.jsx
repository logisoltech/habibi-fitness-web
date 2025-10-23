"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const containerRef = useRef(null);
  const leaf1Ref = useRef(null);
  const leaf2Ref = useRef(null);

  const router = useRouter();
  const { login, loading, error, clearError } = useAuth();

  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null

  useEffect(() => {
    if (userId) {
      router.push('/dashboard')
      return
    }
  })

  useEffect(() => {
    // Trigger entrance animation
    setIsLoaded(true);

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
      if (leaf1Ref.current && leaf2Ref.current) {
        leaf1Ref.current.style.transform = `translateY(${scrollY * 0.5
          }px) rotate(${scrollY * 0.1}deg)`;
        leaf2Ref.current.style.transform = `translateY(${scrollY * -0.3
          }px) rotate(${180 + scrollY * -0.1}deg)`;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }
    window.addEventListener("scroll", handleScroll);

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSignupTransition = (e) => {
    e.preventDefault();
    setIsTransitioning(true);

    // Animate leaves out during transition
    if (leaf1Ref.current && leaf2Ref.current) {
      leaf1Ref.current.style.transform = `translateX(-200px) translateY(-100px) rotate(45deg) scale(0.8)`;
      leaf2Ref.current.style.transform = `translateX(200px) translateY(100px) rotate(225deg) scale(0.8)`;
    }

    // Delay navigation for smooth transition
    setTimeout(() => {
      router.push("/auth/sign-up");
    }, 300);
  };

  const handleInputChange = (e) => {
    setPhoneNumber(e.target.value);
    if (submitError) setSubmitError("");
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber) {
      setSubmitError("Please enter your phone number");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // const result = await login(phoneNumber);

      // // Store phone number for OTP verification
      // sessionStorage.setItem('login_phone', phoneNumber);

      // // Navigate to OTP verification page
      // router.push('/auth/verify-otp');

      // Use server.js API directly instead of Next.js API
      const response = await fetch(
        "https://habibi-fitness-server.onrender.com/api/users/phone/" +
        encodeURIComponent(phoneNumber),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        // Store user data in localStorage for home page
        localStorage.setItem("user_data", JSON.stringify(result.data));

        // Navigate directly to home page
        router.push("/dashboard");
      } else {
        setSubmitError(
          result.message || "User not found. Please sign up first."
        );
      }
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate parallax offset based on mouse position
  const getParallaxStyle = (intensity = 1, reverse = false) => {
    const offsetX = (mousePosition.x - 0.5) * intensity * (reverse ? -1 : 1);
    const offsetY = (mousePosition.y - 0.5) * intensity * (reverse ? -1 : 1);
    return {
      transform: `translate(${offsetX * 20}px, ${offsetY * 20}px)`,
      transition: "transform 0.1s ease-out",
    };
  };

  return (
    <section className="relative text-white overflow-hidden">
      <Header />

      {/* Login Background */}
      <div
        ref={containerRef}
        className="pt-[100px] relative h-screen flex items-center justify-center transition-all duration-500 ease-in-out"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(/images/login-bg.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Animated Leaf 01 - Top Right with Parallax */}
        <div
          ref={leaf1Ref}
          className={`absolute top-20 right-20 z-20 transition-all duration-1000 ease-out ${isLoaded && !isTransitioning
              ? "translate-x-0 translate-y-0 opacity-100 scale-100"
              : isTransitioning
                ? "translate-x-[-200px] translate-y-[-100px] opacity-0 scale-75 rotate-45"
                : "translate-x-[100px] translate-y-[-50px] opacity-0 scale-75"
            }`}
          style={{
            ...getParallaxStyle(1.5),
            animation: isLoaded ? "floatLeaf1 6s ease-in-out infinite" : "none",
          }}
        >
          <Image
            src="/images/leaf.png"
            width={120}
            height={120}
            alt="Leaf"
            className="drop-shadow-2xl filter"
          />
        </div>

        {/* Animated Glass Panel */}
        <div
          className={`w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xs shadow-[0_20px_90px_-20px_rgba(0,0,0,.6)] transition-all duration-700 ease-out transform z-10 ${isLoaded && !isTransitioning
              ? "translate-y-0 opacity-100 scale-100"
              : isTransitioning
                ? "translate-y-8 opacity-0 scale-95"
                : "translate-y-8 opacity-0 scale-95"
            }`}
        >
          <div className="px-8 py-10 md:px-12 md:py-12 text-white">
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
              <div
                className={`mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm transition-all duration-500 delay-200 ${isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                  }`}
              >
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
              <div className="relative">
                <label htmlFor="phone" className="sr-only">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  value={phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Your Phone Number"
                  className="input-transition w-full rounded-lg border border-black/10 bg-white text-black placeholder:text-gray-500 px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#18BD0F] focus:border-transparent"
                  required
                />
              </div>

              {/* Animated Login button */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="btn-transition bg-[#18BD0F] hover:bg-[#18BD0F]/80 disabled:bg-gray-500 disabled:cursor-not-allowed w-full select-none rounded-full px-6 py-3.5 font-semibold text-white shadow-lg"
              >
                <span className="inline-block">
                  {isSubmitting || loading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner mr-2"></div>
                      {isSubmitting ? "Logging In..." : "Loading..."}
                    </div>
                  ) : (
                    "Login"
                  )}
                </span>
              </button>
            </form>

            {/* Animated Footer text */}
            <p
              className={`mt-7 text-center text-sm text-white/90 transition-all duration-500 delay-400 ${isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
                }`}
            >
              Don't have an account?{" "}
              <Link
                href="/auth/sign-up"
                onClick={handleSignupTransition}
                className="underline font-semibold hover:opacity-90 transition-all duration-200 hover:scale-105 inline-block"
                style={{ color: "#74EB6E" }}
              >
                Sign Up Here
              </Link>
            </p>
          </div>
        </div>

        {/* Animated Leaf 02 - Bottom Left with Parallax */}
        <div
          ref={leaf2Ref}
          className={`absolute bottom-20 left-20 z-20 transition-all duration-1000 ease-out ${isLoaded && !isTransitioning
              ? "translate-x-0 translate-y-0 opacity-100 scale-100"
              : isTransitioning
                ? "translate-x-[200px] translate-y-[100px] opacity-0 scale-75 rotate-[225deg]"
                : "translate-x-[-100px] translate-y-[50px] opacity-0 scale-75"
            }`}
          style={{
            ...getParallaxStyle(1.2, true),
            animation: isLoaded ? "floatLeaf2 8s ease-in-out infinite" : "none",
          }}
        >
          <Image
            src="/images/leaf.png"
            width={100}
            height={100}
            alt="Leaf"
            className="rotate-180 drop-shadow-2xl filter"
          />
        </div>

        {/* Additional floating leaves for ambiance */}
        <div
          className={`absolute top-1/3 left-10 z-5 transition-all duration-1500 delay-500 ${isLoaded ? "opacity-60" : "opacity-0"
            }`}
          style={{
            ...getParallaxStyle(0.8),
            animation: isLoaded
              ? "floatLeaf3 10s ease-in-out infinite"
              : "none",
          }}
        >
          <Image
            src="/images/leaf.png"
            width={60}
            height={60}
            alt="Leaf"
            className="rotate-45 blur-sm"
          />
        </div>

        <div
          className={`absolute bottom-1/3 right-10 z-5 transition-all duration-1500 delay-700 ${isLoaded ? "opacity-40" : "opacity-0"
            }`}
          style={{
            ...getParallaxStyle(1.0, true),
            animation: isLoaded
              ? "floatLeaf4 12s ease-in-out infinite"
              : "none",
          }}
        >
          <Image
            src="/images/leaf.png"
            width={80}
            height={80}
            alt="Leaf"
            className="rotate-[-30deg] blur-sm"
          />
        </div>

        {/* Animated vignette */}
        <div className="pointer-events-none absolute inset-0 rounded-none bg-gradient-to-b from-transparent via-transparent to-black/10 transition-opacity duration-500" />
      </div>

      <style jsx>{`
        @keyframes floatLeaf1 {
          0%,
          100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-10px) rotate(2deg) scale(1.05);
          }
          50% {
            transform: translateY(-5px) rotate(-1deg) scale(1);
          }
          75% {
            transform: translateY(-15px) rotate(3deg) scale(0.98);
          }
        }

        @keyframes floatLeaf2 {
          0%,
          100% {
            transform: translateY(0) rotate(180deg) scale(1);
          }
          30% {
            transform: translateY(-8px) rotate(182deg) scale(1.02);
          }
          60% {
            transform: translateY(-12px) rotate(178deg) scale(0.98);
          }
          90% {
            transform: translateY(-4px) rotate(181deg) scale(1.01);
          }
        }

        @keyframes floatLeaf3 {
          0%,
          100% {
            transform: translateY(0) rotate(45deg) scale(1);
          }
          33% {
            transform: translateY(-20px) rotate(50deg) scale(1.1);
          }
          66% {
            transform: translateY(-8px) rotate(40deg) scale(0.9);
          }
        }

        @keyframes floatLeaf4 {
          0%,
          100% {
            transform: translateY(0) rotate(-30deg) scale(1);
          }
          40% {
            transform: translateY(-15px) rotate(-25deg) scale(1.05);
          }
          80% {
            transform: translateY(-5px) rotate(-35deg) scale(0.95);
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
