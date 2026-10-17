import { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") ?? "http://localhost:8000";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface ProtectedData {
  message: string;
  data?: unknown;
}

/**
 * Store JWT token in localStorage.
 */
export function setAuthToken(token: string): void {
  localStorage.setItem("authToken", token);
}

/**
 * Retrieve JWT token from localStorage.
 */
export function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

/**
 * Remove JWT token from localStorage.
 */
export function clearAuthToken(): void {
  localStorage.removeItem("authToken");
}

/**
 * Register a new user.
 * @param payload Registration data.
 * @throws Error if the request fails.
 */
export async function registerUser(payload: RegisterData): Promise<UserResponse> {
  const response = await fetch(`${BACKEND_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail ?? `Registration failed with status ${response.status}`;
    throw new Error(message);
  }

  const data: UserResponse = await response.json();
  return data;
}

/**
 * Log in an existing user.
 * @param payload Login credentials.
 * @throws Error if the request fails.
 */
export async function loginUser(payload: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail ?? `Login failed with status ${response.status}`;
    throw new Error(message);
  }

  const data: AuthResponse = await response.json();
  setAuthToken(data.access_token);
  return data;
}

/**
 * Fetch data from a protected endpoint.
 * @param token Optional JWT token; if omitted, token is read from localStorage.
 * @throws Error if the request fails or token is missing.
 */
export async function fetchProtectedData(token?: string): Promise<ProtectedData> {
  const authToken = token ?? getAuthToken();

  if (!authToken) {
    throw new Error("Authentication token is missing.");
  }

  const response = await fetch(`${BACKEND_URL}/protected`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  const data: ProtectedData = await response.json();
  return data;
}

/**
 * Custom React hook to manage authentication state.
 * Provides login, logout, and token retrieval utilities.
 */
export function useAuth() {
  const [token, setToken] = useState<string | null>(getAuthToken());

  const login = async (payload: LoginData) => {
    const auth = await loginUser(payload);
    setToken(auth.access_token);
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
  };

  const isAuthenticated = !!token;

  return { token, isAuthenticated, login, logout };
}