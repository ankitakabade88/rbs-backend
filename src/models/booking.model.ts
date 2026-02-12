import { Schema, model } from "mongoose";

const bookingSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true],
    },

    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true],
    },

    date: {
      type: Date,
      required: [true],
    },

    startTime: {
      type: String,
      required: [true],
    },

    endTime: {
      type: String,
      required: [true],
    },

    purpose: {
      type: String,
      minlength: [3],
      maxlength: [200],
    },
  },
  { timestamps: true }
);

export default model("Booking", bookingSchema);
