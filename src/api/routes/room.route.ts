import { Router } from "express";
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from "../controllers/room.controller";

import {
  createRoomValidation,
  updateRoomValidation,
  deleteRoomValidation,
} from "../validations/room.validation";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminOnly } from "../../middlewares/admin.middleware";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();
/**
 * CREATE ROOM (ADMIN ONLY)
 */
router.post(
  "/",
  authMiddleware,
  adminOnly,
  createRoomValidation,
  validate,
  createRoom
);

/**
 * GET ALL ROOMS (ADMIN + USER)
 */
router.get(
  "/",
  authMiddleware,
  getRooms
);

/**
 * GET ROOM BY ID (ADMIN + USER)
 */
router.get(
  "/:id",
  authMiddleware,
  getRoomById
);

/**
 * UPDATE ROOM (ADMIN ONLY)
 */
router.put(
  "/:id",
  authMiddleware,
  adminOnly,
  updateRoomValidation,
  validate,
  updateRoom
);

/**
 * DELETE ROOM (ADMIN)
 */
router.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  deleteRoomValidation,
  validate,
  deleteRoom
);

export default router;
