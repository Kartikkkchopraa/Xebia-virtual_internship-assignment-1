import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter valid email"),

  password: z.string().min(8, "Minimum 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();

  const {
    register,

    handleSubmit,

    reset,

    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),

    mode: "onChange",

    reValidateMode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await axios.post(
        "http://localhost:5001/api/login",

        data,
      );

      localStorage.setItem(
        "user",

        JSON.stringify(response.data.user),
      );

      reset();

      navigate("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Login Failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6">
      <div className="w-full max-w-[420px]">
        {/* HEADER */}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-slate-800">
            User Dashboard
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Administrator access only
          </p>
        </div>

        {/* CARD */}

        <div className="bg-white border rounded-[32px] p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800">Login</h2>

            <p className="text-sm text-slate-500 mt-1">
              Enter credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* EMAIL */}

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
                {...register("email")}
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

              {errors.email && (
                <p className="text-xs text-red-500 mt-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}

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

              {errors.password && (
                <p className="text-xs text-red-500 mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

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
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

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
