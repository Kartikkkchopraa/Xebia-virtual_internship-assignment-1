import axios from "axios";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { useNavigate } from "react-router-dom";

// Validation schema using Zod
const loginSchema = z.object({
  // Validate email format and normalize input
  email: z.string().trim().toLowerCase().email("Enter valid email"),

  // Password must contain minimum 8 characters
  password: z.string().min(8, "Minimum 8 characters"),
});

// Infer TypeScript type from schema
type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();

  // React Hook Form setup
  const {
    register,

    handleSubmit,

    reset,

    formState: {
      errors, // Validation errors
      isSubmitting, // Tracks form submission state
    },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),

    // Validate while typing
    mode: "onChange",

    // Revalidate on every input change
    reValidateMode: "onChange",
  });

  // Handle login form submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      // Send login request to backend
      const response = await axios.post(
        "http://localhost:5001/api/login",

        data,
      );

      // Store logged-in user in local storage
      localStorage.setItem(
        "user",

        JSON.stringify(response.data.user),
      );

      // Clear form
      reset();

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      // Handle axios-specific errors
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Login Failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6">
      <div className="w-full max-w-105">

        {/* PAGE HEADER */}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-slate-800">
            User Dashboard
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Administrator access only
          </p>
        </div>

        {/* LOGIN CARD */}

        <div className="bg-white border rounded-4xl p-8 shadow-sm">

          {/* Card title */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800">
              Login
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Enter credentials to continue
            </p>
          </div>

          {/* Login form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >

            {/* EMAIL FIELD */}

            <div>
              <label
                className="
block
text-sm
text-slate-600
mb-2
"
              >
                Email
              </label>

              <input
                type="email"
                placeholder="admin@example.com"

                // Connect input to react-hook-form
                {...register("email")}

                // Apply error styles dynamically
                className={`

w-full
border
rounded-2xl
px-4
py-3
text-sm
outline-none
transition

${
  errors.email
    ? "border-red-300 bg-red-50"
    : `
border-slate-200
focus:ring-2
focus:ring-indigo-500
`
}

`}
              />

              {/* Display validation error */}
              {errors.email && (
                <p className="text-xs text-red-500 mt-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD FIELD */}

            <div>
              <label
                className="
block
text-sm
text-slate-600
mb-2
"
              >
                Password
              </label>

              <input
                type="password"

                placeholder="••••••••"

                // Connect password field
                {...register("password")}

                className={`

w-full
border
rounded-2xl
px-4
py-3
text-sm
outline-none
transition

${
  errors.password
    ? "border-red-300 bg-red-50"
    : `
border-slate-200
focus:ring-2
focus:ring-indigo-500
`
}

`}
              />

              {/* Show password validation message */}
              {errors.password && (
                <p className="text-xs text-red-500 mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit button */}

            <button
              disabled={isSubmitting}
              className="
w-full
bg-slate-900
hover:bg-black
text-white
rounded-2xl
py-3
text-sm
font-medium
transition
disabled:opacity-50
"
            >
              {/* Change text during submission */}
              {isSubmitting
                ? "Signing In..."
                : "Sign In"}
            </button>
          </form>

          {/* Registration link */}

          <div className="mt-8 pt-6 border-t">
            <button
              onClick={() => navigate("/register")}
              className="
text-sm
text-indigo-600
hover:text-indigo-700
"
            >
              Create account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}