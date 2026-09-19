import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest, API_ENDPOINTS, getToken, removeToken } from '../config/api';
import { AuthContext } from './authContext';
import { 
  loginToISDA, 
  logoutFromISDA, 
  getValidISDAToken, 
  getTimeUntilExpiry,
  isISDAAuthenticated,
  isdaApiRequest
} from '../services/isdaApi';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isdaAuthenticated, setIsdaAuthenticated] = useState(false);
  const [isdaTokenExpiry, setIsdaTokenExpiry] = useState(null);

  // Check ISDA token status
  const checkISDAStatus = useCallback(() => {
    const authenticated = isISDAAuthenticated();
    const expiry = getTimeUntilExpiry();
    setIsdaAuthenticated(authenticated);
    setIsdaTokenExpiry(expiry);
  }, []);

  // Initialize ISDA authentication on mount
  useEffect(() => {
    checkISDAStatus();
  }, [checkISDAStatus]);

  // Login to ISDA API
  const loginToISDACallback = useCallback(async () => {
    try {
      await loginToISDA();
      checkISDAStatus();
      return true;
    } catch (error) {
      console.error('ISDA Login failed:', error);
      return false;
    }
  }, [checkISDAStatus]);

  // Logout from ISDA API
  const logoutFromISDACallback = useCallback(() => {
    logoutFromISDA();
    setIsdaAuthenticated(false);
    setIsdaTokenExpiry(null);
  }, []);

  // Get valid ISDA token (auto-refreshes if needed)
  const getISDAToken = useCallback(async () => {
    try {
      const token = await getValidISDAToken();
      checkISDAStatus();
      return token;
    } catch (error) {
      console.error('Failed to get ISDA token:', error);
      return null;
    }
  }, [checkISDAStatus]);

  // Make ISDA API request (with auto token refresh)
  const isdaRequest = useCallback(async (endpoint, options = {}) => {
    try {
      const result = await isdaApiRequest(endpoint, options);
      checkISDAStatus();
      return result;
    } catch (error) {
      checkISDAStatus();
      throw error;
    }
  }, [checkISDAStatus]);

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
        // Server explicitly says the token is invalid/expired.
        setUser(null);
        removeToken();
      }
    } catch (err) {
      // Only treat a real auth rejection (401) as "logged out". Transient
      // failures (429 rate limit, network error, 500) shouldn't wipe the
      // token and force a re-login — just leave the current session as-is.
      if (err.status === 401) {
        setUser(null);
        removeToken();
      }
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

  // Erase the account server-side (password re-checked there), then drop the session locally.
  const deleteAccount = useCallback(async (password) => {
    await apiRequest(API_ENDPOINTS.auth.me, { method: 'DELETE', body: JSON.stringify({ password }) });
    setUser(null);
    removeToken();
    localStorage.removeItem('user');
  }, []);

  // Update user data (e.g., after profile edit)
  const updateUser = useCallback((updatedUserData) => {
    setUser(updatedUserData);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    refreshUser: fetchUser,
    logout,
    deleteAccount,
    updateUser,
    // ISDA API Integration
    isdaAuthenticated,
    isdaTokenExpiry,
    loginToISDA: loginToISDACallback,
    logoutFromISDA: logoutFromISDACallback,
    getISDAToken,
    isdaRequest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
