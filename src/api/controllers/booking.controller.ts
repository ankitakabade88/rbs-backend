import { Request, Response } from "express";
import Booking from "../../models/booking.model";
import {
  createBookingService,
  getBookingsService,
  getBookingByIdService,
  updateBookingService,
  deleteBookingService,
} from "../services/booking.service";
import { assertAuthenticated } from "../../utils/assertAuth";

/* =====================================================
   VALIDATION HELPERS
===================================================== */

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const validateBookingRules = (
  date?: string,
  startTime?: string,
  endTime?: string
) => {
  if (!date || !startTime || !endTime) return;

  const bookingDate = new Date(date);

  if (isNaN(bookingDate.getTime())) {
    throw new Error("Invalid booking date");
  }

  /* ===== BLOCK WEEKENDS ===== */
  const day = bookingDate.getDay();
  if (day === 0 || day === 6) {
    throw new Error(
      "Bookings are not allowed on Saturdays and Sundays"
    );
  }

  /* ===== WORKING HOURS ===== */
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  const MIN = 8 * 60;
  const MAX = 19 * 60;

  if (start < MIN || end > MAX) {
    throw new Error(
      "Bookings allowed only between 8 AM and 7 PM"
    );
  }

  if (start >= end) {
    throw new Error("End time must be after start time");
  }
};

/* ================= CREATE ================= */
export const createBooking = async (req: Request, res: Response) => {
  try {
    assertAuthenticated(req);

    const { room, date, startTime, endTime, purpose } = req.body;

    validateBookingRules(date, startTime, endTime);

    /* ✅ ONLY NECESSARY FIX — SANITIZE INPUT */
    const booking = await createBookingService({
      employee: req.user!.id,
      room: String(room).trim(),
      date,
      startTime,
      endTime,
      purpose: purpose ? String(purpose).trim() : "",
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Booking creation failed",
    });
  }
};

/* ================= GET ALL ================= */
export const getBookings = async (req: Request, res: Response) => {
  try {
    if (req.query.all === "true") {
      const bookings = await Booking.find()
        .populate("room")
        .populate("employee")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: bookings,
      });
    }

    /**
     * Default → paginated response
     */
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getBookingsService(
      page,
      limit,
      { createdAt: -1 }
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch bookings",
    });
  }
};

/* ================= GET BY ID ================= */
export const getBookingById = async (req: Request, res: Response) => {
  try {
    assertAuthenticated(req);

    const booking = await getBookingByIdService(
      req.params.id,
      req.user!.id,
      req.user!.role
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
    res
      .status(error.message === "Forbidden" ? 403 : 401)
      .json({
        success: false,
        message: error.message,
      });
  }
};

/* ================= UPDATE ================= */
export const updateBooking = async (req: Request, res: Response) => {
  try {
    assertAuthenticated(req);

    const { date, startTime, endTime } = req.body;

    validateBookingRules(date, startTime, endTime);

    const booking = await updateBookingService(
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.role
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
    res
      .status(error.message === "Forbidden" ? 403 : 400)
      .json({
        success: false,
        message: error.message,
      });
  }
};

/* ================= DELETE ================= */
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    assertAuthenticated(req);

    const booking = await deleteBookingService(
      req.params.id,
      req.user!.id,
      req.user!.role
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
    res
      .status(error.message === "Forbidden" ? 403 : 400)
      .json({
        success: false,
        message: error.message,
      });
  }
};

/* =====================================================
   GET BOOKED TIME SLOTS
===================================================== */
export const getBookedSlots = async (req: Request, res: Response) => {
  try {
    assertAuthenticated(req);

    const { room, date } = req.query;

    if (!room || !date) {
      return res.status(400).json({
        success: false,
        message: "Room and date are required",
      });
    }

    const bookingDate = new Date(date as string);
    bookingDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const bookings = await Booking.find({
      room,
      date: { $gte: bookingDate, $lt: nextDay },
    }).select("startTime endTime");

    res.status(200).json({
      success: true,
      slots: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load slots",
    });
  }
};

/* =====================================================
   LIVE ROOM AVAILABILITY CHECK
===================================================== */
export const checkRoomAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    assertAuthenticated(req);

    const { room, date, startTime, endTime } = req.body;

    if (!room || !date || !startTime || !endTime) {
      return res.status(400).json({
        available: false,
        message: "Missing booking details",
      });
    }

    validateBookingRules(date, startTime, endTime);

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const conflict = await Booking.findOne({
      room,
      date: { $gte: bookingDate, $lt: nextDay },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflict) {
      return res.status(200).json({
        available: false,
        status: "busy",
        message: "Room already booked for this time slot",
      });
    }

    return res.status(200).json({
      available: true,
      status: "available",
      message: "Room available",
    });
  } catch (error: any) {
    return res.status(200).json({
      available: false,
      status: "blocked",
      message: error.message || "Room unavailable",
    });
  }
};