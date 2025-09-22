import { Context } from "koa";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { AuthService } from "../services/auth.service";
import { RegisterUserDto, LoginUserDto } from "../dtos/user.dto";

@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private authService: AuthService) {}

  async register(ctx: Context) {
    const dto = plainToInstance(RegisterUserDto, ctx.request.body);
    const errors = await validate(dto);
    if (errors.length) {
      ctx.status = 400;
      ctx.body = errors;
      return;
    }
    const user = await this.authService.register(dto);
    ctx.status = 201;
    ctx.body = user;
  }

  async login(ctx: Context) {
    const dto = plainToInstance(LoginUserDto, ctx.request.body);
    const errors = await validate(dto);
    if (errors.length) {
      ctx.status = 400;
      ctx.body = errors;
      return;
    }
    const user = await this.authService.login(dto);
    ctx.status = 200;
    ctx.body = user;
  }
}