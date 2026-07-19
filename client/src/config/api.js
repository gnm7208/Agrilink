/**
 * API Configuration
 *
 * Centralized API configuration using environment variables.
 */

// Get API URL from environment variable - MUST be set in production
const apiUrlFromEnv = import.meta.env.VITE_API_URL;

// Validate API_URL is configured (required for production)
if (!apiUrlFromEnv && import.meta.env.PROD) {
  throw new Error('VITE_API_URL environment variable is required in production');
}

// In development prefer a relative `/api` so Vite dev server proxy (if enabled)
// can forward requests to the backend and avoid CORS / SameSite cookie issues.
export const API_URL = apiUrlFromEnv || '/api';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    register: `${API_URL}/auth/register`,
    login: `${API_URL}/auth/login`,
    logout: `${API_URL}/auth/logout`,
    me: `${API_URL}/auth/me`,
    verifyEmail: `${API_URL}/auth/verify-email`,
    resendVerification: `${API_URL}/auth/resend-verification`,
    requestPasswordReset: `${API_URL}/auth/request-password-reset`,
    verifyResetToken: (token) => `${API_URL}/auth/verify-reset-token/${token}`,
    resetPassword: `${API_URL}/auth/reset-password`,
  },
  // User endpoints
  users: {
    list: `${API_URL}/users`,
    experts: `${API_URL}/users/experts`,
    byId: (id) => `${API_URL}/users/${id}`,
    follow: (id) => `${API_URL}/users/${id}/follow`,
    followers: (id) => `${API_URL}/users/${id}/followers`,
    following: (id) => `${API_URL}/users/${id}/following`,
  },
  // Post endpoints
  posts: {
    list: `${API_URL}/posts`,
    byId: (id) => `${API_URL}/posts/${id}`,
    create: `${API_URL}/posts`,
    update: (id) => `${API_URL}/posts/${id}`,
    news: `${API_URL}/posts/news`,
    newsById: (id) => `${API_URL}/posts/news/${id}`,
    like: (id) => `${API_URL}/posts/${id}/like`,
    comments: (id) => `${API_URL}/posts/${id}/comments`,
    addImage: (id) => `${API_URL}/posts/${id}/images`,
  },
  // Community endpoints
  communities: {
    list: `${API_URL}/communities`,
    create: `${API_URL}/communities`,
    byId: (id) => `${API_URL}/communities/${id}`,
    join: (id) => `${API_URL}/communities/${id}/join`,
    leave: (id) => `${API_URL}/communities/${id}/leave`,
    members: (id) => `${API_URL}/communities/${id}/members`,
    posts: (id) => `${API_URL}/communities/${id}/posts`,
  },
  // Message endpoints
  messages: {
    send: `${API_URL}/messages`,
    conversations: `${API_URL}/messages/conversations`,
    withUser: (id) => `${API_URL}/messages/user/${id}`,
    inCommunity: (id) => `${API_URL}/messages/community/${id}`,
    delete: (id) => `${API_URL}/messages/${id}`,
  },
  // Upload endpoints
  uploads: {
    image: `${API_URL}/uploads/images`,
  },
  // Report/flag endpoints
  reports: {
    create: `${API_URL}/reports`,
  },
  // Crop issue helper endpoints
  cropHelper: {
    symptoms: `${API_URL}/crop-helper/symptoms`,
    diagnose: `${API_URL}/crop-helper/diagnose`,
  },
  // Market price board endpoints
  market: {
    list: `${API_URL}/market-prices`,
    crops: `${API_URL}/market-prices/crops`,
    create: `${API_URL}/market-prices`,
    delete: (id) => `${API_URL}/market-prices/${id}`,
  },
  // Admin endpoints
  admin: {
    stats: `${API_URL}/admin/stats`,
    users: `${API_URL}/admin/users`,
    userById: (id) => `${API_URL}/admin/users/${id}`,
    userStatus: (id) => `${API_URL}/admin/users/${id}/status`,
    userRole: (id) => `${API_URL}/admin/users/${id}/role`,
    communities: `${API_URL}/admin/communities`,
    deleteCommunity: (id) => `${API_URL}/communities/${id}`,
    posts: `${API_URL}/admin/posts`,
    deletePost: (id) => `${API_URL}/admin/posts/${id}`,
    deleteComment: (id) => `${API_URL}/admin/comments/${id}`,
    auditLog: `${API_URL}/admin/audit-log`,
    reports: `${API_URL}/admin/reports`,
    reportStatus: (id) => `${API_URL}/admin/reports/${id}`,
  },
};

// JWT token helpers
export function getToken() {
  return localStorage.getItem('auth_token');
}

export function setToken(token) {
  localStorage.setItem('auth_token', token);
}

export function removeToken() {
  localStorage.removeItem('auth_token');
}

// Build headers with JWT token if available
function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * API helper function with error handling
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise} - Response data or throws error
 */
export async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  // Handle different response types
  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Throw error for non-OK responses
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'An error occurred');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Upload a file (image) to the server
 * @param {string} url - Upload endpoint URL
 * @param {File} file - File object to upload
 * @param {string} fieldName - Form field name (default: 'image')
 * @returns {Promise} - Response data with uploaded file URL
 */
export async function uploadFile(url, file, fieldName = 'image') {
  const formData = new FormData();
  formData.append(fieldName, file);

  const headers = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Upload failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
