'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  fetchDeliveryStatuses, 
  fetchDeliveriesByDate, 
  fetchUserDeliveryStatus,
  fetchDeliveryStatistics,
  updateMealStatus,
  batchUpdateMealStatuses 
} from '../utils/deliveryApi';

export default function DeliveryDashboard() {
  const [stats, setStats] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load statistics
      const statsData = await fetchDeliveryStatistics();
      setStats(statsData.data);

      // Load deliveries for selected date
      const deliveriesData = await fetchDeliveriesByDate(selectedDate);
      setDeliveries(deliveriesData.data || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleStatusUpdate = async (userId, mealId, newStatus) => {
    try {
      await updateMealStatus(
        userId, 
        mealId, 
        newStatus, 
        selectedDate, 
        'meal', 
        'Updated via dashboard'
      );
      
      // Refresh data after update
      await loadDashboardData();
      alert('Status updated successfully!');
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleBatchUpdate = async () => {
    try {
      // Example: Update all pending meals to preparing
      const pendingMeals = deliveries
        .flatMap(delivery => delivery.meals || [])
        .filter(meal => meal.status === 'pending')
        .map(meal => ({
          userId: meal.userId || 'unknown',
          mealId: meal.id,
          status: 'preparing',
          notes: 'Batch updated via dashboard'
        }));

      if (pendingMeals.length === 0) {
        alert('No pending meals to update');
        return;
      }

      await batchUpdateMealStatuses(pendingMeals);
      await loadDashboardData();
      alert(`Updated ${pendingMeals.length} meals to preparing!`);
    } catch (err) {
      alert('Batch update failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Dashboard</h1>
          <p className="mt-2 text-gray-600">Real-time meal delivery management</p>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={loadDashboardData}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
              <div className="text-sm text-gray-500">Total Orders</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.byStatus.preparing}</div>
              <div className="text-sm text-gray-500">Preparing</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.byStatus.out_for_delivery}</div>
              <div className="text-sm text-gray-500">Out for Delivery</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold text-green-600">{stats.byStatus.delivered}</div>
              <div className="text-sm text-gray-500">Delivered</div>
            </div>
          </div>
        )}

        {/* Batch Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Batch Actions</h3>
          <div className="flex gap-4">
            <button
              onClick={handleBatchUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Update All Pending to Preparing
            </button>
          </div>
        </div>

        {/* Deliveries for Selected Date */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Deliveries for {selectedDate} ({deliveries.length} users)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveries.map((delivery) => (
                  <tr key={delivery.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.userName || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {delivery.userId} • {delivery.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {(delivery.meals || []).map((meal, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{meal.name}</div>
                              <div className="text-xs text-gray-500">{meal.type} • {meal.calories} cal</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                meal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                meal.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                                meal.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-800' :
                                meal.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {meal.status}
                              </span>
                              <select
                                value={meal.status}
                                onChange={(e) => handleStatusUpdate(delivery.userId, meal.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="pending">Pending</option>
                                <option value="preparing">Preparing</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          // Navigate to user detail page
                          window.open(`/cms/update-delivery-status?user=${delivery.userId}`, '_blank');
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {deliveries.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries found</h3>
              <p className="text-gray-500">No meals scheduled for {selectedDate}</p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="text-red-600">❌ Error: {error}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
