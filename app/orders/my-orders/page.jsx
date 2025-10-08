"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { font } from "../../components/font/font";
import Header from "../../components/Header";

export default function MyOrders() {
  const router = useRouter();

  // Sample orders data matching the image
  const orders = [
    {
      id: 1,
      planName: "Balanced Plan, Week 2",
      category: "OPTIONAL",
      price: "AED 1083.66",
      totalMeals: 12,
      status: "In Progress",
      statusColor: "#FFA500",
      statusIcon: "time",
    },
    {
      id: 2,
      planName: "Balanced Plan, Week 3",
      category: "OPTIONAL",
      price: "AED 860.66",
      totalMeals: 10,
      status: "Cancelled",
      statusColor: "#FF6B6B",
      statusIcon: "close-circle",
    },
    {
      id: 3,
      planName: "Balanced Plan, Week 1",
      category: "OPTIONAL",
      price: "AED 1083.66",
      totalMeals: 12,
      status: "Delivered",
      statusColor: "#4CAF50",
      statusIcon: "checkmark-circle",
    },
  ];

  const handleBackPress = () => {
    router.back();
  };

  const getStatusIcon = (iconName) => {
    const iconMap = {
      time: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      "close-circle": (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      "checkmark-circle": (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };
    return iconMap[iconName] || iconMap["time"];
  };

  const renderOrderCard = (order) => (
    <div
      key={order.id}
      className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {order.planName}
          </h3>
          <p className="text-xs text-gray-500 font-medium">{order.category}</p>
        </div>
        <div
          className="flex items-center px-2 py-1 rounded-xl ml-2"
          style={{ backgroundColor: order.statusColor }}
        >
          <div className="text-white">{getStatusIcon(order.statusIcon)}</div>
          <span className="text-xs text-white font-semibold ml-1">
            {order.status}
          </span>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">Total Amount</p>
          <p className="text-sm font-semibold text-gray-900">{order.price}</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">Total Meals</p>
          <p className="text-sm font-semibold text-gray-900">
            {order.totalMeals}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div
        className={`${font.className} max-w-6xl mx-auto p-6 bg-white min-h-screen mt-[100px]`}
      >
        <div>
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
            <button
              onClick={handleBackPress}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">My Orders</h1>
            <div className="w-8" /> {/* Placeholder for centering */}
          </div>

          {/* Orders List */}
          <div className="px-5 py-5">
            <div className="space-y-4">
              {orders.map((order) => renderOrderCard(order))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
