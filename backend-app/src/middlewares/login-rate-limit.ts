import { Context, Next } from "koa";
import { config } from "../config";
import { AppError } from "../errors/app-err";

const attempts = new Map<string, { count: number; firstMs: number }>();

export function loginRateLimiter(limit = config.RATE_LIMIT_MAX, windowMs = config.RATE_LIMIT_WINDOW_MS) {
    return async (ctx: Context, next: Next) => {
        const xff = ctx.request.headers["x-forwarded-for"];
        const xffStr = Array.isArray(xff) ? xff.join(",") : String(xff || "");
        const ip = ctx.ip || ctx.request.ip || xffStr || "unknown";

        const now = Date.now();
        const entry = attempts.get(ip) || { count: 0, firstMs: now };

        if (now - entry.firstMs > windowMs) {
            entry.count = 0;
            entry.firstMs = now;
        }

        entry.count += 1;
        attempts.set(ip, entry);

        if (entry.count > limit) {
            throw new AppError("Too many requests. Try again later.", 429);
        }

        if (attempts.size > 10000) {
            const cutoff = now - windowMs * 2;
            for (const [key, val] of attempts) {
                if (val.firstMs < cutoff) attempts.delete(key);
            }
        }

        await next();
    };
}