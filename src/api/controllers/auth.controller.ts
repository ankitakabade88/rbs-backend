import { Request, Response } from "express";
import {
  loginService,
  setPasswordService,
} from "../services/auth.service";

/* =====================================================
   LOGIN CONTROLLER
===================================================== */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const data = await loginService(email, password);

    /*
      EXPECTED data FORMAT:
      {
        token: string,
        user: { role: "admin" | "employee", ... }
      }
    */

    /* ================= SET AUTH COOKIES ================= */

    res.cookie("token", data.token, {
      httpOnly: false,      // middleware must read it
      sameSite: "lax",
      secure: false,        // true in production (HTTPS)
      path: "/",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    res.cookie("role", data.user.role, {
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24,
    });

    /* ================= RESPONSE ================= */

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

/* =====================================================
   SET PASSWORD (INVITE ACTIVATION)
===================================================== */
export const setPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { token, password } = req.body;

    /* ===== BASIC VALIDATION ===== */
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const data = await setPasswordService(
      token,
      password
    );

    res.status(200).json({
      success: true,
      message: "Account activated successfully",
      data,
    });
  } catch (error: any) {
    console.error("SET PASSWORD ERROR:", error.message);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
 //It receives login credentials
 //verifies them → returns a token + user info