'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * User Notifications Page
 * Displays all notifications for the logged-in user
 * 
 * Add this page to your app for users to view all their notifications
 */
const NotificationsPage = () => {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'
  
  // Get user ID from your auth context
  // Replace this with your actual user context
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  useEffect(() => {
    if (!userId) {
      // Redirect to login if not authenticated
      router.push('/auth/login')
      return
    }
    
    fetchNotifications()
  }, [userId, filter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const url = filter === 'unread' 
        ? `https://habibi-fitness-server.onrender.com/api/notifications/user/${userId}?unreadOnly=true`
        : `https://habibi-fitness-server.onrender.com/api/notifications/user/${userId}`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        const filteredData = filter === 'read' 
          ? (data.data || []).filter(n => n.read)
          : data.data || []
        setNotifications(filteredData)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`https://habibi-fitness-server.onrender.com/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      })
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read)
    
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id)
    }
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

  const getTypeColor = (type) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      delivery: 'bg-green-100 text-green-800',
      promotion: 'bg-purple-100 text-purple-800',
      alert: 'bg-red-100 text-red-800',
    }
    return colors[type] || colors.general
  }

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'unread', 'read'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === tab
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <svg className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications</h3>
            <p className="text-sm text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`bg-white rounded-xl p-5 shadow-sm border transition-all cursor-pointer ${
                  !notification.read
                    ? 'border-green-200 hover:border-green-300 bg-green-50/30'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      
                      {notification.priority === 'high' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                          High Priority
                        </span>
                      )}
                      
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(notification.created_at)}
                      </span>
                      
                      {notification.read && notification.read_at && (
                        <span className="text-xs text-green-600">
                          ✓ Read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage

