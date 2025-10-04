import { Context, Next } from "koa";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ValidationError as AppValidationError } from "../errors/app-err";

export function validateDto(dtoClass: any, source: "body" | "query" = "body") {
  return async (ctx: Context, next: Next) => {
    const plain = source === "body" ? ctx.request.body : ctx.request.query;
    const dtoInstance = plainToInstance(dtoClass, plain);

    const errors = await validate(dtoInstance as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
    });

    if (errors.length) {
      const messages = errors
        .map((e) => {
          const cons = (e as any).constraints;
          if (!cons) {
            return Object.values(
              e.children?.reduce(
                (acc: any, c: any) => ({ ...acc, ...(c.constraints || {}) }),
                {}
              ) || {}
            ).join(", ");
          }
          return Object.values(cons).join(", ");
        })
        .filter(Boolean)
        .join("; ");
      throw new AppValidationError(messages || "Validation failed");
    }

    (ctx.state as any).dto = dtoInstance;
    await next();
  };
}