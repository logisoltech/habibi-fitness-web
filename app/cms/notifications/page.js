'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'

const NotificationsHistory = () => {
  const { theme } = useTheme()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    type: 'all',
    priority: 'all',
    search: ''
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://habibi-fitness-server.onrender.com/api/notifications/all?limit=100')
      const data = await response.json()

      if (data.success) {
        setNotifications(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    const matchesType = filter.type === 'all' || notif.type === filter.type
    const matchesPriority = filter.priority === 'all' || notif.priority === filter.priority
    const matchesSearch = !filter.search || 
      notif.title.toLowerCase().includes(filter.search.toLowerCase()) ||
      notif.message.toLowerCase().includes(filter.search.toLowerCase())
    return matchesType && matchesPriority && matchesSearch
  })

  const getTypeColor = (type) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800 border-blue-300',
      delivery: 'bg-green-100 text-green-800 border-green-300',
      promotion: 'bg-purple-100 text-purple-800 border-purple-300',
      alert: 'bg-red-100 text-red-800 border-red-300',
    }
    return colors[type] || colors.general
  }

  const getTypeIcon = (type) => {
    const icons = {
      general: '📢',
      delivery: '📦',
      promotion: '🎉',
      alert: '⚠️',
    }
    return icons[type] || '📢'
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
      normal: { label: 'Normal', color: 'bg-blue-100 text-blue-600' },
      high: { label: 'High', color: 'bg-red-100 text-red-600' },
    }
    return badges[priority] || badges.normal
  }

  const stats = [
    {
      label: 'Total Sent',
      value: notifications.length,
      icon: '📨',
      color: 'blue'
    },
    {
      label: 'Read',
      value: notifications.filter(n => n.read).length,
      icon: '✅',
      color: 'green'
    },
    {
      label: 'Unread',
      value: notifications.filter(n => !n.read).length,
      icon: '📬',
      color: 'orange'
    },
    {
      label: 'High Priority',
      value: notifications.filter(n => n.priority === 'high').length,
      icon: '⚠️',
      color: 'red'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Notification History</h1>
          <p className={`mt-1 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>View all sent notifications and their delivery status</p>
        </div>
        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`rounded-xl p-4 border ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-800'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{stat.value}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`rounded-xl p-4 border ${
        theme === 'dark'
          ? 'bg-gray-900 border-gray-800'
          : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search notifications..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Type
            </label>
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="delivery">Delivery</option>
              <option value="promotion">Promotion</option>
              <option value="alert">Alert</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Priority
            </label>
            <select
              value={filter.priority}
              onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className={`rounded-xl p-12 border text-center ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200'
          }`}>
            <svg className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className={`rounded-xl p-12 border text-center ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200'
          }`}>
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl p-6 border ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-4xl flex-shrink-0">
                  {getTypeIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className={`text-lg font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{notification.title}</h3>
                      <p className={`text-sm mt-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{notification.message}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(notification.priority).color}`}>
                        {getPriorityBadge(notification.priority).label}
                      </span>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className={`text-xs ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      <span className="font-medium">Sent:</span>{' '}
                      {notification.sent_at 
                        ? new Date(notification.sent_at).toLocaleString()
                        : 'Scheduled'
                      }
                    </div>
                    {notification.users && (
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        <span className="font-medium">To:</span>{' '}
                        {notification.users.name} ({notification.users.phone})
                      </div>
                    )}
                    {notification.read && notification.read_at && (
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-green-500' : 'text-green-600'
                      }`}>
                        <span className="font-medium">✓ Read:</span>{' '}
                        {new Date(notification.read_at).toLocaleString()}
                      </div>
                    )}
                    {!notification.read && (
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-orange-500' : 'text-orange-600'
                      }`}>
                        <span className="font-medium">● Unread</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Info */}
      {filteredNotifications.length > 0 && (
        <div className={`text-center text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </div>
      )}
    </div>
  )
}

export default NotificationsHistory

