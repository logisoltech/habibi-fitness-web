'use client'

import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const Dashboard = () => {
  const { theme } = useTheme()
  const stats = [
    {
      title: 'Total Users',
      value: '2,543',
      change: '+12.5%',
      positive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: 'Active Meals',
      value: '156',
      change: '+8.2%',
      positive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      title: 'Meal Plans',
      value: '89',
      change: '-2.4%',
      positive: false,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      title: 'Revenue',
      value: '$45,230',
      change: '+18.7%',
      positive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  const recentActivities = [
    { user: 'John Doe', action: 'Created a new meal plan', time: '2 mins ago', type: 'create' },
    { user: 'Jane Smith', action: 'Updated user profile', time: '15 mins ago', type: 'update' },
    { user: 'Mike Johnson', action: 'Deleted a meal', time: '1 hour ago', type: 'delete' },
    { user: 'Sarah Williams', action: 'Added new notification', time: '2 hours ago', type: 'create' },
    { user: 'Tom Brown', action: 'Modified analytics settings', time: '3 hours ago', type: 'update' }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Hello, Admin! 👋</h2>
        <p className="text-green-100">Here&apos;s what&apos;s happening with your platform today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`rounded-xl p-6 border hover:border-green-600 transition-all ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-800'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-600/10 rounded-lg text-green-500">
                {stat.icon}
              </div>
              <span
                className={`text-sm font-semibold ${
                  stat.positive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className={`text-sm mb-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>{stat.title}</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className={`rounded-xl p-6 border ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 hover:bg-gray-800'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'create'
                      ? 'bg-green-600/20 text-green-500'
                      : activity.type === 'update'
                      ? 'bg-blue-600/20 text-blue-500'
                      : 'bg-red-600/20 text-red-500'
                  }`}
                >
                  {activity.type === 'create' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  ) : activity.type === 'update' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{activity.user}</p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{activity.action}</p>
                </div>
                <span className={`text-xs whitespace-nowrap ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-xl p-6 border ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-6 bg-gradient-to-br from-green-600 to-green-700 rounded-xl text-white hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105">
              <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <p className="font-semibold">Add User</p>
            </button>

            <button className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl text-white hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105">
              <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="font-semibold">New Meal</p>
            </button>

            <button className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl text-white hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105">
              <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="font-semibold">Send Alert</p>
            </button>

            <button className="p-6 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl text-white hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105">
              <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-semibold">View Reports</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

