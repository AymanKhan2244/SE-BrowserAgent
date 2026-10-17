import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  FC,
} from "react";
import { login as apiLogin, register as apiRegister } from "./api";

/**
 * Shape of the authenticated user object.
 */
export interface User {
  id: number;
  email: string;
  name?: string;
}

/**
 * Context value exposed to consuming components.
 */
export interface AuthContextType {
  /** Currently authenticated user or null if not logged in */
  user: User | null;
  /** JWT access token (stored in memory, also persisted in localStorage) */
  token: string | null;
  /** True when a user is authenticated */
  isAuthenticated: boolean;
  /** Perform login with email & password */
  login: (email: string, password: string) => Promise<void>;
  /** Perform registration and automatically log the user in */
  register: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<void>;
  /** Log out the current user */
  logout: () => void;
}

/**
 * React context used throughout the app.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to conveniently access the AuthContext.
 *
 * @throws Error if used outside of an AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Props for the AuthProvider component.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that holds authentication state and helpers.
 *
 * It reads any persisted token from localStorage on mount, validates it
 * (basic existence check – real validation should be done server‑side),
 * and provides login, register and logout functions to the rest of the app.
 */
export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load persisted token/user on initial render
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        // Corrupted data – clear it
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  /**
   * Persist token and user to localStorage.
   */
  const persistAuth = (newToken: string, newUser: User) => {
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  /**
   * Clear persisted authentication data.
   */
  const clearAuth = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  /**
   * Login helper – calls the backend, stores token/user on success.
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiLogin(email, password);
      // Expected shape: { access_token: string; user: User }
      if (response && response.access_token && response.user) {
        persistAuth(response.access_token, response.user);
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error) {
      clearAuth();
      // Re‑throw so UI components can display the error
      throw error;
    }
  };

  /**
   * Register helper – registers then logs the user in automatically.
   */
  const register = async (
    email: string,
    password: string,
    name?: string,
  ): Promise<void> => {
    try {
      const response = await apiRegister(email, password, name);
      // Expected shape: { access_token: string; user: User }
      if (response && response.access_token && response.user) {
        persistAuth(response.access_token, response.user);
      } else {
        throw new Error("Invalid registration response");
      }
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  /**
   * Logout helper – clears all auth data.
   */
  const logout = (): void => {
    clearAuth();
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};