'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import ApiService from '../../services/api'

const MealsPage = () => {
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userMealSchedule, setUserMealSchedule] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedMealToSwap, setSelectedMealToSwap] = useState(null)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [allMeals, setAllMeals] = useState([])

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayDisplayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Fetch all meals for swapping
  useEffect(() => {
    fetchAllMeals()
  }, [])

  const fetchAllMeals = async () => {
    try {
      const response = await ApiService.getMeals()
      if (response.success) {
        setAllMeals(response.data)
      }
    } catch (error) {
      console.error('Error fetching meals:', error)
    }
  }

  // Search for users
  const searchUsers = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setError(null)
    try {
      console.log('Searching for users with query:', searchQuery)
      
      // Try to search by user ID first
      if (searchQuery.match(/^\d+$/)) {
        console.log('Searching by user ID:', searchQuery)
        const response = await ApiService.getUserById(searchQuery)
        console.log('User ID search response:', response)
        
        if (response.success) {
          setSelectedUser(response.data)
          await fetchUserMealSchedule(response.data.id)
        } else {
          setError('User not found')
        }
      } else {
        // Search by name or phone
        console.log('Searching by name/phone:', searchQuery)
        const response = await ApiService.searchUsers(searchQuery)
        console.log('Name/phone search response:', response)
        
        if (response.success && response.data.length > 0) {
          setSelectedUser(response.data[0])
          await fetchUserMealSchedule(response.data[0].id)
        } else {
          setError('No users found with that name or phone number')
        }
      }
    } catch (error) {
      console.error('Error searching users:', error)
      setError(`Error searching for users: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Fetch user's meal schedule
  const fetchUserMealSchedule = async (userId) => {
    try {
      console.log('Fetching meal schedule for user ID:', userId)
      const response = await ApiService.getMealSchedule(userId)
      console.log('Meal schedule response:', response)
      
      if (response.success) {
        setUserMealSchedule(response.data)
      } else {
        setError('No meal schedule found for this user')
      }
    } catch (error) {
      console.error('Error fetching meal schedule:', error)
      setError(`Error fetching meal schedule: ${error.message}`)
    }
  }

  // Handle meal swap
  const handleSwapMeals = async (sourceMeal, targetMeal) => {
    if (!selectedUser) return

    try {
      const swapData = {
        userId: selectedUser.id,
        sourceMeal: {
          weekIndex: sourceMeal.weekIndex,
          dayKey: sourceMeal.dayKey,
          mealKey: sourceMeal.mealKey,
          mealId: sourceMeal.id
        },
        targetMeal: {
          weekIndex: targetMeal.weekIndex,
          dayKey: targetMeal.dayKey,
          mealKey: targetMeal.mealKey,
          mealId: targetMeal.id
        }
      }

      const response = await ApiService.swapMeals(swapData)
      if (response.success) {
        // Refresh the meal schedule
        await fetchUserMealSchedule(selectedUser.id)
        setShowSwapModal(false)
        setSelectedMealToSwap(null)
        alert('Meals swapped successfully!')
      } else {
        alert('Failed to swap meals: ' + response.message)
      }
    } catch (error) {
      console.error('Error swapping meals:', error)
      alert('Error swapping meals')
    }
  }

  // Get all meals from schedule for swapping
  const getAllMealsFromSchedule = () => {
    if (!userMealSchedule?.weeks) return []
    
    const meals = []
    userMealSchedule.weeks.forEach((week, weekIndex) => {
      Object.keys(week.days).forEach(dayKey => {
        const day = week.days[dayKey]
        Object.keys(day).forEach(mealKey => {
          const meal = day[mealKey]
          if (meal && meal.id) {
            meals.push({
              ...meal,
              weekIndex,
              dayKey,
              mealKey
            })
          }
        })
      })
    })
    return meals
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>User Meal Management</h1>
          <p className={`mt-1 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Search users and manage their meal schedules</p>
        </div>
      </div>

      {/* User Search */}
      <div className={`rounded-xl p-6 border ${
        theme === 'dark'
          ? 'bg-gray-900 border-gray-800'
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Search User</h2>
        
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by user ID, name, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <svg
              className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={searchUsers}
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {error && (
          <div className={`mt-4 p-3 rounded-lg ${
            theme === 'dark'
              ? 'bg-red-900 border border-red-700 text-red-300'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {selectedUser && (
          <div className={`mt-4 p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-green-900 border border-green-700'
              : 'bg-green-50 border border-green-200'
          }`}>
            <h3 className={`font-semibold ${
              theme === 'dark' ? 'text-green-300' : 'text-green-800'
            }`}>Selected User:</h3>
            <p className={theme === 'dark' ? 'text-green-200' : 'text-green-700'}>
              <strong>Name:</strong> {selectedUser.name} | 
              <strong> ID:</strong> {selectedUser.id} | 
              <strong> Phone:</strong> {selectedUser.phone} | 
              <strong> Plan:</strong> {selectedUser.plan}
            </p>
          </div>
        )}
      </div>

      {/* Meal Schedule Display */}
      {userMealSchedule && (
        <div className="space-y-6">
          <div className={`rounded-xl p-6 border ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {selectedUser?.name}&apos;s Meal Schedule
            </h2>
            
            {userMealSchedule.weeks?.map((week, weekIndex) => (
              <div key={weekIndex} className="mb-8">
                <h3 className={`text-xl font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Week {weekIndex + 1}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {dayNames.map((dayKey) => {
                    const day = week.days?.[dayKey]
                    if (!day) return null
                    
                    return (
                      <div key={dayKey} className={`rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className={`p-4 border-b ${
                          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                          <h4 className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {dayDisplayNames[dayNames.indexOf(dayKey)]}
                          </h4>
                        </div>
                        
                        <div className="p-4 space-y-3">
                          {Object.keys(day).map((mealKey) => {
                            const meal = day[mealKey]
                            if (!meal || !meal.id) return null
                            
                            return (
                              <div key={mealKey} className={`p-3 rounded-lg border ${
                                theme === 'dark'
                                  ? 'bg-gray-700 border-gray-600'
                                  : 'bg-white border-gray-200'
                              }`}>
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className={`font-medium text-sm ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {meal.name}
                                  </h5>
                                  <button
                                    onClick={() => {
                                      setSelectedMealToSwap({
                                        ...meal,
                                        weekIndex,
                                        dayKey,
                                        mealKey
                                      })
                                      setShowSwapModal(true)
                                    }}
                                    className="text-green-600 hover:text-green-700 text-xs"
                                  >
                                    Swap
                                  </button>
                                </div>
                                
                                <div className={`text-xs mb-2 ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {meal.category} • {meal.calories} cal
                                </div>
                                
                                <div className="flex gap-1 text-xs">
                                  <span className={`px-2 py-1 rounded ${
                                    theme === 'dark'
                                      ? 'bg-blue-900 text-blue-300'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    P: {meal.protein}g
                                  </span>
                                  <span className={`px-2 py-1 rounded ${
                                    theme === 'dark'
                                      ? 'bg-orange-900 text-orange-300'
                                      : 'bg-orange-100 text-orange-800'
                                  }`}>
                                    C: {meal.carbs}g
                                  </span>
                                  <span className={`px-2 py-1 rounded ${
                                    theme === 'dark'
                                      ? 'bg-red-900 text-red-300'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    F: {meal.fat}g
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Swap Modal */}
      {showSwapModal && selectedMealToSwap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <h3 className="text-xl font-bold mb-4">Swap Meal: {selectedMealToSwap.name}</h3>
            
            <div className="mb-4">
              <p className={`text-sm mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Select a meal to swap with:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {getAllMealsFromSchedule()
                  .filter(meal => meal.id !== selectedMealToSwap.id)
                  .map((meal) => (
                    <button
                      key={`${meal.weekIndex}-${meal.dayKey}-${meal.mealKey}`}
                      onClick={() => handleSwapMeals(selectedMealToSwap, meal)}
                      className={`p-3 rounded-lg border text-left hover:bg-green-50 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-50 border-gray-200 hover:bg-green-50'
                      }`}
                    >
                      <div className="font-medium text-sm">{meal.name}</div>
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Week {meal.weekIndex + 1} • {dayDisplayNames[dayNames.indexOf(meal.dayKey)]} • {meal.category}
                      </div>
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {meal.calories} cal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                      </div>
                    </button>
                  ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSwapModal(false)
                  setSelectedMealToSwap(null)
                }}
                className={`px-4 py-2 border rounded-lg ${
                  theme === 'dark'
                    ? 'border-gray-600 hover:bg-gray-700 text-white'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-900'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}

export default MealsPage


