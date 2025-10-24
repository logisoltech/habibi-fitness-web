'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { fetchDeliveriesByDate, updateMealStatus, fetchUserDeliveryStatus } from '../utils/deliveryApi'

const UpdateDeliveryStatus = () => {
  const { theme } = useTheme()
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' }))
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch deliveries only when searchQuery changes and is not empty
  useEffect(() => {
    if (searchQuery.trim()) {
      fetchDeliveries()
    } else {
      setDeliveries([])
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, searchQuery, statusFilter])

  const fetchDeliveries = async () => {
    // Only fetch if there's a search query
    if (!searchQuery.trim()) {
      setDeliveries([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const userId = searchQuery.trim()
      console.log('🔍 CMS: Fetching meals for user:', userId, 'on date:', selectedDate)
      console.log('🔍 CMS: Today\'s date:', new Date().toISOString().split('T')[0])
      console.log('🔍 CMS: Selected date vs today:', selectedDate, 'vs', new Date().toISOString().split('T')[0])
      
      // First, get the user's meal schedule (same as dashboard)
      const scheduleResponse = await fetch(`https://habibi-fitness-server.onrender.com/api/schedule/${userId}`)
      const scheduleData = await scheduleResponse.json()
      
      console.log('🔍 CMS: Schedule response:', scheduleData)
      
      if (!scheduleData.success || !scheduleData.data) {
        setError(`No meal schedule found for User ID: ${userId}`)
        setDeliveries([])
        return
      }
      
      // Get today's meals from schedule
      const todayMeals = getTodaysMealsFromSchedule(scheduleData.data, selectedDate)
      console.log('🔍 CMS: Today\'s meals from schedule:', todayMeals)
      
      if (todayMeals.length === 0) {
        setError(`No meals scheduled for ${selectedDate}`)
        setDeliveries([])
        return
      }
      
      // Now get delivery status to overlay using deliveryApi
      try {
        console.log('🔍 CMS: Fetching delivery status for user:', userId, 'date:', selectedDate);
        const deliveryData = await fetchUserDeliveryStatus(userId, { date: selectedDate })
        
        console.log('🔍 CMS: Delivery status response:', deliveryData)
        
        // If no meals found, try different date formats
        if (!deliveryData.data?.meals || deliveryData.data.meals.length === 0) {
          console.log('🔍 CMS: No meals found, trying different date formats...');
          
          const alternativeDates = [
            new Date().toISOString().split('T')[0], // Today in UTC
            new Date().toLocaleDateString('en-CA'), // Today in local timezone
            new Date(selectedDate).toISOString().split('T')[0] // Selected date in UTC
          ];
          
          for (const altDate of alternativeDates) {
            try {
              console.log(`🔍 CMS: Trying alternative date: ${altDate}`);
              const altData = await fetchUserDeliveryStatus(userId, { date: altDate });
              if (altData.data?.meals && altData.data.meals.length > 0) {
                console.log(`✅ CMS: Found ${altData.data.meals.length} meals with date: ${altDate}`);
                deliveryData.data = altData.data;
                break;
              }
            } catch (altError) {
              console.log(`❌ CMS: Alternative date ${altDate} failed:`, altError.message);
            }
          }
        }
        
        // Overlay delivery status on meals
        const mealsWithStatus = overlayDeliveryStatusOnMeals(todayMeals, deliveryData.data?.meals || [])
        console.log('🔍 CMS: Meals with status overlay:', mealsWithStatus)
        console.log('🔍 CMS: Delivery status data:', deliveryData.data?.meals || [])
        console.log('🔍 CMS: Today\'s meals from schedule:', todayMeals)
        
        // Filter by status if needed
        let filteredMeals = mealsWithStatus
        if (statusFilter !== 'all') {
          filteredMeals = mealsWithStatus.filter(meal => meal.status === statusFilter)
        }
        
        setDeliveries(filteredMeals)
        
      } catch (deliveryError) {
        console.log('⚠️ CMS: No delivery status found, using default status')
        setDeliveries(todayMeals.map(meal => ({ ...meal, status: 'pending' })))
      }
      
    } catch (err) {
      console.error('Error fetching deliveries:', err)
      setError(err.message || 'Failed to fetch deliveries')
      setDeliveries([])
    } finally {
      setLoading(false)
    }
  }

  // Get today's meals from schedule data (same logic as dashboard)
  const getTodaysMealsFromSchedule = (scheduleData, targetDate) => {
    if (!scheduleData || !scheduleData.weeks || scheduleData.weeks.length === 0) {
      return []
    }

    const currentWeek = scheduleData.weeks[0]
    if (!currentWeek || !currentWeek.days) {
      return []
    }

    // Get target date's day name
    const date = new Date(targetDate)
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[date.getDay()]
    
    console.log('🔍 CMS: Looking for day:', dayName, 'in schedule')
    
    const dayData = currentWeek.days[dayName]
    if (!dayData) {
      console.log('❌ CMS: No meals scheduled for', dayName)
      return []
    }

    // Convert to array format
    const meals = []
    Object.keys(dayData).forEach(mealType => {
      const meal = dayData[mealType]
      if (meal && meal.name) {
        meals.push({
          ...meal,
          meal_type: mealType,
          delivery_date: targetDate,
          status: 'pending' // Default status
        })
        console.log(`✅ CMS: Added meal: ${meal.name} (${mealType})`)
      }
    })

    return meals
  }

  // Overlay delivery status on meal data
  const overlayDeliveryStatusOnMeals = (scheduleMeals, deliveryMeals) => {
    console.log('🔍 Overlay Debug - Schedule meals:', scheduleMeals.map(m => ({ id: m.id, name: m.name })));
    console.log('🔍 Overlay Debug - Delivery meals:', deliveryMeals.map(m => ({ id: m.id, name: m.name })));
    
    return scheduleMeals.map(scheduleMeal => {
      const deliveryMeal = deliveryMeals.find(deliveryMeal => 
        deliveryMeal.id === scheduleMeal.id || 
        deliveryMeal.meal_id === scheduleMeal.id || 
        deliveryMeal.meal_name === scheduleMeal.name ||
        deliveryMeal.name === scheduleMeal.name
      )
      
      console.log(`🔍 Matching meal ${scheduleMeal.id} (${scheduleMeal.name}):`, deliveryMeal ? 'FOUND' : 'NOT FOUND');
      
      if (deliveryMeal) {
        return {
          ...scheduleMeal,
          status: deliveryMeal.status || 'pending',
          status_updated_at: deliveryMeal.status_updated_at,
          delivered_at: deliveryMeal.delivered_at,
          delivery_notes: deliveryMeal.delivery_notes || deliveryMeal.notes
        }
      } else {
        return {
          ...scheduleMeal,
          status: 'pending'
        }
      }
    })
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800 border-gray-300' },
    { value: 'preparing', label: 'Preparing', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-300' }
  ]

  const getStatusColor = (status) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getStatusLabel = (status) => {
    return statusOptions.find(s => s.value === status)?.label || status
  }

  const getMealTypeIcon = (type) => {
    switch(type) {
      case 'breakfast':
        return '🌅'
      case 'lunch':
        return '🍽️'
      case 'dinner':
        return '🌙'
      case 'snack':
        return '🍎'
      default:
        return '🍴'
    }
  }

  // Filter meals (already filtered by userId in API call)
  const filteredMeals = deliveries.filter(meal => {
    const matchesStatus = statusFilter === 'all' || meal.status === statusFilter
    return matchesStatus
  })

  // Calculate stats from real data
  const stats = [
    {
      label: 'Total Meals',
      value: deliveries.length,
      icon: '📦',
      color: 'blue'
    },
    {
      label: 'Pending',
      value: deliveries.filter(m => m.status === 'pending').length,
      icon: '⏳',
      color: 'gray'
    },
    {
      label: 'In Progress',
      value: deliveries.filter(m => m.status === 'preparing' || m.status === 'out_for_delivery').length,
      icon: '🚀',
      color: 'orange'
    },
    {
      label: 'Delivered',
      value: deliveries.filter(m => m.status === 'delivered').length,
      icon: '✅',
      color: 'green'
    }
  ]

  const handleStatusUpdate = (meal, newStatus) => {
    setSelectedMeal({ 
      ...meal, 
      userId: searchQuery || meal.userId, 
      newStatus,
      mealId: meal.id,
      mealType: meal.meal_type || meal.category || 'meal'
    })
    setShowModal(true)
  }

  const confirmStatusUpdate = async () => {
    if (!selectedMeal) return

    try {
      setUpdating(true)
      
      console.log('🔍 Updating meal status:', {
        userId: selectedMeal.userId,
        mealId: selectedMeal.id,
        newStatus: selectedMeal.newStatus,
        date: selectedDate,
        mealType: selectedMeal.mealType,
        todayDate: new Date().toISOString().split('T')[0]
      })
      
      // Use Pakistan timezone for date calculation
      const pakistanDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' })
      const actualDate = selectedDate || pakistanDate
      console.log('🔍 Using date for update:', actualDate)
      console.log('🔍 Pakistan date:', pakistanDate)
      console.log('🔍 UTC date:', new Date().toISOString().split('T')[0])
      
      // Validate required fields
      if (!selectedMeal.userId) {
        throw new Error('User ID is required')
      }
      if (!selectedMeal.id) {
        throw new Error('Meal ID is required')
      }
      if (!selectedMeal.newStatus) {
        throw new Error('New status is required')
      }
      
      // Call the API to update the status
      try {
        await updateMealStatus(
          selectedMeal.userId,
          selectedMeal.id,
          selectedMeal.newStatus,
          actualDate,
          selectedMeal.mealType || selectedMeal.type || '',
          selectedMeal.delivery_notes || '', // notes
          selectedMeal.mealKey || '', // e.g., "lunch_1"
          selectedMeal.weekIndex || 0,
          selectedMeal.dayKey || ''
        )
      } catch (apiError) {
        console.error('❌ API update failed, using local fallback:', apiError);
        
        // Fallback: Update local state only
        console.log('🔄 Using local fallback for status update...');
        setDeliveries(prevDeliveries => 
          prevDeliveries.map(meal => 
            meal.id === selectedMeal.id 
              ? { 
                  ...meal, 
                  status: selectedMeal.newStatus, 
                  status_updated_at: new Date().toISOString(),
                  delivery_notes: selectedMeal.delivery_notes || meal.delivery_notes
                }
              : meal
          )
        );
        
        // Show success message for local update
        alert(`Status updated locally to "${selectedMeal.newStatus}". Note: This change is not saved to the server.`);
        return; // Exit early since we handled it locally
      }

      // Show success message
      console.log('✅ Status updated successfully!')
      setSuccessMessage(`Successfully updated ${selectedMeal.name} to ${getStatusLabel(selectedMeal.newStatus)}`)
      setTimeout(() => setSuccessMessage(''), 5000) // Clear after 5 seconds
      
      // Test delivery status API immediately after update
      console.log('🧪 Testing delivery status after update...')
      try {
        const testData = await fetchUserDeliveryStatus(selectedMeal.userId, { date: actualDate });
        console.log('🧪 Delivery status after update:', testData);
        
        // Also test with different date formats
        console.log('🧪 Testing with different date formats...');
        const dateFormats = [
          actualDate,
          new Date().toISOString().split('T')[0],
          new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' })
        ];
        
        for (const dateFormat of dateFormats) {
          try {
            const formatData = await fetchUserDeliveryStatus(selectedMeal.userId, { date: dateFormat });
            console.log(`🧪 Date format ${dateFormat}:`, formatData);
          } catch (error) {
            console.error(`🧪 Error with date ${dateFormat}:`, error);
          }
        }
      } catch (error) {
        console.error('🧪 Error testing delivery status:', error);
      }
      
      // Update local state immediately to show the change
      console.log('🔄 Updating local state immediately...')
      setDeliveries(prevDeliveries => 
        prevDeliveries.map(meal => 
          meal.id === selectedMeal.id 
            ? { ...meal, status: selectedMeal.newStatus, status_updated_at: new Date().toISOString() }
            : meal
        )
      )
      
      // Refresh the deliveries list to show updated status
      console.log('🔄 Refreshing deliveries list...')
      await fetchDeliveries()
      
      // Force a complete refresh by clearing and refetching
      console.log('🔄 Force refreshing data...')
      setDeliveries([])
      await new Promise(resolve => setTimeout(resolve, 100)) // Small delay
      await fetchDeliveries()
      
      // Close modal
      setShowModal(false)
      setSelectedMeal(null)
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update status: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`rounded-xl p-4 border shadow-lg ${
            theme === 'dark'
              ? 'bg-green-900/90 border-green-700'
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={`font-medium ${
                theme === 'dark' ? 'text-green-200' : 'text-green-800'
              }`}>{successMessage}</p>
              <button
                onClick={() => setSuccessMessage('')}
                className={`ml-2 ${
                  theme === 'dark' ? 'text-green-300 hover:text-green-100' : 'text-green-600 hover:text-green-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Meal Delivery Status</h1>
          <p className={`mt-1 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Track and update meal delivery statuses in real-time</p>
        </div>
        {searchQuery && (
          <div className="flex gap-2">
            <button
              onClick={fetchDeliveries}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={async () => {
                console.log('🔄 Force refreshing all data...');
                setDeliveries([]);
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 500));
                await fetchDeliveries();
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Force Refresh
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards - Only show when there's data */}
      {searchQuery && deliveries.length > 0 && (
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
      )}

      {/* Filters */}
      <div className={`rounded-xl p-4 border ${
        theme === 'dark'
          ? 'bg-gray-900 border-gray-800'
          : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Picker */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Delivery Date
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
              
             
              
            </div>
          </div>

          {/* Search */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Search User ID
            </label>
            <input
              type="text"
              placeholder="Enter User ID to load meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {/* Error State */}
        {error && (
          <div className={`rounded-xl p-6 border ${
            theme === 'dark'
              ? 'bg-red-900/20 border-red-800'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className={`font-medium ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-800'
                }`}>Error loading deliveries</p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-red-300' : 'text-red-600'
                }`}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className={`rounded-xl p-12 border text-center ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex flex-col items-center gap-4">
              <svg className="w-12 h-12 animate-spin text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className={`text-lg ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Loading deliveries...
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredMeals.length === 0 && !searchQuery && (
          <div className={`rounded-xl p-12 border text-center ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200'
          }`}>
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className={`text-lg font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Search for a User
            </p>
            <p className={`text-sm mt-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Enter a User ID in the search box to view their scheduled meals
            </p>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && filteredMeals.length === 0 && searchQuery && deliveries.length === 0 && (
          <div className={`rounded-xl p-12 border text-center ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200'
          }`}>
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              No meals found for User ID: {searchQuery}
            </p>
            <p className={`text-sm mt-2 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              This user has no scheduled meals for {selectedDate}
            </p>
          </div>
        )}

        {/* Meals */}
        {!loading && !error && filteredMeals.length > 0 && (
          <div className={`rounded-xl p-6 border ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200'
          }`}>
            {/* User Info Header */}
            <div className="flex items-start justify-between mb-4 pb-4 border-b ${
              theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
            }">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {searchQuery.charAt(0)}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>User {searchQuery}</h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>User ID: {searchQuery}</p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>📅 {selectedDate}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {filteredMeals.length} meals
              </span>
            </div>

            {/* Meals List */}
            <div className="space-y-3">
              {filteredMeals && filteredMeals.length > 0 ? filteredMeals.map((meal, mealIndex) => (
                  <div
                    key={`${meal.id}-${mealIndex}`}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-3xl">{getMealTypeIcon(meal.meal_type || meal.category)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-bold ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>{meal.name}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {(meal.meal_type || meal.category || 'meal').toUpperCase()}
                            </span>
                          </div>
                          <div className={`text-sm mt-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            🔥 {meal.calories || 0} cal • 
                            🥩 {meal.protein || 0}g protein • 
                            🍞 {meal.carbs || 0}g carbs • 
                            🧈 {meal.fat || 0}g fat
                            {meal.status_updated_at && ` • Updated: ${new Date(meal.status_updated_at).toLocaleTimeString()}`}
                          </div>
                          {meal.delivery_notes && (
                            <div className={`text-sm mt-1 ${
                              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              📝 Note: {meal.delivery_notes}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Status Selector */}
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(meal.status)}`}>
                          {getStatusLabel(meal.status)}
                        </span>
                        <select
                          value={meal.status}
                          onChange={(e) => handleStatusUpdate(meal, e.target.value)}
                          className={`px-3 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          {statusOptions.map(status => (
                            <option key={status.value} value={status.value}>
                              Update to {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )) : (
                <div className={`p-4 rounded-lg border text-center ${
                  theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No meals scheduled for this user
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-md w-full p-6 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Confirm Status Update</h3>
            
            <div className={`p-4 rounded-lg mb-4 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <p className={`text-sm mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <strong>User ID:</strong> {selectedMeal.userId}
              </p>
              <p className={`text-sm mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <strong>Meal:</strong> {selectedMeal.name}
              </p>
              <p className={`text-sm mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <strong>Meal Type:</strong> {(selectedMeal.meal_type || selectedMeal.category || 'meal').toUpperCase()}
              </p>
              <p className={`text-sm mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <strong>Current Status:</strong>{' '}
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedMeal.status)}`}>
                  {getStatusLabel(selectedMeal.status)}
                </span>
              </p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <strong>New Status:</strong>{' '}
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedMeal.newStatus)}`}>
                  {getStatusLabel(selectedMeal.newStatus)}
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={updating}
                className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Confirm Update'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpdateDeliveryStatus
