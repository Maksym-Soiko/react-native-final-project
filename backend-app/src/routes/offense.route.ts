import Router from "koa-router";
import { container } from "../inversify.config";
import { TYPES } from "../types";
import { OffenseController } from "../controllers/offense.controller";
import { validateDto } from "../middlewares/validate-dto";
import { CreateOffenseDto, LocationQueryDto } from "../dtos/offense.dto";
import { authMiddleware } from "../middlewares/auth";

const router = new Router({ prefix: "/offenses" });
const ctrl = container.get<OffenseController>(TYPES.OffenseController);

router.post("/", authMiddleware, validateDto(CreateOffenseDto, "body"), (ctx) => ctrl.create(ctx));

router.get("/dates", (ctx) => ctrl.getDates(ctx));
router.get("/date/:date", (ctx) => ctrl.getByDate(ctx));
router.get("/location", validateDto(LocationQueryDto, "query"), (ctx) => ctrl.getByLocation(ctx));

export default router;