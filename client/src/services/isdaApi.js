/**
 * ISDA Africa API Service
 * 
 * Handles authentication and token management for the ISDA Africa API.
 * The API uses Firebase JWT tokens that expire after 1 hour.
 * 
 * API Base URL: https://api.isda-africa.com
 */

// Get ISDA API configuration from environment variables
const ISDA_API_BASE_URL = import.meta.env.VITE_ISDA_API_URL || 'https://api.isda-africa.com';
const ISDA_USERNAME = import.meta.env.VITE_ISDA_USERNAME;
const ISDA_PASSWORD = import.meta.env.VITE_ISDA_PASSWORD;

// Token storage keys
const ISDA_TOKEN_KEY = 'isda_access_token';
const ISDA_TOKEN_EXPIRY_KEY = 'isda_token_expiry';

/**
 * Decode JWT token to extract expiration time
 * @param {string} token - JWT token string
 * @returns {number|null} - Expiration timestamp in seconds or null if invalid
 */
export function decodeJWTExpiry(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp || null;
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Get current timestamp in seconds
 * @returns {number} - Current Unix timestamp
 */
export function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Check if the stored token is expired or about to expire
 * @param {number} bufferSeconds - Additional buffer time (default: 300 seconds = 5 minutes)
 * @returns {boolean} - True if token is expired or will expire soon
 */
export function isTokenExpired(bufferSeconds = 300) {
  const expiry = getTokenExpiry();
  if (!expiry) return true;
  
  return getCurrentTimestamp() >= (expiry - bufferSeconds);
}

/**
 * Store the access token and its expiration time
 * @param {string} token - Access token
 */
export function setISDAToken(token) {
  localStorage.setItem(ISDA_TOKEN_KEY, token);
  
  // Decode and store expiration time
  const expiry = decodeJWTExpiry(token);
  if (expiry) {
    localStorage.setItem(ISDA_TOKEN_EXPIRY_KEY, expiry.toString());
  }
}

/**
 * Get the stored access token
 * @returns {string|null} - Access token or null if not stored
 */
export function getISDAToken() {
  return localStorage.getItem(ISDA_TOKEN_KEY);
}

/**
 * Get the stored token expiration time
 * @returns {number|null} - Expiration timestamp or null if not stored
 */
export function getTokenExpiry() {
  const expiryStr = localStorage.getItem(ISDA_TOKEN_EXPIRY_KEY);
  return expiryStr ? parseInt(expiryStr, 10) : null;
}

/**
 * Remove the stored token and expiration
 */
export function removeISDAToken() {
  localStorage.removeItem(ISDA_TOKEN_KEY);
  localStorage.removeItem(ISDA_TOKEN_EXPIRY_KEY);
}

/**
 * Authenticate with ISDA Africa API
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export async function loginToISDA() {
  if (!ISDA_USERNAME || !ISDA_PASSWORD) {
    throw new Error('ISDA credentials not configured. Set VITE_ISDA_USERNAME and VITE_ISDA_PASSWORD in environment.');
  }

  const response = await fetch(`${ISDA_API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `username=${encodeURIComponent(ISDA_USERNAME)}&password=${encodeURIComponent(ISDA_PASSWORD)}`,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `ISDA login failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Store the token
  setISDAToken(data.access_token);
  
  return data;
}

/**
 * Get a valid ISDA access token, refreshing if necessary
 * @returns {Promise<string>} - Valid access token
 */
export async function getValidISDAToken() {
  const currentToken = getISDAToken();
  
  // If no token exists, perform login
  if (!currentToken) {
    return await loginToISDA().then(data => data.access_token);
  }
  
  // Check if token is expired or about to expire
  if (isTokenExpired()) {
    // Token expired, need to re-authenticate
    return await loginToISDA().then(data => data.access_token);
  }
  
  return currentToken;
}

/**
 * Make an authenticated request to ISDA API
 * Automatically handles token refresh on 401 errors
 * @param {string} endpoint - API endpoint (e.g., '/weather')
 * @param {object} options - Fetch options
 * @returns {Promise} - Response data
 */
export async function isdaApiRequest(endpoint, options = {}) {
  // Ensure we have a valid token
  const token = await getValidISDAToken();
  
  const response = await fetch(`${ISDA_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  // If unauthorized, try to refresh token and retry once
  if (response.status === 401) {
    removeISDAToken();
    const newToken = await loginToISDA().then(data => data.access_token);
    
    const retryResponse = await fetch(`${ISDA_API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${newToken}`,
        ...options.headers,
      },
    });
    
    if (!retryResponse.ok) {
      const error = await retryResponse.json().catch(() => ({}));
      throw new Error(error.message || `ISDA API error: ${retryResponse.status}`);
    }
    
    return await retryResponse.json();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `ISDA API error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get remaining time until token expires
 * @returns {number|null} - Seconds until expiration, or null if no token
 */
export function getTimeUntilExpiry() {
  const expiry = getTokenExpiry();
  if (!expiry) return null;
  
  const remaining = expiry - getCurrentTimestamp();
  return remaining > 0 ? remaining : 0;
}

/**
 * Logout from ISDA (remove stored token)
 */
export function logoutFromISDA() {
  removeISDAToken();
}

/**
 * Check if user is authenticated with ISDA
 * @returns {boolean} - True if valid token exists
 */
export function isISDAAuthenticated() {
  return !!getISDAToken() && !isTokenExpired();
}

export default {
  login: loginToISDA,
  logout: logoutFromISDA,
  getToken: getValidISDAToken,
  getTimeUntilExpiry,
  isAuthenticated: isISDAAuthenticated,
  isdaApiRequest,
};
