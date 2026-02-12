import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

/*
Global Error Handling Middleware
 */
export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response) => {
  // Express Validator Errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({                           //validation error
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  //Mongoose Validation Error

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Database validation error",
      errors: Object.values(err.errors).map((e: any) => e.message),
    });
  }

  // Mongoose Cast Error (Invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.value}`,
    });
  }

  //JWT Errors

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
  // Custom Application Errors (from services)

  if (err.message) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }

  // Fallback (Unknown Error)
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
