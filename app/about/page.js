"use client";

import React from 'react';
import Image from 'next/image';
import { font } from '../components/font/font';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className={`${font.className} min-h-screen bg-white`}>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 bg-gradient-to-br from-green-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  About <span className="text-[#18BD0F]">Habibi Fitness</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  We&apos;re passionate about making healthy eating simple, delicious, and accessible. 
                  Our mission is to transform your relationship with food through personalized 
                  meal plans that fit your lifestyle and goals.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-[#18BD0F] text-white px-6 py-3 rounded-full font-semibold">
                    🥗 Fresh Ingredients
                  </div>
                  <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold">
                    🎯 Personalized Plans
                  </div>
                  <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold">
                    🚚 Convenient Delivery
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/landing-bg.png"
                    alt="Healthy meals and fitness"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                {/* Floating stats */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#18BD0F]">1000+</div>
                    <div className="text-sm text-gray-600">Happy Customers</div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#18BD0F]">50+</div>
                    <div className="text-sm text-gray-600">Meal Options</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                To make healthy eating effortless and enjoyable for everyone, regardless of their 
                dietary preferences, fitness goals, or busy schedules.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors">
                <div className="w-16 h-16 bg-[#18BD0F] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Personalized Nutrition</h3>
                <p className="text-gray-600">
                  Every meal plan is tailored to your specific goals, preferences, and dietary requirements.
                </p>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors">
                <div className="w-16 h-16 bg-[#18BD0F] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Fresh & Quality</h3>
                <p className="text-gray-600">
                  We source the freshest ingredients and prepare meals with the highest quality standards.
                </p>
              </div>
              
              <div className="text-center p-8 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors">
                <div className="w-16 h-16 bg-[#18BD0F] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Convenience</h3>
                <p className="text-gray-600">
                  Skip meal prep and planning. We deliver ready-to-eat meals right to your doorstep.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                <div className="space-y-6 text-gray-600">
                  <p>
                    Habibi Fitness was born from a simple realization: eating healthy shouldn&apos;t be complicated. 
                    As fitness enthusiasts and nutrition experts, we struggled with meal prep, finding time to cook, 
                    and maintaining consistent healthy eating habits.
                  </p>
                  <p>
                    We noticed that many people, despite their best intentions, found it challenging to stick to 
                    healthy eating plans due to lack of time, knowledge, or motivation. That&apos;s when we decided to 
                    create a solution that would make healthy eating effortless and enjoyable.
                  </p>
                  <p>
                    Today, we&apos;re proud to serve thousands of customers with personalized meal plans that not only 
                    taste amazing but also help them achieve their health and fitness goals. Our team of nutritionists, 
                    chefs, and fitness experts work together to ensure every meal is perfectly balanced and delicious.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="text-3xl font-bold text-[#18BD0F] mb-2">2020</div>
                    <div className="text-sm text-gray-600">Founded</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="text-3xl font-bold text-[#18BD0F] mb-2">1000+</div>
                    <div className="text-sm text-gray-600">Meals Served</div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="text-3xl font-bold text-[#18BD0F] mb-2">50+</div>
                    <div className="text-sm text-gray-600">Meal Varieties</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="text-3xl font-bold text-[#18BD0F] mb-2">24/7</div>
                    <div className="text-sm text-gray-600">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These core values guide everything we do at Habibi Fitness
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#18BD0F] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">💚</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Health First</h3>
                <p className="text-gray-600">
                  Every decision we make prioritizes your health and well-being above all else.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-[#18BD0F] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Transparency</h3>
                <p className="text-gray-600">
                  We&apos;re open about our ingredients, processes, and nutritional information.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-[#18BD0F] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🌟</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Excellence</h3>
                <p className="text-gray-600">
                  We continuously strive to improve our meals, service, and customer experience.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-[#18BD0F] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🤗</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Community</h3>
                <p className="text-gray-600">
                  We believe in supporting and empowering our community to live healthier lives.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-[#18BD0F] to-green-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Your Healthy Journey?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join thousands of satisfied customers who have transformed their eating habits with Habibi Fitness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/menu"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#18BD0F] font-semibold rounded-full hover:bg-gray-100 transition-colors"
              >
                Explore Our Menu
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="/auth/sign-up"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-[#18BD0F] transition-colors"
              >
                Get Started Today
              </a>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}