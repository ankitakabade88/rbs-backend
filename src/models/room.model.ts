import { Schema, model, Document } from "mongoose";

export interface IRoom extends Document {
  name: string;
  location?: string;
  capacity: number;
  type: "meeting" | "training" | "conference";
  isAvailable: boolean;
}

const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    type: {
      type: String,
      enum: ["meeting", "training", "conference"],
      required: true,
      lowercase: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IRoom>("Room", roomSchema);