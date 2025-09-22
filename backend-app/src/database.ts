import mongoose from "mongoose";

export async function connectToDatabase() {
  try {
    await mongoose.connect("mongodb://localhost:27017/backend_db");
    console.log("🟢 Connected to MongoDB successful");
  } catch (error) {
    console.error("🔴 MongoDB connection error: ", error);
    process.exit(1);
  }
}