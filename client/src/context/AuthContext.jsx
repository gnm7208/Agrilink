import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest, API_ENDPOINTS, getToken, removeToken } from '../config/api';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    // Skip API call if no token stored
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const response = await apiRequest(API_ENDPOINTS.auth.me);
      if (response.authenticated && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
        removeToken();
      }
    } catch {
      setUser(null);
      removeToken();
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
    removeToken();
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
