import { Context } from "koa";
import { authService } from "../services/auth.service";
import { ValidationError } from "../errors/app-err";

export class AuthController {
    async register(ctx: Context): Promise<void> {
        const body = ctx.request.body as {
            firstName?: string;
            lastName?: string;
            email?: string;
            password?: string
        };

        const rawFirstName = body.firstName ?? "";
        const rawLastName = body.lastName ?? "";
        const rawEmail = body.email ?? "";
        const password = body.password;

        const firstName = rawFirstName.trim();
        const lastName = rawLastName.trim();
        const email = rawEmail.trim().toLowerCase();

        if (!firstName || !lastName || !email || !password) {
            throw new ValidationError("firstName, lastName, email and password are required");
        }

        const result = await authService.register(email, password, firstName, lastName);

        ctx.status = 201;
        ctx.body = { message: "User registered successfully", ...result };
    }

    async login(ctx: Context): Promise<void> {
        const body = ctx.request.body as { email?: string; password?: string };
        const email = (body.email ?? "").trim().toLowerCase();
        const password = body.password;

        if (!email || !password) {
            throw new ValidationError("email and password are required");
        }

        const result = await authService.login(email, password);

        ctx.status = 200;
        ctx.body = { message: "Login successful", ...result };
    }
}