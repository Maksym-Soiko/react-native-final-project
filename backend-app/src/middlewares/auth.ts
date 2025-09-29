import { Context, Next } from "koa";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { UnauthorizedError } from "../errors/app-err";

export async function authMiddleware(ctx: Context, next: Next) {
  const rawAuth = ctx.headers["authorization"] || ctx.headers["Authorization"];
  let token: string | undefined;

  if (rawAuth) {
    const header = String(rawAuth).trim();
    const parts = header.split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      token = parts[1];
    } else {
      token = header;
    }
  }

  if (!token) {
    const xAccess =
      ctx.headers["x-access-token"] || ctx.headers["X-Access-Token"];
    if (xAccess) token = String(xAccess);
  }

  if (!token && (ctx.request.query as any)?.token) {
    token = String((ctx.request.query as any).token);
  }

  if (!token && (ctx.request.body as any)?.token) {
    token = String((ctx.request.body as any).token);
  }

  if (!token) {
    throw new UnauthorizedError("Missing token");
  }

  if (!config.JWT_SECRET) {
    throw new UnauthorizedError("JWT secret is not configured on server");
  }

  try {
    const secret: jwt.Secret = config.JWT_SECRET as jwt.Secret;
    ctx.state.user = jwt.verify(token, secret) as any;
  } catch (err: any) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token expired");
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError(err.message || "Invalid token");
    }
    throw new UnauthorizedError("Invalid or expired token");
  }

  await next();
}