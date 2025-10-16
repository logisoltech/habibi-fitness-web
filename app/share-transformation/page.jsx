"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { font } from '../components/font/font';
import Header from '../components/Header';

export default function Share() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const isFormValid = name.trim() && email.trim() && phone.trim() && beforeImage && afterImage;

  const pickImage = async (type) => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target.result;
          if (type === 'before') {
            setBeforeImage(imageUrl);
          } else {
            setAfterImage(imageUrl);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  const removeImage = (type) => {
    if (type === 'before') {
      setBeforeImage(null);
    } else {
      setAfterImage(null);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      alert('Please fill in all fields and upload both images');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Your transformation has been shared successfully.');
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Transformation</h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Inspire others by sharing your fitness journey! Upload your before and after photos.
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

            {/* Before Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Before Picture
              </label>
              <button 
                type="button"
                onClick={() => pickImage('before')}
                className="w-full border-2 border-dashed border-gray-300 rounded-2xl min-h-[200px] flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {beforeImage ? (
                  <div className="relative w-full h-[200px]">
                    <img 
                      src={beforeImage} 
                      alt="Before" 
                      className="w-full h-full object-cover rounded-2xl" 
                    />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage('before');
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-base font-semibold text-gray-700 mb-1">Upload Before Photo</p>
                    <p className="text-sm text-gray-500">Click to select from your device</p>
                  </div>
                )}
              </button>
            </div>

            {/* After Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                After Picture
              </label>
              <button 
                type="button"
                onClick={() => pickImage('after')}
                className="w-full border-2 border-dashed border-gray-300 rounded-2xl min-h-[200px] flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {afterImage ? (
                  <div className="relative w-full h-[200px]">
                    <img 
                      src={afterImage} 
                      alt="After" 
                      className="w-full h-full object-cover rounded-2xl" 
                    />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage('after');
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-base font-semibold text-gray-700 mb-1">Upload After Photo</p>
                    <p className="text-sm text-gray-500">Click to select from your device</p>
                  </div>
                )}
              </button>
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
                  Sharing...
                </div>
              ) : (
                'Share Transformation'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
