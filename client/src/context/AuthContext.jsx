import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest, API_ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.auth.me);
      if (response.authenticated && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await apiRequest(API_ENDPOINTS.auth.logout, { method: 'POST' });
    } catch {
      // Ignore logout errors
    }
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    refreshUser: fetchUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
