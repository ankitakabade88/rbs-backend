import Room from "../../models/room.model";
import Booking from "../../models/booking.model";
import { SortOrder } from "mongoose";

/*
CREATE ROOM
*/
export const createRoomService = async (data: any) => {
  const existingRoom = await Room.findOne({ name: data.name });

  if (existingRoom) {
    throw new Error("Room with this name already exists");
  }

  return Room.create(data);
};

/*
GET ROOMS (PAGINATION + SORT)
*/
export const getRoomsService = async (
  page: number,
  limit: number,
  sort: Record<string, SortOrder>
) => {
  const skip = (page - 1) * limit;

  const rooms = await Room.find()
    // ✅ IMPORTANT FIX — include availability
    .select(
      "name location capacity type isAvailable createdAt"
    )
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Room.countDocuments();

  return {
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    data: rooms,
  };
};

/*
GET ROOM BY ID
*/
export const getRoomByIdService = async (id: string) => {
  return Room.findById(id).select(
    "name location capacity type isAvailable createdAt"
  );
};

/*
UPDATE ROOM
*/
export const updateRoomService = async (id: string, data: any) => {
  return Room.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );
};

/*
DELETE ROOM
(Block if bookings exist)
*/
export const deleteRoomService = async (id: string) => {
  const bookingCount = await Booking.countDocuments({ room: id });

  if (bookingCount > 0) {
    throw new Error(
      "Cannot delete room with active bookings"
    );
  }

  return Room.findByIdAndDelete(id);
};
