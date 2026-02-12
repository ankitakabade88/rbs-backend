import { Request, Response } from "express";
import {
  createBookingService,
  getBookingsService,
  getBookingByIdService,
  updateBookingService,
  deleteBookingService,
} from "../services/booking.service";
import { assertAuthenticated } from "../../utils/assertAuth";

/* =======================
   CREATE BOOKING
======================= */
export const createBooking = async (
  req: Request,
  res: Response
) => {
  try {
    assertAuthenticated(req);

    const booking = await createBookingService({
      ...req.body,
      employee: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =======================
   GET ALL BOOKINGS (ADMIN)
======================= */
export const getBookings = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const result = await getBookingsService(page, limit, {
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =======================
   GET BOOKING BY ID
======================= */
export const getBookingById = async (
  req: Request,
  res: Response
) => {
  try {
    assertAuthenticated(req);

    const booking = await getBookingByIdService(
      req.params.id,
      req.user.id,
      req.user.role
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    res.status(
      error.message === "Forbidden" ? 403 : 401
    ).json({
      success: false,
      message: error.message,
    });
  }
};

/* =======================
   UPDATE BOOKING
======================= */
export const updateBooking = async (
  req: Request,
  res: Response
) => {
  try {
    assertAuthenticated(req);

    const booking = await updateBookingService(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    res.status(
      error.message === "Forbidden" ? 403 : 400
    ).json({
      success: false,
      message: error.message,
    });
  }
};

/* =======================
   DELETE BOOKING
======================= */
export const deleteBooking = async (
  req: Request,
  res: Response
) => {
  try {
    assertAuthenticated(req);

    const booking = await deleteBookingService(
      req.params.id,
      req.user.id,
      req.user.role
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error: any) {
    res.status(
      error.message === "Forbidden" ? 403 : 400
    ).json({
      success: false,
      message: error.message,
    });
  }
};
