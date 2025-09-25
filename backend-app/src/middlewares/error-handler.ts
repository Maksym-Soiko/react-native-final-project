import { Context, Next } from "koa";
import { config } from "../config";

export async function errorHandler(ctx: Context, next: Next) {
    try {
        await next();
    } catch (err: any) {
        ctx.status = err.statusCode || 500;
        const body: any = {
            error: err.name || "InternalServerError",
            message: err.message || "An unexpected error occurred",
        };

        if (config.NODE_ENV !== "production" && err.stack) {
            body.stack = err.stack;
        }
        if (err.details) {
            body.details = err.details;
        }

        ctx.body = body;
        console.error(err);
    }
}