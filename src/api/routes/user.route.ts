import { Router } from "express";
import {
  createUserController,
  getUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminOnly } from "../../middlewares/admin.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createUserValidation } from "../validations/user.validation";

const router = Router();

/**
 * ADMIN ONLY – CREATE USER
 */
router.post(
  "/",
  authMiddleware,
  adminOnly,
  createUserValidation,
  validate,
  createUserController
);

/**
 * ADMIN ONLY – GET ALL USERS (pagination + filters)
 */
router.get(
  "/",
  authMiddleware,
  adminOnly,
  getUsers
);

/**
 *ADMIN ONLY – GET USER BY EMAIL
 * (IMPORTANT: keep this ABOVE :id)
 */
router.get(
  "/email/:email",
  authMiddleware,
  adminOnly,
  getUserByEmail
);

/**
 * 🔐 ADMIN ONLY – GET USER BY ID
 */
router.get(
  "/:id",
  authMiddleware,
  adminOnly,
  getUserById
);

/**
 * 🔐 ADMIN ONLY – UPDATE USER
 */
router.put(
  "/:id",
  authMiddleware,
  adminOnly,
  updateUser
);

/*ADMIN ONLY – DELETE USER
 */
router.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  deleteUser
);

export default router;
