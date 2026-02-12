import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db";

import authRoutes from "./api/routes/auth.route";
import roomRoutes from "./api/routes/room.route";
import bookingRoutes from "./api/routes/booking.route";
import userRoutes from "./api/routes/user.route";

import { errorMiddleware } from "./middlewares/error.middleware";
import { createDefaultAdmin } from "./utils/createAdmin";



// GLOBAL TYPE
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

app.use(cors({ origin: "*" }));
// MIDDLEWARE
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);

// ERROR HANDLER
app.use(errorMiddleware);

const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
  await connectDB();
  await createDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();

//APPLICATION LAYER
//starts the app