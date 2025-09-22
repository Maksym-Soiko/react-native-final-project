import Router from "koa-router";
import { TYPES } from "../types";
import { container } from "../inversify.config";
import { AuthController } from "../controllers/auth.controller";

const router = new Router({ prefix: "/auth" });

const authController = container.get<AuthController>(TYPES.AuthController);

router.post("/register", (ctx) => authController.register(ctx));
router.post("/login", (ctx) => authController.login(ctx));

export default router;