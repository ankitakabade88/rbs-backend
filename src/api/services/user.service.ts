import User from "../../models/user.model";
import Booking from "../../models/booking.model";
import bcrypt from "bcrypt";
import { sendInviteEmail } from "../../utils/sendInviteEmail";

/*
CREATE USER (ADMIN SETS TEMP PASSWORD)
ADMIN ONLY
*/
export const createUser = async (data: any) => {

  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  if (!data.role) {
    data.role = "employee";
  }

  if (!data.password) {
    throw new Error("Temporary password is required");
  }

  /* ================= HASH PASSWORD ================= */

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    name: data.name,
    email: data.email,
    role: data.role,

    /* hashed temporary password */
    password: hashedPassword,

    /* user can login immediately */
    isActive: true,

    /* force password change after first login */
    mustChangePassword: true,
  });

  /* ================= SEND EMAIL ================= */

  await sendInviteEmail(
    user.email,
    data.password
  );

  return {
    message:
      "User created successfully. Temporary password sent by email.",
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