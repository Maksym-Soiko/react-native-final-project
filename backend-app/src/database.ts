import mongoose from "mongoose";
import { config } from "./config";

export async function connectToDatabase() {
  try {
    await mongoose.connect(config.DB_URL);
    console.log("🟢 Connected to MongoDB successful");
  } catch (error) {
    console.error("🔴 MongoDB connection error: ", error);
    process.exit(1);
  }
}