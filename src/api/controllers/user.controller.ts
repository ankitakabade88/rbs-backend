import { Request, Response } from "express";
import mongoose from "mongoose";

import {
  createUser,
  findUsers,
  findUserById,
  updateUserById,
  deleteUserById,
} from "../services/user.service";

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
   CREATE USER (ADMIN CREATES USER WITH TEMP PASSWORD)
===================================================== */

export const createUserController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and temporary password are required",
      });
    }

    const user = await createUser({
      name,
      email,
      password,
      role: "employee",
    });

    res.status(201).json({
      success: true,
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
   GET USERS
===================================================== */

export const getUsers = async (req: Request, res: Response) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const role = req.query.role as string | undefined;

    const filters: any = {};
    if (role) filters.role = role;

    const users = await findUsers(filters, page, limit);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   GET USER BY ID
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   UPDATE USER
===================================================== */

export const updateUser = async (req: Request, res: Response) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const updatedUser = await updateUserById(id, req.body);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   DELETE USER
===================================================== */

export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await deleteUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};