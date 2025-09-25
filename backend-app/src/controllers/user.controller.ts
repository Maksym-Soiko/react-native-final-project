import {Context} from "koa";
import {plainToInstance} from "class-transformer";
import {UpdateUserDto} from "../dtos/user.dto";
import {validate} from "class-validator";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";
import {UserService} from "../services/user.service";

@injectable()
export class UserController {
  constructor(@inject(TYPES.UserService) private userService: UserService) {}

  async update(ctx: Context) {
    const id = ctx.params.id;
    const dto = plainToInstance(UpdateUserDto, ctx.request.body);
    const errors = await validate(dto, { skipMissingProperties: true });

    if (errors.length) {
      ctx.status = 400;
      ctx.body = errors;
      return;
    }

    ctx.body = await this.userService.updateById(id, dto);
  }
}