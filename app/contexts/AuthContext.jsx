"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('habibi_user');
        const storedSession = localStorage.getItem('habibi_session');
        const guestMode = localStorage.getItem('guest_mode');
        
        if (storedUser && storedSession) {
          setUser(JSON.parse(storedUser));
          setSession(JSON.parse(storedSession));
        } else if (guestMode === 'true') {
          // Set guest user for guest mode
          setUser({ id: 'guest', name: 'Guest User', isGuest: true });
          setSession({ access_token: 'guest_token', isGuest: true });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Clear auth data
  const clearAuth = () => {
    setUser(null);
    setSession(null);
    setError(null);
    localStorage.removeItem('habibi_user');
    localStorage.removeItem('habibi_session');
    localStorage.removeItem('guest_mode');
  };

  // Sign up function
  const signUp = async (phoneNumber, fullName) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          full_name: fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP function
  const verifyOTP = async (phoneNumber, otp) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      // Store user and session data
      setUser(data.user);
      setSession(data.session);
      localStorage.setItem('habibi_user', JSON.stringify(data.user));
      localStorage.setItem('habibi_session', JSON.stringify(data.session));

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login function (if you have a login API)
  const login = async (phoneNumber) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(user && session);
  };

  // Check if user is in guest mode
  const isGuestMode = () => {
    return !!(user?.isGuest && session?.isGuest);
  };

  // Get access token
  const getAccessToken = () => {
    return session?.access_token || null;
  };

  // Get refresh token
  const getRefreshToken = () => {
    return session?.refresh_token || null;
  };

  // Make authenticated API calls
  const apiCall = async (url, options = {}) => {
    const token = getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  };
  

  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    verifyOTP,
    login,
    logout,
    isAuthenticated,
    isGuestMode,
    getAccessToken,
    getRefreshToken,
    apiCall,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
