"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  
  const containerRef = useRef(null);
  const leaf1Ref = useRef(null);
  const leaf2Ref = useRef(null);
  const leaf3Ref = useRef(null);
  const router = useRouter();
  const { verifyOTP, loading, error, clearError } = useAuth();

  useEffect(() => {
    // Get phone number and full name from session storage
    const storedPhone = sessionStorage.getItem('signup_phone') || sessionStorage.getItem('login_phone');
    const storedFullName = sessionStorage.getItem('signup_fullName');
    
    if (!storedPhone) {
      // If no phone number, redirect to login
      router.push('/auth/login');
      return;
    }
    
    setPhoneNumber(storedPhone);
    setFullName(storedFullName);
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

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [router]);

  // Calculate parallax offset based on mouse position
  const getParallaxStyle = (intensity = 1, reverse = false) => {
    const offsetX = (mousePosition.x - 0.5) * intensity * (reverse ? -1 : 1);
    const offsetY = (mousePosition.y - 0.5) * intensity * (reverse ? -1 : 1);
    return {
      transform: `translate(${offsetX * 20}px, ${offsetY * 20}px)`,
      transition: 'transform 0.1s ease-out',
    };
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Clear errors when user starts typing
    if (submitError) setSubmitError("");
    if (error) clearError();
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setSubmitError("Please enter all 6 digits");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await verifyOTP(phoneNumber, otpString);
      
      // Check if user came from login or signup to determine redirect
      const isFromLogin = sessionStorage.getItem('login_phone');
      const isFromSignup = sessionStorage.getItem('signup_phone');
      
      // Clear session storage
      sessionStorage.removeItem('signup_phone');
      sessionStorage.removeItem('login_phone');
      sessionStorage.removeItem('signup_fullName');
      
      // Redirect based on where user came from
      if (isFromLogin) {
        router.push('/dashboard');
      } else if (isFromSignup) {
        router.push('/user-preference');
      }
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      // You can implement resend OTP logic here
      setSubmitError("");
      // For now, just show a message
      alert("OTP resent successfully!");
    } catch (error) {
      setSubmitError("Failed to resend OTP");
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <section className="relative text-white overflow-hidden">
      <Header />

      {/* OTP Verification Background */}
      <div
        ref={containerRef}
        className="relative min-h-screen flex items-center justify-center transition-all duration-500 ease-in-out"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(/images/login-bg.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Animated Leaf 01 - Top Right */}
        <div
          ref={leaf1Ref}
          className={`absolute top-20 right-20 z-20 transition-all duration-1000 ease-out ${
            isLoaded ? "translate-x-0 translate-y-0 opacity-100 scale-100" : "translate-x-[100px] translate-y-[-50px] opacity-0 scale-75"
          }`}
          style={{
            ...getParallaxStyle(1.5),
            animation: isLoaded ? 'floatLeaf1 6s ease-in-out infinite' : 'none',
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
          className={`w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xs shadow-[0_20px_90px_-20px_rgba(0,0,0,.6)] transition-all duration-700 ease-out transform z-10 ${
            isLoaded ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
          }`}
          style={getParallaxStyle(0.5)}
        >
          <div className="px-8 py-10 md:px-12 md:py-12 text-white">
            {/* Animated Logo */}
            <div
              className={`flex items-center justify-center mb-8 transition-all duration-500 delay-200 ${
                isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
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
              <div className={`mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm transition-all duration-500 delay-200 ${
                isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}>
                {submitError || error}
              </div>
            )}

            {/* OTP Verification Form */}
            <div
              className={`transition-all duration-500 delay-300 ${
                isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Verify Your Phone</h2>
                <p className="text-white/80 text-sm">
                  We sent a 6-digit code to <span className="font-semibold">{phoneNumber}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Input Fields */}
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold rounded-lg border border-white/30 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#18BD0F] focus:border-transparent transition-all duration-200"
                    />
                  ))}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="btn-transition bg-[#18BD0F] hover:bg-[#18BD0F]/80 disabled:bg-gray-500 disabled:cursor-not-allowed w-full select-none rounded-full px-6 py-3.5 font-semibold text-white shadow-lg"
                >
                  <span className="inline-block">
                    {isSubmitting || loading ? (
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner mr-2"></div>
                        {isSubmitting ? "Verifying..." : "Loading..."}
                      </div>
                    ) : (
                      "Verify Account"
                    )}
                  </span>
                </button>

                {/* Resend Link */}
                <div className="text-center">
                  <p className="text-white/80 text-sm">
                    Didn't receive code?{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      className="underline font-semibold hover:opacity-90 transition-all duration-200 hover:scale-105 text-[#74EB6E]"
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Animated Leaf 02 - Bottom Left */}
        <div
          ref={leaf2Ref}
          className={`absolute bottom-20 left-20 z-20 transition-all duration-1000 ease-out ${
            isLoaded ? "translate-x-0 translate-y-0 opacity-100 scale-100" : "translate-x-[-100px] translate-y-[50px] opacity-0 scale-75"
          }`}
          style={{
            ...getParallaxStyle(1.2, true),
            animation: isLoaded ? 'floatLeaf2 8s ease-in-out infinite' : 'none',
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

        {/* Animated Leaf 03 - Center Top */}
        <div
          ref={leaf3Ref}
          className={`absolute top-10 left-1/2 transform -translate-x-1/2 z-15 transition-all duration-1600 ease-out ${
            isLoaded ? "translate-y-0 opacity-70 scale-100" : "translate-y-[-100px] opacity-0 scale-60"
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

        {/* Animated vignette */}
        <div className="pointer-events-none absolute inset-0 rounded-none bg-gradient-to-b from-transparent via-transparent to-black/10 transition-opacity duration-500" />
      </div>

      <style jsx>{`
        @keyframes floatLeaf1 {
          0%, 100% {
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
          0%, 100% {
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
      `}</style>
    </section>
  );
}