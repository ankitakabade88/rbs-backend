import { Router } from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookedSlots,
  checkRoomAvailability, // ✅ NEW
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
=====================================================
CHECK ROOM AVAILABILITY (LIVE STATUS)
IMPORTANT: must be ABOVE "/:id"
=====================================================
*/
router.post(
  "/check-availability",
  authMiddleware,
  checkRoomAvailability
);

/*
=====================================================
GET BOOKED TIME SLOTS
=====================================================
*/
router.get(
  "/slots",
  authMiddleware,
  getBookedSlots
);

/*
=====================================================
CREATE BOOKING
User + Admin
=====================================================
*/
router.post(
  "/",
  authMiddleware,
  createBookingValidation,
  validate,
  createBooking
);

/*
=====================================================
GET ALL BOOKINGS (ADMIN)
=====================================================
*/
router.get(
  "/",
  authMiddleware,
  adminOnly,
  getBookings
);

/*
=====================================================
GET BOOKING BY ID
=====================================================
*/
router.get(
  "/:id",
  authMiddleware,
  getBookingById
);

/*
=====================================================
UPDATE BOOKING
=====================================================
*/
router.put(
  "/:id",
  authMiddleware,
  updateBookingValidation,
  validate,
  updateBooking
);

/*
=====================================================
DELETE BOOKING
=====================================================
*/
router.delete(
  "/:id",
  authMiddleware,
  deleteBookingValidation,
  validate,
  deleteBooking
);

export default router;