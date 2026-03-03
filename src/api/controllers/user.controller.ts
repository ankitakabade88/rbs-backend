import { Request, Response } from "express";
import mongoose from "mongoose";
import crypto from "crypto";

import {
  createUser,
  findUsers,
  findUserById,
  findUserByEmail,
  updateUserById,
  deleteUserById,
} from "../services/user.service";

import UserModel from "../../models/user.model";

/* ================= HELPERS ================= */

const isValidObjectId = (id: string) =>
  mongoose.Types.ObjectId.isValid(id);

const ensureAdminJWT = (req: Request, res: Response): boolean => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin JWT token required",
    });
    return false;
  }
  return true;
};

/* =====================================================
   CREATE USER (ADMIN INVITE FLOW)
===================================================== */

export const createUserController = async (req: Request, res: Response) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const { name, email, role } = req.body;

    const inviteToken = crypto.randomBytes(32).toString("hex");

    const user = await createUser({
      name,
      email,
      role,
      password: null,
      isActive: false,
      resetToken: inviteToken,
      resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
    });

    const inviteLink =
      `http://localhost:5173/set-password?token=${inviteToken}`;

    res.status(201).json({
      success: true,
      message: "User invited successfully",
      inviteLink,
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   SET PASSWORD (ACCOUNT ACTIVATION)
===================================================== */

export const setPasswordController = async (
  req: Request,
  res: Response
) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password required",
      });
    }

    const user = await UserModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired invite link",
      });
    }

    // ✅ DO NOT HASH HERE (schema already hashes)
    user.password = password;

    // activate account
    user.isActive = true;

    // remove invite token
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Account activated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   GET USERS
===================================================== */

export const getUsers = async (req: Request, res: Response) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit);
    const role = req.query.role as string | undefined;

    const filters: any = {};
    if (role) filters.role = role;

    const users = await findUsers(filters, page, limit);

    res.status(200).json({
      success: true,
      data: users, // includes isActive
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   OTHER CONTROLLERS (UNCHANGED)
===================================================== */

export const getUserById = async (req: Request, res: Response) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await findUserById(id);

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const user = await deleteUserById(req.params.id);

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};