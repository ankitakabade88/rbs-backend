import { Request, Response } from "express";
import {
  loginService,
  setPasswordService,
  changePasswordService
} from "../services/auth.service";

/* =====================================================
LOGIN
===================================================== */
export const login = async (req: Request, res: Response) => {

  try {

    const { email, password } = req.body;

    const data = await loginService(email, password);

    /* SET AUTH COOKIES */

    res.cookie("token", data.token, {
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24
    });

    res.cookie("role", data.user.role, {
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      ...data
    });

  } catch (error: any) {

    console.error("LOGIN ERROR:", error.message);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

/* =====================================================
SET PASSWORD
===================================================== */
export const setPassword = async (
  req: Request,
  res: Response
) => {

  try {

    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password required"
      });
    }

    const data = await setPasswordService(
      token,
      password
    );

    res.status(200).json({
      success: true,
      message: "Account activated",
      ...data
    });

  } catch (error: any) {

    console.error("SET PASSWORD ERROR:", error.message);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

/* =====================================================
CHANGE PASSWORD
===================================================== */
export const changePassword = async (
  req: Request,
  res: Response
) => {

  try {

    const userId = (req as any).user?.id;

    const { currentPassword, newPassword } = req.body;

    const data = await changePasswordService(
      userId,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      success: true,
      ...data
    });

  } catch (error: any) {

    console.error("CHANGE PASSWORD ERROR:", error.message);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};
 //It receives login credentials
 //verifies them → returns a token + user info