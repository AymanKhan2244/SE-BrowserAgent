import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";
import { AuthProvider } from "../authContext";

// Mock the API module
jest.mock("../api", () => ({
  login: jest.fn(),
}));

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login Page", () => {
  const mockedLogin = require("../api").login as jest.Mock;

  beforeEach(() => {
    mockedLogin.mockReset();
    mockNavigate.mockReset();
    localStorage.clear();
  });

  const renderComponent = () => {
    return render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>,
    );
  };

  test("renders email and password fields and submit button", () => {
    renderComponent();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("shows validation errors when fields are empty", async () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Required")).toBeInTheDocument();
    });

    // Two required messages: one for email, one for password
    const requiredMessages = screen.getAllByText("Required");
    expect(requiredMessages).toHaveLength(2);
  });

  test("shows email format validation error", async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalid-email" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });
  });

  test("successful login stores token and redirects", async () => {
    const fakeResponse = {
      access_token: "fake-jwt-token",
      user: { id: 1, email: "test@example.com", name: "Test User" },
    };
    mockedLogin.mockResolvedValueOnce(fakeResponse);

    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "securePass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Wait for async login handling
    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith(
        "test@example.com",
        "securePass123",
      );
    });

    // Verify navigation to dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });

    // Verify localStorage persistence
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    expect(storedToken).toBe(fakeResponse.access_token);
    expect(storedUser).toBe(JSON.stringify(fakeResponse.user));
  });

  test("displays server error message on failed login", async () => {
    const errorMessage = "Invalid credentials";
    mockedLogin.mockRejectedValueOnce(new Error(errorMessage));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "badpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Ensure no navigation occurred
    expect(mockNavigate).not.toHaveBeenCalled();

    // Ensure nothing persisted
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});