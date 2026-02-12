import { Schema, model } from "mongoose";

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
    },
    capacity: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["meeting", "training", "conference"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
 
export default model("Room", roomSchema);
