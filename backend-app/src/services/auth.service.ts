import { injectable } from "inversify";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel } from "../models/user.schema";
import { config } from "../config";
import { ConflictError, UnauthorizedError } from "../errors/app-err";

dotenv.config();

@injectable()
export class AuthService {
    async register(
        email: string,
        password: string,
        firstName: string,
        lastName: string
    ): Promise<{ token: string }> {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            throw new ConflictError("User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserModel({
            email,
            password: hashedPassword,
            firstName,
            lastName,
        });

        await user.save();

        if (!config.JWT_SECRET) {
            throw new Error("JWT secret is not configured");
        }
        const secret: jwt.Secret = config.JWT_SECRET as jwt.Secret;
        const options: jwt.SignOptions = {
            expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
        };
        const payload = {
            id: String((user._id as any)),
            email: user.email,
        };
        const token = jwt.sign(payload as object, secret, options);

        return { token };
    }

    async login(email: string, password: string): Promise<{ token: string }> {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedError("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid credentials");
        }

        if (!config.JWT_SECRET) {
            throw new Error("JWT secret is not configured");
        }
        const secret2: jwt.Secret = config.JWT_SECRET as jwt.Secret;
        const options2: jwt.SignOptions = {
            expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
        };
        const payload2 = {
            id: String((user._id as any)),
            email: user.email,
        };
        const token = jwt.sign(payload2 as object, secret2, options2);

        return { token };
    }
}

export const authService = new AuthService();