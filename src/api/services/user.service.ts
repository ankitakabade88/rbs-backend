import User from "../../models/user.model";
import Booking from "../../models/booking.model";
import crypto from "crypto";
import { sendInviteEmail } from "../../utils/sendInviteEmail";

/*
CREATE USER (INVITE FLOW)
ADMIN ONLY
*/
export const createUser = async (data: any) => {
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  // safety default
  if (!data.role) {
    data.role = "employee";
  }

  /* ===== GENERATE INVITE TOKEN ===== */
  const inviteToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    name: data.name,
    email: data.email,
    role: data.role,
    password: null,
    isActive: false,
    inviteToken,
    inviteTokenExpiry: new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ),
  });

  /* ===== CREATE INVITE LINK ===== */
  const inviteLink = `${process.env.FRONTEND_URL}/set-password?token=${inviteToken}`;

  /* ===== SEND EMAIL ===== */
  await sendInviteEmail(user.email, inviteLink);

  return {
    message: "User invited successfully",
    inviteLink, // optional (for testing)
  };
};

/*
GET USERS (PAGINATION + FILTERS)
*/
export const findUsers = async (
  filters: any,
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;

  const users = await User.find(filters)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filters);

  return {
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    data: users,
  };
};

/*
GET USER BY ID
*/
export const findUserById = async (id: string) => {
  return User.findById(id).select("-password");
};

/*
GET USER BY EMAIL
*/
export const findUserByEmail = async (email: string) => {
  return User.findOne({ email }).select("-password");
};

/*
UPDATE USER
*/
export const updateUserById = async (id: string, data: any) => {
  if (data.email) {
    const existingUser = await User.findOne({
      email: data.email,
      _id: { $ne: id },
    });

    if (existingUser) {
      throw new Error("Email already exists");
    }
  }

  return User.findByIdAndUpdate(
    id,
    { $set: data },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");
};

/*
DELETE USER
*/
export const deleteUserById = async (id: string) => {
  await Booking.deleteMany({ employee: id });
  return User.findByIdAndDelete(id);
};