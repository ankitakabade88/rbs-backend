import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string | null;
  role: "admin" | "employee";
  isActive: boolean;

  /* ===== RESET PASSWORD ===== */
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;

  /* ===== INVITE FLOW ===== */
  inviteToken?: string | null;
  inviteTokenExpiry?: Date | null;

  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // password added after invite activation
    password: {
      type: String,
      default: null,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "employee"],
      required: true,
    },

    /* user becomes active after setting password */
    isActive: {
      type: Boolean,
      default: false,
    },

    /* ===== RESET PASSWORD ===== */
    resetToken: {
      type: String,
      default: null,
    },

    resetTokenExpiry: {
      type: Date,
      default: null,
    },

    /* ===== INVITE SYSTEM ===== */
    inviteToken: {
      type: String,
      default: null,
    },

    inviteTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= PASSWORD HASH ================= */
userSchema.pre("save", async function (next) {
  try {
    if (!this.password || !this.isModified("password")) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (err) {
    next(err as Error);
  }
});

/* ================= PASSWORD COMPARE ================= */
userSchema.methods.comparePassword = async function (
  password: string
) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

export default model<IUser>("User", userSchema);