import Link from "next/link";
import Image from "next/image";
import { FaDollarSign, FaRegCalendarAlt } from "react-icons/fa";

export default function Sidebar({ onClose, onLogout }) {
  return (
    <nav className="bg-white h-full flex flex-col z-50">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2" onClick={onClose}>
          <Image
            src="/images/logo-green.png"
            alt="Habibi Fitness"
            width={120}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-6 h-6"
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

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        {/* Group 1: Orders */}
        <div className="mb-8">
          <h6 className="text-green-600 text-[15px] font-semibold px-4 mt-4 mb-4">
            Orders
          </h6>
          <ul className="space-y-1">
            <li>
              <Link
                href="/orders/my-orders"
                onClick={onClose}
                className="text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center hover:bg-gray-100 rounded px-4 py-3 transition-all"
              >
                <svg
                  className="w-5 h-5 mr-3 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span>My Orders</span>
              </Link>
            </li>
            <li>
              <Link
                href="/orders/order-history"
                onClick={onClose}
                className="text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center hover:bg-gray-100 rounded px-4 py-3 transition-all"
              >
                <svg
                  className="w-5 h-5 mr-3 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Orders History</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Calender */}
        <div className="mb-8">
          <h6 className="text-green-600 text-[15px] font-semibold px-4 mb-4">
            Calender
          </h6>
          <ul className="space-y-1">
            <li>
              <Link
                href="/meal-schedule"
                onClick={onClose}
                className="text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center hover:bg-gray-100 rounded px-4 py-3 transition-all"
              >
                <FaRegCalendarAlt className="w-5 h-5 mr-3 text-green-600" />
                <span>Your Scheduled Meals</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Group 2: Profile */}
        <div className="mb-8">
          <h6 className="text-green-600 text-[15px] font-semibold px-4 mb-4">
            Profile
          </h6>
          <ul className="space-y-1">
            <li>
              <Link href="/profile/bmi" onClick={onClose} className="text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center hover:bg-gray-100 rounded px-4 py-3 transition-all">
                <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>BMI</span>
              </Link>
            </li>
            <li>
              <Link href="/profile/tdee" onClick={onClose} className="text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center hover:bg-gray-100 rounded px-4 py-3 transition-all">
                <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>TDEE</span>
              </Link>
            </li>
            <li>
              <Link href="/profile/goal" onClick={onClose} className="text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center hover:bg-gray-100 rounded px-4 py-3 transition-all">
                <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Your Goal</span>
              </Link>
            </li>
            <li>
              <Link href="/profile/meal-plan" onClick={onClose} className="text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center hover:bg-gray-100 rounded px-4 py-3 transition-all">
                <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Your Meal Plan</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Group 3: Feedback & Sharing */}
        <div className="mb-8">
          <h6 className="text-green-600 text-[15px] font-semibold px-4 mb-4">
            Feedback & Sharing
          </h6>
          <ul className="space-y-1">
            {/* <li>
              <Link
                href="/review"
                onClick={onClose}
                className="text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center hover:bg-gray-100 rounded px-4 py-3 transition-all"
              >
                <svg
                  className="w-5 h-5 mr-3 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                <span>Review</span>
              </Link>
            </li> */}
            <li>
              <Link
                href="/feedback"
                onClick={onClose}
                className="text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center hover:bg-gray-100 rounded px-4 py-3 transition-all"
              >
                <svg
                  className="w-5 h-5 mr-3 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <span>Feedback</span>
              </Link>
            </li>
            <li>
              <Link
                href="/share-transformation"
                onClick={onClose}
                className="text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center hover:bg-gray-100 rounded px-4 py-3 transition-all"
              >
                <svg
                  className="w-5 h-5 mr-3 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
                <span>Share Transformation</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Billing & Subscription */}
        <div className="mb-8">
          <h6 className="text-green-600 text-[15px] font-semibold px-4 mb-4">
            Billing & Subscription
          </h6>
          <ul className="space-y-1">
            <li>
              <Link
                href="/billing/subscription"
                onClick={onClose}
                className="text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center hover:bg-gray-100 rounded px-4 py-3 transition-all"
              >
                <FaDollarSign className="w-5 h-5 mr-3 text-green-600" />
                <span>Your Subscription Plan</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Logout Button */}
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full text-left text-slate-800 font-medium hover:text-red-600 text-[15px] flex items-center hover:bg-red-50 rounded px-4 py-3 transition-all"
          >
            <svg
              className="w-5 h-5 mr-3 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
