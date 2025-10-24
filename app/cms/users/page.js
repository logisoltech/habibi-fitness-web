'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../contexts/ThemeContext';

export default function UsersPage() {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://habibi-fitness-server.onrender.com/api/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlan = !filterPlan || user.plan === filterPlan;
    
    return matchesSearch && matchesPlan;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'created_at' || sortBy === 'updated_at') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getPlanColor = (plan) => {
    const colors = {
      'Balanced': 'bg-blue-100 text-blue-800',
      'Low Carb': 'bg-green-100 text-green-800',
      'Protein Boost': 'bg-red-100 text-red-800',
      'Vegetarian Kitchen': 'bg-purple-100 text-purple-800',
      "Chef's Choice": 'bg-yellow-100 text-yellow-800',
      'Keto': 'bg-orange-100 text-orange-800'
    };
    return colors[plan] || 'bg-gray-100 text-gray-800';
  };

  const getGoalColor = (goal) => {
    const colors = {
      'Weight Loss': 'bg-red-100 text-red-800',
      'Weight Gain': 'bg-green-100 text-green-800',
      'Staying Fit': 'bg-blue-100 text-blue-800',
      'Eating Healthy': 'bg-purple-100 text-purple-800',
      'Keto Diet': 'bg-orange-100 text-orange-800'
    };
    return colors[goal] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseMealTypes = (mealtypes) => {
    if (!mealtypes) return [];
    if (typeof mealtypes === 'string') {
      try {
        return JSON.parse(mealtypes);
      } catch {
        return mealtypes.split(',').map(t => t.trim());
      }
    }
    return mealtypes;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Error</div>
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {error}
          </p>
          <button
            onClick={fetchUsers}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Users Management</h1>
              <p className={`mt-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Manage all registered users ({sortedUsers.length} total)
              </p>
            </div>
            <button
              onClick={fetchUsers}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
              Refresh
        </button>
          </div>
      </div>

        {/* Filters */}
        <div className={`rounded-lg shadow-sm p-6 mb-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'border-gray-300'
                }`}
              />
            </div>

            {/* Plan Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Filter by Plan
              </label>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300'
                }`}
              >
                <option value="">All Plans</option>
                <option value="Balanced">Balanced</option>
                <option value="Low Carb">Low Carb</option>
                <option value="Protein Boost">Protein Boost</option>
                <option value="Vegetarian Kitchen">Vegetarian Kitchen</option>
                <option value="Chef's Choice">Chef&apos;s Choice</option>
                <option value="Keto">Keto</option>
              </select>
          </div>

            {/* Sort By */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300'
                }`}
              >
                <option value="created_at">Registration Date</option>
                <option value="name">Name</option>
                <option value="plan">Plan</option>
                <option value="goal">Goal</option>
                <option value="phone">Phone</option>
          </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300'
                }`}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
      </div>

        {/* Users Table */}
        <div className={`rounded-lg shadow-sm overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    User
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Contact
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Plan & Goal
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Preferences
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Stats
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Joined
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
              }`}>
                {sortedUsers.map((user) => (
                  <tr key={user.id} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    {/* User Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-800">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {user.name || 'No Name'}
                          </div>
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {user.phone || 'No Phone'}
                      </div>
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {user.email || 'No Email'}
                      </div>
                      {user.address && (
                        <div className={`text-xs truncate max-w-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {user.address}
                        </div>
                      )}
                    </td>

                    {/* Plan & Goal */}
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(user.plan)}`}>
                          {user.plan || 'No Plan'}
                        </span>
                        <br />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGoalColor(user.goal)}`}>
                          {user.goal || 'No Goal'}
                        </span>
                    </div>
                  </td>

                    {/* Preferences */}
                    <td className="px-6 py-4">
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        <div className="mb-1">
                          <span className="font-medium">Meals:</span> {parseMealTypes(user.mealtypes).join(', ') || 'None'}
                        </div>
                        <div className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {user.gender} • {user.weight}kg • {user.height}cm
                        </div>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <div className="space-y-1">
                        <div>BMI: {user.bmi || 'N/A'}</div>
                        <div>TDEE: {user.tdee || 'N/A'}</div>
                        <div className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Subscription: {user.subscription || 'None'}
                        </div>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatDate(user.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                      <button 
                          onClick={() => router.push(`/cms/users/${user.id}`)}
                          className="text-green-600 hover:text-green-900"
                      >
                          View
                      </button>
                      <button 
                          onClick={() => {
                            // Copy user ID to clipboard
                            navigator.clipboard.writeText(user.id);
                            alert('User ID copied to clipboard!');
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Copy ID
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          {/* Empty State */}
          {sortedUsers.length === 0 && (
            <div className="text-center py-12">
              <div className={`text-6xl mb-4 ${
                theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`}>👥</div>
              <h3 className={`text-lg font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>No users found</h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                {searchQuery || filterPlan 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No users have registered yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {sortedUsers.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`rounded-lg shadow-sm p-4 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{sortedUsers.length}</div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Total Users</div>
            </div>
            <div className={`rounded-lg shadow-sm p-4 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="text-2xl font-bold text-blue-600">
                {sortedUsers.filter(u => u.plan === 'Balanced').length}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Balanced Plan</div>
            </div>
            <div className={`rounded-lg shadow-sm p-4 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="text-2xl font-bold text-green-600">
                {sortedUsers.filter(u => u.plan === 'Low Carb').length}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Low Carb Plan</div>
            </div>
            <div className={`rounded-lg shadow-sm p-4 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="text-2xl font-bold text-red-600">
                {sortedUsers.filter(u => u.plan === 'Protein Boost').length}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Protein Boost</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}