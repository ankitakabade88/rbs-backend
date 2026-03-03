import Booking from "../../models/booking.model";
import Room from "../../models/room.model";
import { SortOrder, Types } from "mongoose";

/* =======================
   DTOs
======================= */
export interface CreateBookingDTO {
  employee: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose?: string;
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

/* ===== TIME → MINUTES ===== */
const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/* =======================
   CONFLICT CHECK
======================= */
const hasBookingConflict = async (
  room: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
) => {
  const bookings = await Booking.find({
    room: new Types.ObjectId(room),
    date,
    ...(excludeBookingId && {
      _id: { $ne: new Types.ObjectId(excludeBookingId) },
    }),
  });

  const newStart = toMinutes(startTime);
  const newEnd = toMinutes(endTime);

  for (const b of bookings) {
    const existingStart = toMinutes(b.startTime);
    const existingEnd = toMinutes(b.endTime);

    const overlap =
      newStart < existingEnd && newEnd > existingStart;

    if (overlap) return true;
  }

  return false;
};

/* =======================
   CREATE BOOKING
======================= */
export const createBookingService = async (
  data: CreateBookingDTO
) => {
  const roomExists = await Room.findById(data.room);
  if (!roomExists) throw new Error("Room does not exist");

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
    throw new Error(
      "Room already booked for the selected time slot"
    );
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
   GET ALL BOOKINGS
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
   GET BOOKING BY ID
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
   UPDATE BOOKING
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

  if (
    role !== "admin" &&
    bookingEmployee.toString() !== userId
  ) {
    throw new Error("Forbidden");
  }

  const updatedRoom = data.room ?? booking.room.toString();
  const updatedDate = normalizeDate(
    data.date ?? booking.date
  );
  const updatedStartTime =
    data.startTime ?? booking.startTime;
  const updatedEndTime =
    data.endTime ?? booking.endTime;

  if (updatedStartTime >= updatedEndTime) {
    throw new Error("End time must be after start time");
  }

  const roomExists = await Room.findById(updatedRoom);
  if (!roomExists) throw new Error("Room does not exist");

  const conflict = await hasBookingConflict(
    updatedRoom,
    updatedDate,
    updatedStartTime,
    updatedEndTime,
    id
  );

  if (conflict) {
    throw new Error(
      "Room already booked for the selected time slot"
    );
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
   DELETE BOOKING
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