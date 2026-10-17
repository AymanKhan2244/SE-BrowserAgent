import React, { useState, useEffect, FormEvent } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link,
  Outlet,
} from "react-router-dom";
import { registerUser, loginUser, getToken, clearToken } from "./api";

/**
 * Checks if a JWT token exists in localStorage.
 * @returns {boolean}
 */
const isAuthenticated = (): boolean => !!getToken();

/**
 * Wrapper component that protects child routes.
 * Redirects to /login if the user is not authenticated.
 */
const ProtectedRoute: React.FC = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

/**
 * Home page – simple welcome screen with navigation links.
 */
const Home: React.FC = () => (
  <div className="container">
    <h1 className="title">Welcome to Auth System</h1>
    <nav className="nav">
      <Link to="/login" className="nav-link">
        Login
      </Link>
      <Link to="/register" className="nav-link">
        Register
      </Link>
      <Link to="/dashboard" className="nav-link">
        Dashboard
      </Link>
    </nav>
  </div>
);

/**
 * Registration form component.
 */
const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await registerUser({ email, password });
      navigate("/login");
    } catch (err: any) {
      setError(err?.message ?? "Registration failed");
    }
  };

  return (
    <div className="container">
      <h2 className="title">Register</h2>
      <form onSubmit={handleSubmit} className="form">
        <label className="label">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
        </label>
        <label className="label">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="button">
          Register
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>.
      </p>
    </div>
  );
};

/**
 * Login form component.
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await loginUser({ email, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    }
  };

  return (
    <div className="container">
      <h2 className="title">Login</h2>
      <form onSubmit={handleSubmit} className="form">
        <label className="label">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
        </label>
        <label className="label">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="button">
          Login
        </button>
      </form>
      <p>
        New user? <Link to="/register">Register here</Link>.
      </p>
    </div>
  );
};

/**
 * Dashboard component – only accessible when authenticated.
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/");
  };

  return (
    <div className="container">
      <h2 className="title">Dashboard</h2>
      <p>You are logged in!</p>
      <button onClick={handleLogout} className="button logout">
        Logout
      </button>
    </div>
  );
};

/**
 * Main application component defining routes and layout.
 */
const App: React.FC = () => {
  // Ensure that token changes trigger a re‑render for protected routes.
  const [, setAuthState] = useState<boolean>(isAuthenticated());

  useEffect(() => {
    const handleStorage = () => setAuthState(isAuthenticated());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;