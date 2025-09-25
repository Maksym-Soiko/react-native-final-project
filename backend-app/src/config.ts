import dotenv from "dotenv";
dotenv.config();

export const config = {
    PORT: process.env.PORT || "3000",
    DB_URL: process.env.DB_URL || "mongodb://localhost:27017/backend_db",
    JWT_SECRET: process.env.JWT_SECRET || "change_me",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    NODE_ENV: process.env.NODE_ENV || "development",
    RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
    RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 5),
};