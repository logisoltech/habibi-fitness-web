"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { font } from '../components/font/font';
import Header from '../components/Header';

export default function Feedback() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid = name.trim() && email.trim() && phone.trim() && review.trim();

  const handleSubmit = async () => {
    if (!isFormValid) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Your feedback has been submitted successfully.');
      router.back();
    }, 1500);
  };

  return (
    <>
      <Header />
      <div className={`${font.className} max-w-6xl mx-auto p-6 bg-white min-h-screen mt-[100px]`}>
        <div className="max-w-2xl mx-auto">
          {/* Title Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">We'd Love Your Feedback</h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Your opinion matters! Help us improve by sharing your thoughts and experiences.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6 mb-8">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full text-base bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full text-base bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+92 000 0000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full text-base bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Review TextArea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                placeholder="Share your experience with us..."
                rows={6}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t border-gray-100 pt-6">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
              className={`w-full py-3 px-4 rounded-full text-base font-semibold transition-colors ${
                isFormValid && !loading
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-green-200 text-white cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
