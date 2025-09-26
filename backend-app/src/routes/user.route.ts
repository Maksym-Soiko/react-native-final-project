import Router from "koa-router";
import { UserController } from "../controllers/user.controller";
import { TYPES } from "../types";
import { container } from "../inversify.config";

const router = new Router({ prefix: "/users" });

const controllerUser = container.get<UserController>(TYPES.UserController);

router.patch("/:id", (ctx) => controllerUser.update(ctx));
router.get("/:id", (ctx) => controllerUser.get(ctx));

export default router;