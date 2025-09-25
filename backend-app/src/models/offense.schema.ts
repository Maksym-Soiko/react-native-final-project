import mongoose, { Document, Types } from "mongoose";

export interface OffenseDocument extends Document {
    _id: Types.ObjectId;
    description: string;
    category: string;
    photoUrl?: string;
    dateTime: Date;
    userId: Types.ObjectId;
    location: {
        type: "Point";
        coordinates: [number, number];
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
            type: { type: String, enum: ["Point"], required: true },
            coordinates: { type: [Number], required: true },
        },
    },
    { timestamps: true }
);

OffenseSchema.index({ location: "2dsphere" });

OffenseSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

export const OffenseModel = mongoose.model<OffenseDocument>("Offense", OffenseSchema);