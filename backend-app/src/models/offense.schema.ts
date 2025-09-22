import mongoose, { Document, Types } from "mongoose";

export interface OffenseDocument extends Document {
  _id: Types.ObjectId;
  description: string;
  category: string;
  photoUrl: string;
  dateTime: Date;
  userId: Types.ObjectId;
  location: {
    lat: number;
    lng: number;
  };
}

const OffenseSchema = new mongoose.Schema<OffenseDocument>(
  {
    description: { type: String, required: true },
    category: { type: String, required: true },
    photoUrl: { type: String, required: false },
    dateTime: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

OffenseSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export const OffenseModel = mongoose.model<OffenseDocument>("Offense", OffenseSchema);