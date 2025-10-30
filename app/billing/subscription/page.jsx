"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { font } from "../../components/font/font";
import { useUserData } from "../../contexts/UserDataContext";
import Link from "next/link";

export default function SubscriptionPage() {
  const { userData } = useUserData();

  const plan = userData?.plan || "—";
  const subscription = userData?.subscription || "—"; // weekly | monthly | quarterly
  const selectedDays = Array.isArray(userData?.selecteddays)
    ? userData.selecteddays.join(", ")
    : "—";
  const mealTypes = Array.isArray(userData?.mealtypes)
    ? userData.mealtypes.join(", ")
    : "—";

  return (
    <>
      <Header />
      <div className={`${font.className} max-w-4xl mx-auto px-6 py-10 mt-[100px]`}>
        <h1 className="text-3xl font-bold mt-12 text-gray-900 mb-2">Your Subscription Plan</h1>
        <p className="text-gray-600 mb-8">View your current plan and manage billing</p>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-500">Diet Plan</p>
            <p className="text-xl font-semibold text-gray-900">{plan}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-500">Subscription</p>
            <p className="text-xl font-semibold text-gray-900 capitalize">{subscription}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs text-gray-500">Meals Included</p>
            <p className="text-sm font-medium text-gray-900">{mealTypes}</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Plan Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500">Selected Days</p>
              <p className="text-base font-semibold text-gray-900">{selectedDays}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500">Billing Cycle</p>
              <p className="text-base font-semibold text-gray-900 capitalize">{subscription}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Note: Changes to your plan will apply to future schedules and upcoming billing cycles.
          </p>
        </div>

        {/* Actions */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Manage Subscription</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/billing/change-subscription"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
            >
              Change Plan
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-800 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Explore Meals
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}


