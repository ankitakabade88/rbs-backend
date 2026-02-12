import User from "../../models/user.model";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/jwt";

export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.password) {
    throw Object.assign(new Error("Invalid email or password"), {
      statusCode: 401,
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw Object.assign(new Error("Invalid email or password"), {
      statusCode: 401,
    });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET!,
    { expiresIn: JWT_EXPIRES_IN || "20m" } as SignOptions
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
