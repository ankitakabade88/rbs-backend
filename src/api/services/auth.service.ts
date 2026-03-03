import User from "../../models/user.model";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/jwt";
import { sendInviteEmail } from "../../utils/sendInviteEmail";

/* =====================================================
   LOGIN SERVICE
===================================================== */
export const loginService = async (
  email: string,
  password: string
) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user || !user.password) {
    throw Object.assign(
      new Error("Invalid email or password"),
      { statusCode: 401 }
    );
  }

  if (!user.isActive) {
    throw Object.assign(
      new Error(
        "Account not activated. Please set your password using the invite link."
      ),
      { statusCode: 403 }
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw Object.assign(
      new Error("Invalid email or password"),
      { statusCode: 401 }
    );
  }

  const token = jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET as string,
    {
      expiresIn: JWT_EXPIRES_IN || "20m",
    } as SignOptions
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  };
};

/* =====================================================
   SET PASSWORD (INVITE ACTIVATION)
===================================================== */
export const setPasswordService = async (
  token: string,
  password: string
) => {

  /* ================= HASH TOKEN ================= */
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  /* =================================================
     FIND USER (ALLOW OLD + NEW TOKENS)
  ================================================= */
  const user = await User.findOne({
    $or: [
      { inviteToken: hashedToken },
      { inviteToken: token }, // backward compatibility
    ],
  }).select("+password");

  if (!user) {
    throw Object.assign(
      new Error("Invalid invite link"),
      { statusCode: 400 }
    );
  }

  /* =================================================
     TOKEN EXPIRED → AUTO REGENERATE 🔥
  ================================================= */
  if (!user.inviteTokenExpiry || user.inviteTokenExpiry < new Date()) {

    const newToken = crypto.randomBytes(32).toString("hex");

    const newHashedToken = crypto
      .createHash("sha256")
      .update(newToken)
      .digest("hex");

    user.inviteToken = newHashedToken;
    user.inviteTokenExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    await user.save();

    const inviteLink =
      `${process.env.FRONTEND_URL}/set-password?token=${newToken}`;

    await sendInviteEmail(user.email, inviteLink);

    throw Object.assign(
      new Error(
        "Invite link expired. A new invite email has been sent."
      ),
      { statusCode: 400 }
    );
  }

  /* =================================================
     ACTIVATE ACCOUNT
  ================================================= */
  user.password = password;
  user.isActive = true;

  user.inviteToken = undefined;
  user.inviteTokenExpiry = undefined;

  await user.save();

  /* ================= JWT ================= */
  const jwtToken = jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET as string,
    {
      expiresIn: JWT_EXPIRES_IN || "20m",
    } as SignOptions
  );

  return {
    token: jwtToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  };
};