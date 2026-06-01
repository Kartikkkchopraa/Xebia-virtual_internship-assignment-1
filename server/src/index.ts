import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
// @ts-ignore: ignore missing type declarations for mongoose in this environment
import mongoose from "mongoose";

dotenv.config();

const app = express();

const PORT = 5001;

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/uploads", express.static("uploads"));

mongoose
  .connect("mongodb://127.0.0.1:27017/Xebia")
  .then(() => {
    console.log("Mongo Connected");
  })
  .catch((err: any) => {
    console.log("Mongo Error:", err);
  });

enum UserRole {
  ADMIN = "ADMIN",

  USER = "USER",
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,

      required: true,

      trim: true,
    },

    email: {
      type: String,

      required: true,

      unique: true,

      lowercase: true,
    },

    contact: {
      type: String,

      required: true,
    },

    password: {
      type: String,

      required: true,
    },

    profilePicture: {
      type: String,
    },

    role: {
      type: String,

      enum: Object.values(UserRole),

      default: UserRole.USER,
    },

    active: {
      type: Boolean,

      default: true,
    },
  },

  {
    timestamps: true,

    collection: "user",
  },
);

const User = mongoose.model("User", userSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },

  filename: (req, file, cb) => {
    const fileName = Date.now() + "-" + file.originalname;

    cb(null, fileName);
  },
});

const upload = multer({
  storage,
});

app.post(
  "/api/register",

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

      const existing = await User.findOne({
        email: email?.toLowerCase(),
      });

      if (existing) {
        return res.status(400).json({
          success: false,

          message: "Email already exists",
        });
      }

      const image = req.file ? `/uploads/${req.file.filename}` : "";

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

app.post(
  "/api/login",

  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user

      const user = await User.findOne({
        email: email.toLowerCase(),
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Check password

      if (user.password !== password) {
        return res.status(401).json({
          message: "Incorrect password",
        });
      }

      // Only ADMIN allowed

      if (user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          message: "Only admin can login",
        });
      }

      // Optional:
      // Prevent inactive admin

      if (!user.active) {
        return res.status(403).json({
          message: "Account disabled",
        });
      }

      return res.status(200).json({
        success: true,

        message: "Admin Login Successful",

        user,
      });
    } catch {
      return res.status(500).json({
        message: "Server Error",
      });
    }
  },
);

app.get(
  "/api/users",

  async (req, res) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);

      const limit = Math.max(1, Number(req.query.limit) || 5);

      const skip = (page - 1) * limit;

      const total = await User.countDocuments();

      const users = await User.find()

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

        totalPages: Math.ceil(total / limit),
      });
    } catch {
      return res.status(500).json({
        message: "Unable to fetch users",
      });
    }
  },
);

app.patch(
  "/api/user/:id",

  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      user.active = !user.active;

      await user.save();

      res.json({
        success: true,

        user,
      });
    } catch {
      res.status(500).json({
        message: "Server Error",
      });
    }
  },
);

// DELETE

app.delete(
  "/api/user/:id",

  async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
      });
    } catch {
      res.status(500).json({
        message: "Delete failed",
      });
    }
  },
);

app.put(
  "/api/user/:id",

  async (req, res) => {
    try {
      const { name, email } = req.body;

      const updated = await User.findByIdAndUpdate(
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
        message: "Update failed",
      });
    }
  },
);

app.listen(
  PORT,

  () => {
    console.log(`Running at http://localhost:${PORT}`);
  },
);
