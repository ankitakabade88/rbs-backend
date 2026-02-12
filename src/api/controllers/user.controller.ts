import { Request, Response } from "express";
import mongoose from "mongoose";
import jwt, { SignOptions } from "jsonwebtoken";

import {
  createUser,
  findUsers,
  findUserById,
  findUserByEmail,
  updateUserById,
  deleteUserById,
} from "../services/user.service";

import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/jwt";
import UserModel from "../../models/user.model";

// helper function to validate ObjectId format
const isValidObjectId = (id: string) =>
  mongoose.Types.ObjectId.isValid(id);

// 🔐 ADMIN JWT CHECK (ONLY ADDITION)
const ensureAdminJWT = (req: Request, res: Response): boolean => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin JWT token required to access this resource",
    });
    return false;
  }
  return true;
};

// ====================== CREATE USER + JWT ======================
export const createUserController = async (req: Request, res: Response) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const user = await createUser(req.body);

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      JWT_SECRET as string,
      {
        expiresIn: JWT_EXPIRES_IN,
      } as SignOptions
    );

    res.status(201).json({
      success: true,
      token,
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== GET USERS (pagination + filters) ======================
export const getUsers = async (req: Request, res: Response) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
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

// ====================== GET USER BY ID ======================
export const getUserById = async (req: Request, res: Response) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
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

// ====================== GET USER BY EMAIL ======================
export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const { email } = req.params;

    const user = await findUserByEmail(email);

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

// ====================== UPDATE USER (findByIdAndUpdate) ======================
export const updateUser = async (req: Request, res: Response) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Update data cannot be empty",
      });
    }

    const user = await updateUserById(id, req.body);

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
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== UPDATE USER (updateOne) ======================
export const updateUserAlt = async (req: Request, res: Response) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Update body cannot be empty",
      });
    }

    const result = await UserModel.updateOne(
      { _id: id },
      { $set: req.body }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================== DELETE USER ======================
export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!ensureAdminJWT(req, res)) return;

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
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
