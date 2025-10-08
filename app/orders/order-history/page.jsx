"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { font } from "../../components/font/font";
import Header from "../../components/Header";

export default function OrderHistory() {
  const router = useRouter();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Static order data
  const orders = [
    {
      id: 1,
      orderNumber: "ORD-2024-001",
      date: "Oct 5, 2024",
      meals: [
        { name: "Grilled Chicken Caesar Salad", quantity: 2 },
        { name: "Protein Smoothie Bowl", quantity: 1 },
      ],
      totalPrice: 45.99,
      status: "delivered",
      tracking: {
        leftKitchen: { time: "11:45 AM", date: "Oct 5, 2024", completed: true },
        outForDelivery: {
          time: "12:15 PM",
          date: "Oct 5, 2024",
          completed: true,
        },
        delivered: { time: "12:45 PM", date: "Oct 5, 2024", completed: true },
      },
    },
    {
      id: 2,
      orderNumber: "ORD-2024-002",
      date: "Oct 6, 2024",
      meals: [
        { name: "Keto Salmon with Vegetables", quantity: 1 },
        { name: "Greek Yogurt Parfait", quantity: 2 },
      ],
      totalPrice: 38.5,
      status: "in_process",
      tracking: {
        leftKitchen: { time: "10:30 AM", date: "Oct 6, 2024", completed: true },
        outForDelivery: { time: "Pending", date: "", completed: false },
        delivered: { time: "Pending", date: "", completed: false },
      },
    },
    {
      id: 3,
      orderNumber: "ORD-2024-003",
      date: "Oct 6, 2024",
      meals: [
        { name: "Quinoa Buddha Bowl", quantity: 3 },
        { name: "Green Detox Juice", quantity: 1 },
      ],
      totalPrice: 52.75,
      status: "pending",
      tracking: {
        leftKitchen: { time: "Pending", date: "", completed: false },
        outForDelivery: { time: "Pending", date: "", completed: false },
        delivered: { time: "Pending", date: "", completed: false },
      },
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered":
        return { backgroundColor: "#e8f5e9", color: "#2e7d32" };
      case "in_process":
        return { backgroundColor: "#fff3e0", color: "#f57c00" };
      case "pending":
        return { backgroundColor: "#e3f2fd", color: "#1976d2" };
      case "cancelled":
        return { backgroundColor: "#ffebee", color: "#c62828" };
      default:
        return { backgroundColor: "#f5f5f5", color: "#757575" };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "in_process":
        return "In Process";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      delivered: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      in_process: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      pending: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      cancelled: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };
    return iconMap[status] || iconMap["pending"];
  };

  return (
    <>
      <Header />
      <div
        className={`${font.className} max-w-6xl mx-auto p-6 bg-white min-h-screen mt-[100px]`}
      >
        <div>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
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
            <h1 className="text-lg font-bold text-gray-900">Order History</h1>
            <div className="w-10" /> {/* Placeholder for centering */}
          </div>

          {/* Orders List */}
          <div className="px-4 py-4">
            <div className="space-y-4">
              {orders.map((order) => {
                const statusStyle = getStatusStyle(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                  >
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                          {order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                      <div
                        className="flex items-center px-3 py-1.5 rounded-2xl"
                        style={{ backgroundColor: statusStyle.backgroundColor }}
                      >
                        <div style={{ color: statusStyle.color }}>
                          {getStatusIcon(order.status)}
                        </div>
                        <span
                          className="text-xs font-semibold ml-1"
                          style={{ color: statusStyle.color }}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100 mb-3" />

                    {/* Meals List */}
                    <div className="mb-3">
                      {order.meals.map((meal, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                          </div>
                          <span className="flex-1 text-sm text-gray-900">
                            {meal.name}
                          </span>
                          <span className="text-sm font-semibold text-gray-500">
                            x{meal.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        className="flex-1 py-3 px-4 rounded-xl border-2 border-green-500 text-center hover:bg-green-50 transition-colors"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailsModal(true);
                        }}
                      >
                        <span className="text-sm font-semibold text-green-600">
                          View Details
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Empty space at bottom */}
              <div className="h-5" />
            </div>
          </div>

          {/* Order Details Modal */}
          {showDetailsModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg max-h-[75vh] shadow-2xl overflow-hidden">
                {selectedOrder && (
                  <>
                    {/* Modal Header */}
                    <div className="flex justify-between items-start p-5 border-b border-gray-100">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                          Order Details
                        </h2>
                        <p className="text-sm text-gray-600">
                          {selectedOrder.orderNumber}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDetailsModal(false)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-6 h-6 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-5 space-y-6">
                        {/* Order Items Section */}
                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-4">
                            Items Ordered
                          </h3>
                          {selectedOrder.meals.map((meal, index) => (
                            <div
                              key={index}
                              className="flex items-center mb-2.5"
                            >
                              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                                <svg
                                  className="w-4.5 h-4.5 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                </svg>
                              </div>
                              <span className="flex-1 text-sm text-gray-900">
                                {meal.name}
                              </span>
                              <span className="text-sm font-semibold text-gray-600">
                                x{meal.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Tracking Timeline */}
                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-4">
                            Order Tracking
                          </h3>

                          {/* Left Kitchen */}
                          <div className="flex mb-4">
                            <div className="flex flex-col items-center mr-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                  selectedOrder.tracking?.leftKitchen?.completed
                                    ? "bg-green-600 border-green-600"
                                    : "bg-gray-100 border-gray-300"
                                }`}
                              >
                                {selectedOrder.tracking?.leftKitchen
                                  ?.completed ? (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                                )}
                              </div>
                              {selectedOrder.tracking?.outForDelivery
                                ?.completed && (
                                <div className="w-0.5 h-6 bg-green-600 mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pt-1">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                Left Kitchen
                              </h4>
                              <p className="text-sm text-gray-600">
                                {selectedOrder.tracking?.leftKitchen?.time ||
                                  "Pending"}
                                {selectedOrder.tracking?.leftKitchen?.date
                                  ? ` - ${selectedOrder.tracking.leftKitchen.date}`
                                  : ""}
                              </p>
                            </div>
                          </div>

                          {/* Out for Delivery */}
                          <div className="flex mb-4">
                            <div className="flex flex-col items-center mr-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                  selectedOrder.tracking?.outForDelivery
                                    ?.completed
                                    ? "bg-green-600 border-green-600"
                                    : "bg-gray-100 border-gray-300"
                                }`}
                              >
                                {selectedOrder.tracking?.outForDelivery
                                  ?.completed ? (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                                )}
                              </div>
                              {selectedOrder.tracking?.delivered?.completed && (
                                <div className="w-0.5 h-6 bg-green-600 mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pt-1">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                Out for Delivery
                              </h4>
                              <p className="text-sm text-gray-600">
                                {selectedOrder.tracking?.outForDelivery?.time ||
                                  "Pending"}
                                {selectedOrder.tracking?.outForDelivery?.date
                                  ? ` - ${selectedOrder.tracking.outForDelivery.date}`
                                  : ""}
                              </p>
                            </div>
                          </div>

                          {/* Delivered */}
                          <div className="flex">
                            <div className="flex flex-col items-center mr-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                  selectedOrder.tracking?.delivered?.completed
                                    ? "bg-green-600 border-green-600"
                                    : "bg-gray-100 border-gray-300"
                                }`}
                              >
                                {selectedOrder.tracking?.delivered
                                  ?.completed ? (
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 pt-1">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                Delivered
                              </h4>
                              <p className="text-sm text-gray-600">
                                {selectedOrder.tracking?.delivered?.time ||
                                  "Pending"}
                                {selectedOrder.tracking?.delivered?.date
                                  ? ` - ${selectedOrder.tracking.delivered.date}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
