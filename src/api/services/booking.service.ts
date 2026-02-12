import Booking from "../../models/booking.model";
import Room from "../../models/room.model";
import { SortOrder, Types } from "mongoose";

/* =======================
   DTOs
======================= */
export interface CreateBookingDTO {
  employee: string;
  room: string;
  date: string | Date;
  startTime: string;
  endTime: string;
}

export interface UpdateBookingDTO {
  room?: string;
  date?: string | Date;
  startTime?: string;
  endTime?: string;
}

/* =======================
   Helpers
======================= */
const normalizeDate = (date: string | Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const assertDefined = <T>(
  value: T | null | undefined,
  name: string
): T => {
  if (value === null || value === undefined) {
    throw new Error(`${name} is missing`);
  }
  return value;
};

const hasBookingConflict = async (
  room: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
) => {
  const query: any = {
    room: new Types.ObjectId(room),
    date,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  if (excludeBookingId) {
    query._id = { $ne: new Types.ObjectId(excludeBookingId) };
  }

  return Booking.findOne(query);
};

/* =======================
   CREATE BOOKING
======================= */
export const createBookingService = async (data: CreateBookingDTO) => {
  const roomExists = await Room.findById(data.room);
  if (!roomExists) {
    throw new Error("Room does not exist");
  }

  if (data.startTime >= data.endTime) {
    throw new Error("End time must be after start time");
  }

  const bookingDate = normalizeDate(data.date);

  const conflict = await hasBookingConflict(
    data.room,
    bookingDate,
    data.startTime,
    data.endTime
  );

  if (conflict) {
    throw new Error("Room is already booked for the selected time slot");
  }

  const booking = await Booking.create({
    employee: new Types.ObjectId(data.employee),
    room: new Types.ObjectId(data.room),
    date: bookingDate,
    startTime: data.startTime,
    endTime: data.endTime,
  });

  return booking.populate([
    { path: "employee", select: "name email" },
    { path: "room", select: "name location" },
  ]);
};

/* =======================
   GET ALL BOOKINGS (ADMIN)
======================= */
export const getBookingsService = async (
  page: number,
  limit: number,
  sort: Record<string, SortOrder>
) => {
  const skip = (page - 1) * limit;

  const bookings = await Booking.find()
    .populate("employee", "name email")
    .populate("room", "name location")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalRecords = await Booking.countDocuments();

  return {
    totalRecords,
    currentPage: page,
    totalPages: Math.ceil(totalRecords / limit),
    data: bookings,
  };
};

/* =======================
   GET BOOKING BY ID (OWNER)
======================= */
export const getBookingByIdService = async (
  id: string,
  userId: string,
  role?: string
) => {
  const booking = await Booking.findById(id);
  if (!booking) return null;

  const bookingEmployee = assertDefined(
    booking.employee,
    "Booking employee"
  );

  if (
    role !== "admin" &&
    bookingEmployee.toString() !== userId
  ) {
    throw new Error("Forbidden");
  }

  return booking.populate([
    { path: "employee", select: "name email" },
    { path: "room", select: "name location" },
  ]);
};

/* =======================
   UPDATE BOOKING (OWNER)
======================= */
export const updateBookingService = async (
  id: string,
  data: UpdateBookingDTO,
  userId: string,
  role?: string
) => {
  const booking = await Booking.findById(id);
  if (!booking) return null;

  const bookingEmployee = assertDefined(
    booking.employee,
    "Booking employee"
  );
  const bookingRoom = assertDefined(booking.room, "Booking room");
  const bookingDate = assertDefined(booking.date, "Booking date");
  const bookingStartTime = assertDefined(
    booking.startTime,
    "Booking startTime"
  );
  const bookingEndTime = assertDefined(
    booking.endTime,
    "Booking endTime"
  );

  if (
    role !== "admin" &&
    bookingEmployee.toString() !== userId
  ) {
    throw new Error("Forbidden");
  }

  const updatedRoom = data.room ?? bookingRoom.toString();
  const updatedDate = normalizeDate(data.date ?? bookingDate);
  const updatedStartTime = data.startTime ?? bookingStartTime;
  const updatedEndTime = data.endTime ?? bookingEndTime;

  if (updatedStartTime >= updatedEndTime) {
    throw new Error("End time must be after start time");
  }

  const roomExists = await Room.findById(updatedRoom);
  if (!roomExists) {
    throw new Error("Room does not exist");
  }

  const conflict = await hasBookingConflict(
    updatedRoom,
    updatedDate,
    updatedStartTime,
    updatedEndTime,
    id
  );

  if (conflict) {
    throw new Error("Room is already booked for the selected time slot");
  }

  return Booking.findByIdAndUpdate(
    id,
    {
      $set: {
        room: new Types.ObjectId(updatedRoom),
        date: updatedDate,
        startTime: updatedStartTime,
        endTime: updatedEndTime,
      },
    },
    { new: true, runValidators: true }
  )
    .populate("employee", "name email")
    .populate("room", "name location");
};

/* =======================
   DELETE BOOKING (OWNER)
======================= */
export const deleteBookingService = async (
  id: string,
  userId: string,
  role?: string
) => {
  const booking = await Booking.findById(id);
  if (!booking) return null;

  const bookingEmployee = assertDefined(
    booking.employee,
    "Booking employee"
  );

  if (
    role !== "admin" &&
    bookingEmployee.toString() !== userId
  ) {
    throw new Error("Forbidden");
  }

  await booking.deleteOne();
  return booking;
};
