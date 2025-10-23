'use client'

import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

const SendNotifications = () => {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'all', // 'all' or 'specific'
    userIds: '',
    type: 'general', // 'general', 'delivery', 'promotion', 'alert'
    priority: 'normal', // 'low', 'normal', 'high'
    scheduledFor: '', // Optional: for scheduled notifications
  })
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.message) {
      alert('Please fill in title and message')
      return
    }

    setSending(true)
    setResult(null)

    try {
      const response = await fetch('https://habibi-fitness-server.onrender.com/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          target: formData.target,
          userIds: formData.target === 'specific' ? formData.userIds.split(',').map(id => id.trim()).filter(id => id) : [],
          type: formData.type,
          priority: formData.priority,
          scheduledFor: formData.scheduledFor || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          data: data.data
        })
        // Reset form
        setFormData({
          title: '',
          message: '',
          target: 'all',
          userIds: '',
          type: 'general',
          priority: 'normal',
          scheduledFor: '',
        })
      } else {
        setResult({
          success: false,
          message: data.message || 'Failed to send notification'
        })
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      setResult({
        success: false,
        message: error.message || 'Failed to send notification'
      })
    } finally {
      setSending(false)
    }
  }

  const notificationTypes = [
    { value: 'general', label: 'General', icon: '📢', color: 'blue' },
    { value: 'delivery', label: 'Delivery Update', icon: '📦', color: 'green' },
    { value: 'promotion', label: 'Promotion', icon: '🎉', color: 'purple' },
    { value: 'alert', label: 'Alert', icon: '⚠️', color: 'red' },
  ]

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'normal', label: 'Normal', color: 'blue' },
    { value: 'high', label: 'High', color: 'red' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Send Notifications</h1>
        <p className={`mt-1 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>Send push notifications to your app users</p>
      </div>

      {/* Success/Error Message */}
      {result && (
        <div className={`rounded-xl p-4 border ${
          result.success
            ? theme === 'dark'
              ? 'bg-green-900/20 border-green-700'
              : 'bg-green-50 border-green-200'
            : theme === 'dark'
              ? 'bg-red-900/20 border-red-700'
              : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div className="flex-1">
              <p className={`font-medium ${
                result.success
                  ? theme === 'dark' ? 'text-green-200' : 'text-green-800'
                  : theme === 'dark' ? 'text-red-200' : 'text-red-800'
              }`}>{result.message}</p>
              {result.success && result.data && (
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-green-300' : 'text-green-600'
                }`}>
                  Sent to {result.data.sentCount} user(s)
                  {result.data.failedCount > 0 && ` • ${result.data.failedCount} failed`}
                </p>
              )}
            </div>
            <button
              onClick={() => setResult(null)}
              className={`${
                result.success
                  ? theme === 'dark' ? 'text-green-300 hover:text-green-100' : 'text-green-600 hover:text-green-800'
                  : theme === 'dark' ? 'text-red-300 hover:text-red-100' : 'text-red-600 hover:text-red-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Notification Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Form Card */}
        <div className={`rounded-xl p-6 border ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Notification Details</h2>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Your meal is ready!"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Message */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="e.g., Your healthy meal is on its way and will arrive in 15 minutes."
                required
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Send To
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, target: 'all' }))}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.target === 'all'
                      ? 'border-green-500 bg-green-500/10'
                      : theme === 'dark'
                        ? 'border-gray-700 hover:border-gray-600'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👥</div>
                    <div className={`font-medium ${
                      formData.target === 'all' ? 'text-green-600' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>All Users</div>
                    <div className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Broadcast to everyone</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, target: 'specific' }))}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.target === 'specific'
                      ? 'border-green-500 bg-green-500/10'
                      : theme === 'dark'
                        ? 'border-gray-700 hover:border-gray-600'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className={`font-medium ${
                      formData.target === 'specific' ? 'text-green-600' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Specific Users</div>
                    <div className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Target by User IDs</div>
                  </div>
                </button>
              </div>
            </div>

            {/* User IDs (if specific) */}
            {formData.target === 'specific' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  User IDs (comma-separated)
                </label>
                <input
                  type="text"
                  name="userIds"
                  value={formData.userIds}
                  onChange={handleChange}
                  placeholder="e.g., 1, 2, 3"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            )}

            {/* Notification Type */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Notification Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {notificationTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      formData.type === type.value
                        ? 'border-green-500 bg-green-500/10'
                        : theme === 'dark'
                          ? 'border-gray-700 hover:border-gray-600'
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xl mb-1">{type.icon}</div>
                      <div className={`text-xs font-medium ${
                        formData.type === type.value ? 'text-green-600' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{type.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Priority
              </label>
              <div className="grid grid-cols-3 gap-3">
                {priorityLevels.map(priority => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      formData.priority === priority.value
                        ? 'border-green-500 bg-green-500/10'
                        : theme === 'dark'
                          ? 'border-gray-700 hover:border-gray-600'
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className={`text-sm font-medium text-center ${
                      formData.priority === priority.value ? 'text-green-600' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{priority.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule (Optional) */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Schedule For (Optional)
              </label>
              <input
                type="datetime-local"
                name="scheduledFor"
                value={formData.scheduledFor}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
              <p className={`text-xs mt-1 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>Leave empty to send immediately</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={sending}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Notification
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFormData({
              title: '',
              message: '',
              target: 'all',
              userIds: '',
              type: 'general',
              priority: 'normal',
              scheduledFor: '',
            })}
            disabled={sending}
            className={`px-6 py-3 border rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === 'dark'
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Clear
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className={`rounded-xl p-4 border ${
        theme === 'dark'
          ? 'bg-blue-900/20 border-blue-800'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
            }`}>Push Notification Service</p>
            <p className={`text-xs mt-1 ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
            }`}>
              To enable actual push notifications, integrate with Firebase Cloud Messaging (FCM), OneSignal, or similar service. 
              This currently saves notifications to the database and can be retrieved by your mobile app.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SendNotifications
