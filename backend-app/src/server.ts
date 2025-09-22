import Koa from "koa";
import bodyParser from "koa-bodyparser";
import userRoute from "./routes/user.route";
import authRoute from "./routes/auth.route";
import offenseRoute from "./routes/offense.route";
import { connectToDatabase } from "./database";

export async function bootstrap() {
  const app = new Koa();

  app.use(bodyParser());

  app.use(userRoute.routes());
  app.use(userRoute.allowedMethods());

  app.use(authRoute.routes());
  app.use(authRoute.allowedMethods());

  app.use(offenseRoute.routes());
  app.use(offenseRoute.allowedMethods());

  await connectToDatabase();

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

bootstrap();