import Koa from "koa";
import bodyParser from "koa-bodyparser";
import pino from "pino";
import userRoute from "./routes/user.route";
import authRoute from "./routes/auth.route";
import offenseRoute from "./routes/offense.route";
import { connectToDatabase } from "./database";
import { errorHandler } from "./middlewares/error-handler";
import { config } from "./config";

const logger = pino({ level: config.NODE_ENV === "production" ? "info" : "debug" });

export async function bootstrap() {
    const app = new Koa();

    app.use(errorHandler);
    app.use(bodyParser());

    app.use(userRoute.routes());
    app.use(userRoute.allowedMethods());

    app.use(authRoute.routes());
    app.use(authRoute.allowedMethods());

    app.use(offenseRoute.routes());
    app.use(offenseRoute.allowedMethods());

    await connectToDatabase();

    const PORT = Number(config.PORT);
    const server = app.listen(PORT, () => {
        logger.info(`Server started on http://localhost:${PORT}`);
    });

    const shutdown = async () => {
        logger.info("Shutdown initiated");
        server.close(() => {
            logger.info("HTTP server closed");
        });
        try {
            await (await import("mongoose")).disconnect();
            logger.info("Mongo disconnected");
        } catch (e) {
            logger.error(e);
        }
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

bootstrap();