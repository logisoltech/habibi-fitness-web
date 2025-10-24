// API utility functions for meal delivery status management
// These functions interact with the server.js endpoints

// Base API URL - update this for production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://habibi-fitness-server.onrender.com/api'

/**
 * Update the status of a specific meal for a user
 * @param {string} userId - User ID
 * @param {string} mealId - Meal ID
 * @param {string} status - New status (pending, preparing, out_for_delivery, delivered, cancelled)
 * @param {string} date - Delivery date (YYYY-MM-DD)
 * @param {string} mealType - Meal type (breakfast, lunch, dinner, snacks)
 * @param {string} notes - Optional delivery notes
 * @param {string} mealKey - Meal key in the schedule (e.g., "lunch_1")
 * @param {number} weekIndex - Week index in the schedule
 * @param {string} dayKey - Day key in the schedule (e.g., "friday")
 * @returns {Promise<object>} Response data
 */
export const updateMealStatus = async (userId, mealId, status, date, mealType = '', notes = '', mealKey = '', weekIndex = null, dayKey = '') => {
  try {
    const payload = {
      userId,
      mealId,
      status,
      date,
      mealType,
      notes,
      mealKey,
      weekIndex,
      dayKey,
      timestamp: new Date().toISOString()
    }
    
    console.log('🔍 Sending status update payload:', payload)
    
    const response = await fetch(`${API_BASE_URL}/delivery-status/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    
    console.log('🔍 Status update response:', {
      status: response.status,
      ok: response.ok,
      data: data
    })

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update meal status')
    }

    console.log('✅ Meal status updated successfully:', data)
    return data
  } catch (error) {
    console.error('❌ Error updating meal status:', error)
    throw error
  }
}

/**
 * Fetch all delivery statuses with optional filters
 * @param {object} filters - Optional filters { date, status, userId, search }
 * @returns {Promise<object>} Delivery statuses data with stats
 */
export const fetchDeliveryStatuses = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    
    // Add filters to params
    if (filters.userId) params.append('userId', filters.userId)
    if (filters.date) params.append('date', filters.date)
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)

    const url = `${API_BASE_URL}/delivery-status${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch delivery statuses')
    }

    console.log('✅ Fetched delivery statuses:', data)
    return data
  } catch (error) {
    console.error('❌ Error fetching delivery statuses:', error)
    throw error
  }
}

/**
 * Fetch deliveries for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {object} filters - Optional filters { status, userId }
 * @returns {Promise<object>} Deliveries for the date
 */
export const fetchDeliveriesByDate = async (date, filters = {}) => {
  try {
    const params = new URLSearchParams()
    
    if (filters.status) params.append('status', filters.status)
    if (filters.userId) params.append('userId', filters.userId)

    const url = `${API_BASE_URL}/delivery-status/date/${date}${params.toString() ? `?${params.toString()}` : ''}`
    console.log('🔍 Fetching from:', url)
    
    const response = await fetch(url)
    console.log('📡 Response status:', response.status, response.statusText)
    
    const data = await response.json()
    console.log('📦 Response data:', data)

    if (!response.ok) {
      console.error('❌ API Error Response:', data)
      throw new Error(data.message || data.error || `Failed to fetch deliveries (${response.status})`)
    }

    console.log(`✅ Fetched deliveries for ${date}:`, data)
    return data
  } catch (error) {
    console.error(`❌ Error fetching deliveries for ${date}:`, error)
    console.error('Error details:', error.message)
    throw error
  }
}

/**
 * Fetch delivery status for a specific user
 * @param {string} userId - User ID
 * @param {object} filters - Optional filters { date, status }
 * @returns {Promise<object>} User's delivery data
 */
export const fetchUserDeliveryStatus = async (userId, filters = {}) => {
  try {
    const params = new URLSearchParams()
    
    if (filters.date) params.append('date', filters.date)
    if (filters.status) params.append('status', filters.status)

    const url = `${API_BASE_URL}/delivery-status/user/${userId}${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch user delivery status')
    }

    console.log(`✅ Fetched user ${userId} delivery status:`, data)
    return data
  } catch (error) {
    console.error(`❌ Error fetching user ${userId} delivery status:`, error)
    throw error
  }
}

/**
 * Batch update multiple meal statuses
 * @param {Array} updates - Array of { userId, mealId, status, notes }
 * @returns {Promise<object>} Batch update results
 */
export const batchUpdateMealStatuses = async (updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-status/batch-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to batch update statuses')
    }

    console.log('✅ Batch update completed:', data)
    return data
  } catch (error) {
    console.error('❌ Error in batch update:', error)
    throw error
  }
}

/**
 * Fetch delivery statistics
ts  * @param {object} filters - Optional filters { startDate, endDate }
 * @returns {Promise<object>} Statistics data
 */
export const fetchDeliveryStatistics = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)

    const url = `${API_BASE_URL}/delivery-status/stats${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch delivery statistics')
    }

    console.log('✅ Fetched delivery statistics:', data)
    return data
  } catch (error) {
    console.error('❌ Error fetching delivery statistics:', error)
    throw error
  }
}

/**
 * Send a notification to the user about their meal status
 * @param {string} userId - User ID
 * @param {string} mealName - Name of the meal
 * @param {string} status - New status
 * @returns {Promise<object>} Notification response
 */
export const sendStatusNotification = async (userId, mealName, status) => {
  try {
    // This would call your notification service
    // For now, just log it
    console.log('📧 Sending notification:', { userId, mealName, status })
    
    // TODO: In production, integrate with:
    // - Push notification service (Firebase Cloud Messaging, OneSignal)
    // - Email service (SendGrid, AWS SES)
    // - SMS service (Twilio)
    // - WebSocket for real-time updates
    
    // Example integration:
    // const response = await fetch(`${API_BASE_URL}/api/notifications/send`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     userId,
    //     title: 'Meal Status Update',
    //     message: `Your meal "${mealName}" is now ${status}`,
    //     type: 'delivery_status'
    //   })
    // })
    // return await response.json()
    
    return { success: true, message: 'Notification queued' }
  } catch (error) {
    console.error('❌ Error sending notification:', error)
    throw error
  }
}
