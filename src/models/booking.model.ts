import { Schema, model, Types, Document } from "mongoose";

export interface IBooking extends Document {
  employee: Types.ObjectId;
  room: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  purpose?: string;
}

const bookingSchema = new Schema<IBooking>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true, // ✅ dashboard speed
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },

    purpose: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/* compound index (VERY IMPORTANT) */
bookingSchema.index({ room: 1, date: 1 });

export default model<IBooking>("Booking", bookingSchema);