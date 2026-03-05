import { Router } from "express";

import {
  createUserController,
  getUsers,
  getUserById,
  deleteUser,
} from "../controllers/user.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminOnly } from "../../middlewares/admin.middleware";

const router = Router();

/* ================= ADMIN CREATE USER ================= */

router.post("/", authMiddleware, adminOnly, createUserController);

/* ================= GET USERS ================= */

router.get("/", authMiddleware, adminOnly, getUsers);

/* ================= GET USER BY ID ================= */

router.get("/:id", authMiddleware, adminOnly, getUserById);

/* ================= DELETE USER ================= */

router.delete("/:id", authMiddleware, adminOnly, deleteUser);

export default router;