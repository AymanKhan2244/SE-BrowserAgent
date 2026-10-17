import React, { useEffect, useState } from "react";
import { useAuth } from "../authContext";
import { fetchProtectedData, ProtectedData } from "../api";

/**
 * Dashboard page – a protected view that retrieves data from the backend.
 *
 * It uses the JWT stored in the AuthContext to call the `/protected` endpoint.
 * While the request is in progress a loading indicator is shown. Errors are
 * displayed to the user, and successful responses render the returned data.
 */
const Dashboard: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [data, setData] = useState<ProtectedData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If there is no token, the user is not authenticated – nothing to fetch.
    if (!token) {
      setError("You are not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const result = await fetchProtectedData(token);
        setData(result);
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {loading && (
        <p className="text-gray-600 animate-pulse">Loading protected data...</p>
      )}

      {error && (
        <p className="text-red-600 bg-red-100 p-3 rounded">{error}</p>
      )}

      {data && (
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">{data.message}</h2>
          {data.data && (
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(data.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;