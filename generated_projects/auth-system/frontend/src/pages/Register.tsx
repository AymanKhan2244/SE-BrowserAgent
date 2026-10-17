import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { registerUser } from "../api";

/**
 * Shape of the registration form values.
 */
interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Validation schema for the registration form.
 */
const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .max(50, "Name must be at most 50 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be at most 64 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

/**
 * Register page component.
 *
 * Renders a registration form using Formik and Yup for validation.
 * On successful registration, redirects the user to the login page.
 */
const Register: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: RegisterFormValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (
    values: RegisterFormValues,
    actions: FormikHelpers<RegisterFormValues>
  ) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      // The backend expects { username, email, password } – map accordingly.
      await registerUser({
        username: values.name,
        email: values.email,
        password: values.password,
      });
      actions.resetForm();
      navigate("/login");
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">
          Create an Account
        </h2>

        {serverError && (
          <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ touched, errors }) => (
            <Form>
              {/* Name */}
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className={`mt-1 block w-full rounded-md border ${
                    touched.name && errors.name
                      ? "border-red-500"
                      : "border-gray-300"
                  } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="mt-1 text-xs text-red-600"
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`mt-1 block w-full rounded-md border ${
                    touched.email && errors.email
                      ? "border-red-500"
                      : "border-gray-300"
                  } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="mt-1 text-xs text-red-600"
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  placeholder="********"
                  className={`mt-1 block w-full rounded-md border ${
                    touched.password && errors.password
                      ? "border-red-500"
                      : "border-gray-300"
                  } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="mt-1 text-xs text-red-600"
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <Field
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="********"
                  className={`mt-1 block w-full rounded-md border ${
                    touched.confirmPassword && errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="mt-1 text-xs text-red-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-md bg-indigo-600 py-2 px-4 text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Registering…" : "Register"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-medium text-indigo-600 hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;