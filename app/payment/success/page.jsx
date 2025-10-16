"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown redirect to dashboard
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-gradient-to-br from-green-400 to-[#07da63] rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        {/* Success Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
        >
          Payment Successful! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-600 mb-8"
        >
          Welcome to <span className="font-bold text-[#07da63]">Habibi Fitness</span>! Your subscription is now active.
        </motion.p>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What's Next?
          </h3>
          <ul className="text-left space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-[#07da63] text-xl">✓</span>
              <span>Your account has been created successfully</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#07da63] text-xl">✓</span>
              <span>You'll receive a confirmation email shortly</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#07da63] text-xl">✓</span>
              <span>Your meal plan is being prepared</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#07da63] text-xl">✓</span>
              <span>Access your dashboard to view your personalized meals</span>
            </li>
          </ul>
        </motion.div>

        {/* Session ID (for reference) */}
        {sessionId && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-500 mb-6"
          >
            Transaction ID: {sessionId.slice(0, 20)}...
          </motion.p>
        )}

        {/* Redirect Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <p className="text-gray-600 mb-2">
            Redirecting to dashboard in <span className="font-bold text-[#07da63] text-xl">{countdown}</span> seconds...
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-green-400 to-[#07da63] text-white px-8 py-3 rounded-full font-bold hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Go to Dashboard Now
          </Link>
          <Link
            href="/menu"
            className="bg-white text-gray-700 border-2 border-gray-200 px-8 py-3 rounded-full font-bold hover:border-[#07da63] hover:text-[#07da63] transition-all duration-300"
          >
            View Menu
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}


