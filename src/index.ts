import dotenv from "dotenv";

/* ================= ENV CONFIG ================= */
dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import connectDB from "./config/db";

import authRoutes from "./api/routes/auth.route";
import roomRoutes from "./api/routes/room.route";
import bookingRoutes from "./api/routes/booking.route";
import userRoutes from "./api/routes/user.route";
import dashboardRoutes from "./api/routes/dashboard.route";

import { errorMiddleware } from "./middlewares/error.middleware";
import { createDefaultAdmin } from "./utils/createAdmin";

/* ================= GLOBAL TYPE ================= */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

const app = express();

/* ================= PRODUCTION SECURITY ================= */
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
  app.use(morgan("combined"));
}

/* ================= CORS ================= */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

/* ================= BODY PARSER ================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================= HEALTH CHECK ================= */
app.get("/", (_req, res) => {
  res.send("API is running 🚀");
});

/* ================= TEST ROUTE ================= */
app.get("/test", (_req, res) => {
  res.json({ message: "Backend working!" });
});

/* ================= API ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.use(errorMiddleware);

/* ================= SERVER START ================= */
const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
  try {
    await connectDB();

    // Create default admin after DB connection
    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Dashboard API → http://localhost:${PORT}/api/dashboard`);
      console.log(`Environment → ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();

//APPLICATION LAYER
//starts the app