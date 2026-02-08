/**
 * API Configuration
 *
 * Centralized API configuration using environment variables.
 */

// Get API URL from environment variable with fallback
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    delete: (id) => `${API_URL}/posts/${id}`,
    like: (id) => `${API_URL}/posts/${id}/like`,
    comments: (id) => `${API_URL}/posts/${id}/comments`,
  },
  // Community endpoints
  communities: {
    list: `${API_URL}/communities`,
    byId: (id) => `${API_URL}/communities/${id}`,
    join: (id) => `${API_URL}/communities/${id}/join`,
    leave: (id) => `${API_URL}/communities/${id}/leave`,
    members: (id) => `${API_URL}/communities/${id}/members`,
    posts: (id) => `${API_URL}/communities/${id}/posts`,
  },
  // Message endpoints
  messages: {
    send: `${API_URL}/messages`,
    withUser: (id) => `${API_URL}/messages/user/${id}`,
    inCommunity: (id) => `${API_URL}/messages/community/${id}`,
    delete: (id) => `${API_URL}/messages/${id}`,
  },
  // Upload endpoints
  uploads: {
    image: `${API_URL}/uploads/images`,
  },
};

// Default fetch options with credentials for session cookies
export const defaultFetchOptions = {
  credentials: 'include', // Include cookies for session auth
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * API helper function with error handling
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise} - Response data or throws error
 */
export async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...defaultFetchOptions,
    ...options,
    headers: {
      ...defaultFetchOptions.headers,
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

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include', // Include cookies for session auth
    body: formData,
    // Note: Don't set Content-Type header - browser sets it with boundary
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
