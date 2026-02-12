import User from "../../models/user.model";
import Booking from "../../models/booking.model";

/*
CREATE USER (PREVENT DUPLICATE EMAIL)
ADMIN ONLY (enforced at controller/route level)
*/
export const createUser = async (data: any) => {
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Default role safety (if not provided)
  if (!data.role) {
    data.role = "employee";
  }

  return User.create(data);
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
- Prevent duplicate email update
- Password hashing handled by model pre-save
*/
export const updateUserById = async (id: string, data: any) => {
  // If email is being updated, ensure uniqueness
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
Deletes user + their bookings
*/
export const deleteUserById = async (id: string) => {
  await Booking.deleteMany({ employee: id });
  return User.findByIdAndDelete(id);
};
