import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 ERROR:", err);

  /* ================= VALIDATION ERRORS ================= */
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  /* ================= MONGOOSE VALIDATION ================= */
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Database validation error",
      errors: Object.values(err.errors).map((e: any) => e.message),
    });
  }

  /* ================= INVALID OBJECT ID ================= */
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.value}`,
    });
  }

  /* ================= JWT ERRORS ================= */
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  /* ================= CUSTOM APP ERRORS ================= */
  if (err.message) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }

  /* ================= FALLBACK ================= */
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};