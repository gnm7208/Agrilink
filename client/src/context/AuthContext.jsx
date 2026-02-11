import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest, API_ENDPOINTS } from '../config/api';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [csrfLoaded, setCsrfLoaded] = useState(false);

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
      setLoadingUser(false);
    }
  }, []);

  const fetchCsrfToken = useCallback(async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.auth.csrfToken);
      if (data && data.csrf_token) {
        try {
          localStorage.setItem('csrfToken', data.csrf_token);
        } catch {
          // Ignore storage errors (e.g. in private mode)
        }
      }
    } catch {
      // If this fails, requests will simply be rejected by the backend.
    } finally {
      setCsrfLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchCsrfToken();
  }, [fetchUser, fetchCsrfToken]);

  const logout = useCallback(async () => {
    try {
      await apiRequest(API_ENDPOINTS.auth.logout, { method: 'POST' });
    } catch {
      // Ignore logout errors
    }
    setUser(null);
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('csrfToken');
    } catch {
      // Ignore storage errors
    }
  }, []);

  const value = {
    user,
    loading: loadingUser || !csrfLoaded,
    isAuthenticated: !!user,
    refreshUser: fetchUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
