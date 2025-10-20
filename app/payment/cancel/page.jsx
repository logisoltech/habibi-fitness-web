"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center"
      >
        {/* Cancel Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-6 flex items-center justify-center"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.div>

        {/* Cancel Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
        >
          Payment Cancelled
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-600 mb-8"
        >
          Your payment was cancelled. No charges were made to your account.
        </motion.p>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What happened?
          </h3>
          <ul className="text-left space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-orange-500 text-xl">•</span>
              <span>You cancelled the payment process</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 text-xl">•</span>
              <span>Your meal plan preferences have been saved</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 text-xl">•</span>
              <span>You can complete your subscription at any time</span>
            </li>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/user-preference"
            className="bg-gradient-to-r from-green-400 to-[#07da63] text-white px-8 py-3 rounded-full font-bold hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="bg-white text-gray-700 border-2 border-gray-200 px-8 py-3 rounded-full font-bold hover:border-gray-400 transition-all duration-300"
          >
            Back to Home
          </Link>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 pt-6 border-t border-gray-200"
        >
          <p className="text-sm text-gray-500">
            Need help? <Link href="/contact" className="text-[#07da63] font-semibold hover:underline">Contact our support team</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}


