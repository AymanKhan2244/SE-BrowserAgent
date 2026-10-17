// frontend/src/api.js

/**
 * API utility module for authentication.
 * Provides functions to register, login, logout, and manage JWT tokens.
 *
 * The backend is expected to expose the following endpoints:
 * POST   /auth/register   { email, password } -> { access_token, token_type }
 * POST   /auth/login      { email, password } -> { access_token, token_type }
 *
 * Tokens are stored in localStorage under the key 'access_token'.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Store JWT access token in localStorage.
 * @param {string} token
 */
function setToken(token) {
  localStorage.setItem('access_token', token);
}

/**
 * Retrieve JWT access token from localStorage.
 * @returns {string|null}
 */
function getToken() {
  return localStorage.getItem('access_token');
}

/**
 * Remove JWT access token from localStorage.
 */
function clearToken() {
  localStorage.removeItem('access_token');
}

/**
 * Build Authorization header for authenticated requests.
 * @returns {{ Authorization: string } | {}}
 */
function getAuthHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Register a new user.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ access_token: string; token_type: string }>}
 * @throws {Error} If the request fails or the server returns an error.
 */
async function register(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.detail || 'Registration failed';
    throw new Error(errorMsg);
  }

  if (data.access_token) {
    setToken(data.access_token);
  }

  return data;
}

/**
 * Log in an existing user.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ access_token: string; token_type: string }>}
 * @throws {Error} If the request fails or the server returns an error.
 */
async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.detail || 'Login failed';
    throw new Error(errorMsg);
  }

  if (data.access_token) {
    setToken(data.access_token);
  }

  return data;
}

/**
 * Log out the current user by clearing the stored token.
 */
function logout() {
  clearToken();
}

/**
 * Wrapper for making authenticated GET requests.
 *
 * @param {string} endpoint - API endpoint relative to API_BASE_URL (e.g., '/protected')
 * @returns {Promise<any>}
 * @throws {Error} If the request fails.
 */
async function getAuthenticated(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.detail || 'Request failed';
    throw new Error(errorMsg);
  }

  return data;
}

export {
  register,
  login,
  logout,
  getToken,
  setToken,
  clearToken,
  getAuthHeader,
  getAuthenticated,
};