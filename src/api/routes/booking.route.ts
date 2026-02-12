import { Router } from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} from "../controllers/booking.controller";

import {
  createBookingValidation,
  updateBookingValidation,
  deleteBookingValidation,
} from "../validations/booking.validation";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminOnly } from "../../middlewares/admin.middleware";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

/*
CREATE BOOKING
User + Admin
*/
router.post(
  "/",
  authMiddleware,
  createBookingValidation,
  validate,
  createBooking
);

/*
GET ALL BOOKINGS
Admin only
*/
router.get(
  "/",
  authMiddleware,
  adminOnly,
  getBookings
);

/*
GET BOOKING BY ID
User (owner) + Admin
(Service enforces ownership)
*/
router.get(
  "/:id",
  authMiddleware,
  getBookingById
);

/*
UPDATE BOOKING
User (owner) + Admin
(Service enforces ownership)
*/
router.put(
  "/:id",
  authMiddleware,
  updateBookingValidation,
  validate,
  updateBooking
);

/*
DELETE BOOKING
User (owner) + Admin
(Service enforces ownership)
*/
router.delete(
  "/:id",
  authMiddleware,
  deleteBookingValidation,
  validate,
  deleteBooking
);

export default router;
