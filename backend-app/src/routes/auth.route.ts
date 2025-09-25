import Router from "koa-router";
import { container } from "../inversify.config";
import { TYPES } from "../types";
import { AuthController } from "../controllers/auth.controller";
import { loginRateLimiter } from "../middlewares/login-rate-limit";
import { errorHandler } from "../middlewares/error-handler";

const router = new Router({ prefix: "/auth" });
const authController = container.get<AuthController>(TYPES.AuthController);

router.use(errorHandler);

router.post("/register", async (ctx) => await authController.register(ctx));
router.post("/login", loginRateLimiter(), async (ctx) => await authController.login(ctx));

export default router;