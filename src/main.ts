import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { updateGlobalConfig } from "nestjs-paginate";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: process.env.FRONT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  updateGlobalConfig({
    defaultOrigin: process.env.API_URL,
    defaultLimit: 20,
    defaultMaxLimit: 100,
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
