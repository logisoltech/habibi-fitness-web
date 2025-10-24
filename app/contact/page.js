"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { font } from '../components/font/font';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 2000);
  };

  return (
    <>
      <Header />
      <div className={`${font.className} min-h-screen bg-white`}>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 bg-gradient-to-br from-green-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Get in <span className="text-[#18BD0F]">Touch</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Have questions about our meal plans? Need help with your order? 
                We&apos;re here to help! Reach out to us and we&apos;ll get back to you within 24 hours.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    ✅ Thank you for your message! We&apos;ll get back to you within 24 hours.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18BD0F] focus:border-transparent transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18BD0F] focus:border-transparent transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18BD0F] focus:border-transparent transition-colors"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18BD0F] focus:border-transparent transition-colors"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="order">Order Support</option>
                        <option value="nutrition">Nutrition Questions</option>
                        <option value="delivery">Delivery Issues</option>
                        <option value="billing">Billing Support</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18BD0F] focus:border-transparent transition-colors resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#18BD0F] text-white font-semibold py-4 px-8 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        Sending Message...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                  <p className="text-gray-600 mb-8">
                    We&apos;re here to help! Choose the most convenient way to reach us.
                  </p>
                </div>

                {/* Contact Cards */}
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-[#18BD0F] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Phone</h3>
                      <p className="text-gray-600 mb-2">Call us for immediate assistance</p>
                      <a href="tel:+1234567890" className="text-[#18BD0F] font-medium hover:underline">
                        +1 (234) 567-8900
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-[#18BD0F] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600 mb-2">Send us an email anytime</p>
                      <a href="mailto:support@habibifitness.com" className="text-[#18BD0F] font-medium hover:underline">
                        support@habibifitness.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-[#18BD0F] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Address</h3>
                      <p className="text-gray-600 mb-2">Visit our headquarters</p>
                      <p className="text-gray-700">
                        123 Fitness Street<br />
                        Health City, HC 12345<br />
                        United States
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-[#18BD0F] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Business Hours</h3>
                      <p className="text-gray-600 mb-2">We&apos;re here to help</p>
                      <div className="text-gray-700 space-y-1">
                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                        <p>Saturday: 10:00 AM - 4:00 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">
                Quick answers to common questions about our services
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How do I place an order?</h3>
                <p className="text-gray-600">
                  Simply browse our menu, select your meals, and proceed to checkout. You can customize your meal plan based on your dietary preferences and fitness goals.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What are your delivery areas?</h3>
                <p className="text-gray-600">
                  We currently deliver to major cities across the United States. Check our delivery page or contact us to confirm if we deliver to your area.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I modify my meal plan?</h3>
                <p className="text-gray-600">
                  Yes! You can modify your meal plan anytime through your dashboard. You can skip meals, change delivery dates, or update your dietary preferences.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What if I have dietary restrictions?</h3>
                <p className="text-gray-600">
                  We accommodate various dietary restrictions including vegetarian, vegan, gluten-free, keto, and more. Just let us know your requirements when you sign up.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How do I cancel my subscription?</h3>
                <p className="text-gray-600">
                  You can cancel your subscription anytime from your account dashboard or by contacting our support team. There are no cancellation fees.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-[#18BD0F] to-green-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Our support team is here to help you 24/7. Don&apos;t hesitate to reach out!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+1234567890"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#18BD0F] font-semibold rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Us Now
              </a>
              <a
                href="mailto:support@habibifitness.com"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-[#18BD0F] transition-colors"
              >
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </a>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}