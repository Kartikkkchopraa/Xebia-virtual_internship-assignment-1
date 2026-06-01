import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

// Ignore missing mongoose typings in current environment
// @ts-ignore
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const app = express();

const PORT = 5001;

/* ================= MIDDLEWARE ================= */

// Allow frontend requests
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

// Parse JSON body
app.use(express.json());

// Serve uploaded images publicly
app.use("/uploads", express.static("uploads"));

/* ================= DATABASE CONNECTION ================= */

// Connect MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/Xebia")

  .then(() => {
    console.log("Mongo Connected");
  })

  .catch((err: any) => {
    console.log("Mongo Error:", err);
  });

/* ================= ENUM ================= */

// Available user roles
enum UserRole {
  ADMIN = "ADMIN",

  USER = "USER",
}

/* ================= SCHEMA ================= */

// User collection schema
const userSchema = new mongoose.Schema(
  {
    // User full name
    name: {
      type: String,

      required: true,

      trim: true,
    },

    // Unique email
    email: {
      type: String,

      required: true,

      unique: true,

      lowercase: true,
    },

    // Contact number
    contact: {
      type: String,

      required: true,
    },

    // User password
    password: {
      type: String,

      required: true,
    },

    // Uploaded profile image path
    profilePicture: {
      type: String,
    },

    // User role
    role: {
      type: String,

      enum: Object.values(UserRole),

      default: UserRole.USER,
    },

    // Account status
    active: {
      type: Boolean,

      default: true,
    },
  },

  {
    // Automatically create createdAt & updatedAt
    timestamps: true,

    collection: "user",
  },
);

// User model
const User = mongoose.model("User", userSchema);

/* ================= FILE UPLOAD ================= */

// Configure upload location and file naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },

  filename: (req, file, cb) => {
    // Add timestamp to avoid duplicates
    const fileName =
      Date.now() + "-" + file.originalname;

    cb(null, fileName);
  },
});

// Multer middleware
const upload = multer({
  storage,
});

/* ================= REGISTER ================= */

app.post(
  "/api/register",

  // Upload single image
  upload.single("profilePicture"),

  async (req, res) => {
    try {
      const {
        name,
        email,
        contact,
        password,
        role,
      } = req.body;

      // Check duplicate email
      const existing = await User.findOne({
        email: email?.toLowerCase(),
      });

      if (existing) {
        return res.status(400).json({
          success: false,

          message: "Email already exists",
        });
      }

      // Save uploaded image path
      const image =
        req.file
          ? `/uploads/${req.file.filename}`
          : "";

      // Create user
      const user = await User.create({
        name,

        email: email?.toLowerCase(),

        contact,

        password,

        role,

        profilePicture: image,

        active: true,
      });

      return res.status(201).json({
        success: true,

        message: "User created successfully",

        user,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,

        message: "Server Error",
      });
    }
  },
);

/* ================= LOGIN ================= */

app.post(
  "/api/login",

  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({
        email: email.toLowerCase(),
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Verify password
      if (user.password !== password) {
        return res.status(401).json({
          message: "Incorrect password",
        });
      }

      // Restrict login to admin
      if (user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          message: "Only admin can login",
        });
      }

      // Prevent disabled account login
      if (!user.active) {
        return res.status(403).json({
          message: "Account disabled",
        });
      }

      return res.status(200).json({
        success: true,

        message:
          "Admin Login Successful",

        user,
      });

    } catch {
      return res.status(500).json({
        message: "Server Error",
      });
    }
  },
);

/* ================= GET USERS ================= */

app.get(
  "/api/users",

  async (req, res) => {
    try {

      // Pagination
      const page =
        Math.max(
          1,
          Number(req.query.page) || 1,
        );

      const limit =
        Math.max(
          1,
          Number(req.query.limit) || 5,
        );

      const skip =
        (page - 1) * limit;

      // Count users
      const total =
        await User.countDocuments();

      // Fetch paginated users
      const users =
        await User.find()

          .select("-password")

          .sort({
            createdAt: -1,
          })

          .skip(skip)

          .limit(limit);

      return res.json({
        success: true,

        users,

        page,

        limit,

        total,

        totalPages:
          Math.ceil(total / limit),
      });

    } catch {
      return res.status(500).json({
        message:
          "Unable to fetch users",
      });
    }
  },
);

/* ================= TOGGLE ACTIVE STATUS ================= */

app.patch(
  "/api/user/:id",

  async (req, res) => {
    try {

      const user =
        await User.findById(
          req.params.id,
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      // Reverse active status
      user.active =
        !user.active;

      await user.save();

      res.json({
        success: true,

        user,
      });

    } catch {
      res.status(500).json({
        message:
          "Server Error",
      });
    }
  },
);

/* ================= DELETE USER ================= */

app.delete(
  "/api/user/:id",

  async (req, res) => {
    try {

      await User.findByIdAndDelete(
        req.params.id,
      );

      res.json({
        success: true,
      });

    } catch {
      res.status(500).json({
        message:
          "Delete failed",
      });
    }
  },
);

/* ================= UPDATE USER ================= */

app.put(
  "/api/user/:id",

  async (req, res) => {
    try {

      const {
        name,
        email,
      } = req.body;

      // Update selected fields
      const updated =
        await User.findByIdAndUpdate(
          req.params.id,

          {
            name,
            email,
          },

          {
            new: true,
          },
        );

      res.json({
        success: true,

        user: updated,
      });

    } catch {
      res.status(500).json({
        message:
          "Update failed",
      });
    }
  },
);

/* ================= START SERVER ================= */

app.listen(
  PORT,

  () => {
    console.log(
      `Running at http://localhost:${PORT}`,
    );
  },
);