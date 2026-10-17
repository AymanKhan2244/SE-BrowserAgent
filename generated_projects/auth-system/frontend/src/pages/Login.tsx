import React, { useState } from "react";
import { useFormik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useAuth } from "../authContext";
import { useNavigate, Link } from "react-router-dom";

interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * Login page component.
 *
 * Renders a Formik form with Yup validation. On successful login the user
 * is redirected to the dashboard. Errors from the authentication request are
 * displayed to the user.
 */
const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const initialValues: LoginFormValues = { email: "", password: "" };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Required"),
  });

  const onSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>
  ) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate("/dashboard");
    } catch (err: any) {
      // err may be a string or an Error object
      const message =
        typeof err === "string"
          ? err
          : err?.message ?? "An unexpected error occurred";
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik<LoginFormValues>({
    initialValues,
    validationSchema,
    onSubmit,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Login
        </h2>

        {serverError && (
          <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              {...formik.getFieldProps("email")}
              className={`mt-1 block w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1 text-xs text-red-600">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...formik.getFieldProps("password")}
              className={`mt-1 block w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
              }`}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {formik.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full rounded bg-indigo-600 py-2 px-4 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {formik.isSubmitting ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;