import {Context} from "koa";
import {plainToInstance} from "class-transformer";
import {validate} from "class-validator";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";
import {OffenseService} from "../services/offense.service";
import {CreateOffenseDto, LocationQueryDto} from "../dtos/offense.dto";
import {ValidationError} from "../errors/app-err";

@injectable()
export class OffenseController {
  constructor(
    @inject(TYPES.OffenseService) private offenseService: OffenseService
  ) {}

  async create(ctx: Context) {
    const dto = plainToInstance(CreateOffenseDto, ctx.request.body);
    const errors = await validate(dto);
    if (errors.length) {
      const messages = errors
        .map((e) => Object.values(e.constraints || {}).join(", "))
        .join("; ");
      throw new ValidationError(messages || "Validation failed");
    }

    const offense = await this.offenseService.create(dto);
    ctx.status = 201;
    ctx.body = offense;
  }

  async getDates(ctx: Context) {
      ctx.body = await this.offenseService.getDates();
  }

  async getByDate(ctx: Context) {
      const { date } = ctx.params;
      ctx.body = await this.offenseService.getByDate(date);
  }

  async getByLocation(ctx: Context) {
    const dto = plainToInstance(LocationQueryDto, ctx.query);
    const errors = await validate(dto);
    if (errors.length) {
      const messages = errors
        .map((e) => Object.values(e.constraints || {}).join(", "))
        .join("; ");
      throw new ValidationError(messages || "Validation failed");
    }

    ctx.body = await this.offenseService.getByLocation(
        dto.lat,
        dto.lng,
        dto.radius
    );
  }
}