import Router from "koa-router";
import { TYPES } from "../types";
import { container } from "../inversify.config";
import { OffenseController } from "../controllers/offense.controller";

const router = new Router({ prefix: "/offenses" });

const offenseController = container.get<OffenseController>(
  TYPES.OffenseController
);

router.post("/", (ctx) => offenseController.create(ctx));
router.get("/dates", (ctx) => offenseController.getDates(ctx));
router.get("/date/:date", (ctx) => offenseController.getByDate(ctx));
router.get("/location", (ctx) => offenseController.getByLocation(ctx));

export default router;