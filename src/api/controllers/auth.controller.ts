import { Request, Response } from "express";
import { loginService } from "../services/auth.service";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const data = await loginService(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error: any) {
    console.error("LOGIN ERROR:", error.message);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


 //It receives login credentials
 //verifies them → returns a token + user info