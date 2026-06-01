import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { UserRole } from "./types/user";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Minimum 3 characters")
    .max(50, "Maximum 50 characters")
    .regex(/^[A-Za-z ]+$/, "Only alphabets allowed"),

  email: z.string().trim().toLowerCase().email("Enter valid email"),

  contact: z.string().regex(/^[6-9]\d{9}$/, "Enter valid Indian number"),

  profilePicture: z
    .instanceof(FileList)

    .refine(
      (files) => files.length === 1,

      "Image required",
    )

    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE,

      "Max 5MB allowed",
    )

    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),

      "Only PNG JPG WEBP",
    ),

  password: z
    .string()

    .min(8, "Minimum 8 characters")

    .regex(/[A-Z]/, "Uppercase required")

    .regex(/[a-z]/, "Lowercase required")

    .regex(/\d/, "Number required")

    .regex(/[!@#$%^&*]/, "Special character required"),

  role: z.nativeEnum(UserRole),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();

  const {
    register,

    handleSubmit,

    reset,

    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),

    mode: "onChange",

    defaultValues: {
      role: UserRole.USER,
    },
  });

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      Object.entries(data)

        .forEach(([key, value]) => {
          if (key === "profilePicture") {
            formData.append(
              key,

              value[0],
            );
          } else {
            formData.append(key, String(value));
          }
        });

      await axios.post(
        "http://localhost:5001/api/register",

        formData,
      );

      reset();

      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Registration Failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-205">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-slate-800">
            Create Account
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Register to access the platform
          </p>
        </div>

        <div className="bg-white border rounded-4xl p-8 shadow-sm">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="
grid
grid-cols-2
gap-5
"
          >
            {/* NAME */}
            <div>
              <label className="text-sm text-slate-600">Full Name</label>

              <input
                {...register("name")}
                placeholder="your name"
                className="
w-full
mt-2
border
rounded-2xl
px-4
py-3
text-sm
border-slate-200
"
              />

              <p className="text-xs text-red-500 mt-2">
                {errors.name?.message}
              </p>
            </div>
            {/* EMAIL */}
            <div>
              <label className="text-sm text-slate-600">Email</label>

              <input
                type="email"
                {...register("email")}
                placeholder="email@gmail.com"
                className="
w-full
mt-2
border
rounded-2xl
px-4
py-3
text-sm
border-slate-200
"
              />

              <p className="text-xs text-red-500 mt-2">
                {errors.email?.message}
              </p>
            </div>
            {/* CONTACT */}
            <div>
              <label className="text-sm text-slate-600">Contact</label>

              <input
                {...register("contact")}
                placeholder="1234567890"
                className="
w-full
mt-2
border
rounded-2xl
px-4
py-3
text-sm
border-slate-200
"
              />

              <p className="text-xs text-red-500 mt-2">
                {errors.contact?.message}
              </p>
            </div>
            {/* ROLE */}
            <div>
              <label className="text-sm text-slate-600">Role</label>

              <select
                {...register("role")}
                className="
w-full
mt-2
border
rounded-2xl
px-4
py-3
text-sm
border-slate-200
"
              >
                <option value="USER">User</option>

                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {/* PASSWORD */}
            <div className="col-span-2">
              <label className="text-sm text-slate-600">Password</label>

              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="
w-full
mt-2
border
rounded-2xl
px-4
py-3
text-sm
border-slate-200
"
              />

              <p className="text-xs text-red-500 mt-2">
                {errors.password?.message}
              </p>
            </div>
            {/* UPLOAD */}
            {/* PROFILE PICTURE */}{" "}
            <div className="col-span-2">
              {" "}
              <label className=" text-sm text-slate-600 block mb-2 ">
                {" "}
                Profile Picture{" "}
              </label>{" "}
              <label className=" flex items-center justify-between border border-slate-200 rounded-2xl px-4 py-3 cursor-pointer hover:border-indigo-400 transition ">
                {" "}
                <div className="flex items-center gap-3">
                  {" "}
                  <div className=" w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center ">
                    {" "}
                    🖼️{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <p className="text-sm text-slate-700">
                      {" "}
                      Choose Image{" "}
                    </p>{" "}
                    <p className="text-xs text-slate-400">
                      {" "}
                      PNG • JPG • WEBP{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <span className=" text-xs text-indigo-600 font-medium ">
                  {" "}
                  Browse{" "}
                </span>{" "}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register("profilePicture")}
                />{" "}
              </label>{" "}
              <p className="text-xs text-red-500 mt-2">
                {" "}
                {errors.profilePicture?.message}{" "}
              </p>{" "}
            </div>
            {/* BUTTON */}
            <div className="col-span-2">
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
"
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t text-center">
            <button
              onClick={() => navigate("/login")}
              className="
text-sm
text-indigo-600
"
            >
              Already have an account?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
