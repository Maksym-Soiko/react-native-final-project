import { Context } from "koa";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { OffenseService } from "../services/offense.service";
import { CreateOffenseDto, LocationQueryDto } from "../dtos/offense.dto";

@injectable()
export class OffenseController {
  constructor(
    @inject(TYPES.OffenseService) private offenseService: OffenseService
  ) {}

  async create(ctx: Context) {
    const dto = plainToInstance(CreateOffenseDto, ctx.request.body);
    const errors = await validate(dto);
    if (errors.length) {
      ctx.status = 400;
      ctx.body = errors;
      return;
    }

    const offense = await this.offenseService.create(dto);
    ctx.status = 201;
    ctx.body = offense;
  }

  async getDates(ctx: Context) {
    const dates = await this.offenseService.getDates();
    ctx.body = dates;
  }

  async getByDate(ctx: Context) {
    const { date } = ctx.params;
    const offenses = await this.offenseService.getByDate(date);
    ctx.body = offenses;
  }

  async getByLocation(ctx: Context) {
    const dto = plainToInstance(LocationQueryDto, ctx.query);
    const errors = await validate(dto);
    if (errors.length) {
      ctx.status = 400;
      ctx.body = errors;
      return;
    }

    const offenses = await this.offenseService.getByLocation(
      dto.lat,
      dto.lng,
      dto.radius
    );
    ctx.body = offenses;
  }
}