const API_BASE_URL = 'https://habibi-fitness-server.onrender.com/api';

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
      ...options,
    };

    try {
      console.log(`Making API request to: ${url}`);
      console.log(`Request config:`, config);
      
      const response = await fetch(url, config);
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, response.headers);
      
      const responseText = await response.text();
      console.log(`Response text:`, responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`JSON parse error. Response was:`, responseText);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      console.error(`Full URL was: ${url}`);
      throw error;
    }
  }

  // Meals API
  static async getMeals() {
    return this.request('/meals');
  }

  static async getMealById(id) {
    return this.request(`/meals/${id}`);
  }

  static async createMeal(mealData) {
    return this.request('/meals', {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
  }

  static async updateMeal(id, mealData) {
    return this.request(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mealData),
    });
  }

  static async deleteMeal(id) {
    return this.request(`/meals/${id}`, {
      method: 'DELETE',
    });
  }

  // Users API
  static async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async getUserByPhone(phone) {
    return this.request(`/users/phone/${encodeURIComponent(phone)}`);
  }

  static async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Recommendations API
  static async getRecommendationsByPlan(plan, goal = null) {
    const goalParam = goal ? `?goal=${encodeURIComponent(goal)}` : '';
    return this.request(`/recommendations/plan/${encodeURIComponent(plan)}${goalParam}`);
  }

  static async getRecommendationsForUser(userId) {
    return this.request(`/recommendations/${userId}`);
  }

  // Meal Scheduling API
  static async generateMealSchedule(userId, weeks = 4) {
    console.log('API: generateMealSchedule called with userId:', userId, 'type:', typeof userId, 'weeks:', weeks);
    return this.request('/schedule/generate', {
      method: 'POST',
      body: JSON.stringify({ userId, weeks }),
    });
  }

  static async getMealSchedule(userId, week = null) {
    console.log('API: getMealSchedule called with userId:', userId, 'type:', typeof userId);
    const weekParam = week ? `?week=${week}` : '';
    const url = `/schedule/${userId}${weekParam}`;
    console.log('API: Requesting URL:', url);
    try {
      return await this.request(url);
    } catch (error) {
      // Silently fail for 404s (no schedule exists yet) - this is expected for new users
      if (error.message.includes('No meal schedule found')) {
        console.log('📝 No existing schedule found - will generate a new one');
        throw error; // Still throw so the caller can catch and generate
      }
      throw error; // Re-throw other errors
    }
  }

  static async getWeeklyMeals(userId, weekNumber) {
    return this.request(`/schedule/${userId}/week/${weekNumber}`);
  }

  static async updateMealSchedule(userId, preferences) {
    return this.request(`/schedule/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    });
  }

  // User search methods
  static async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  static async searchUsers(query) {
    return this.request(`/users/search?q=${encodeURIComponent(query)}`);
  }

  static async swapMeals(swapData) {
    console.log('API: swapMeals called with swapData:', swapData);
    return this.request('/schedule/swap-meals', {
      method: 'POST',
      body: JSON.stringify(swapData),
    });
  }

  // Delivery Status API
  static async getUserDeliveryStatus(userId, date = null, status = null) {
    let url = `/delivery-status/user/${userId}`;
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;
    
    return this.request(url);
  }

  static async updateMealStatus(userId, mealId, status, date, mealType = '', notes = '', mealKey = '', weekIndex = null, dayKey = '') {
    return this.request('/delivery-status/update', {
      method: 'POST',
      body: JSON.stringify({
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
      }),
    });
  }

  // Health check
  static async healthCheck() {
    return this.request('/health');
  }
}

export default ApiService;
