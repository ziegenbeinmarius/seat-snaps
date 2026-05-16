import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import fastifyCookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import { AppModule } from "./app.module";

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "../../.env"),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    loadEnv({ path: envPath });
    break;
  }
}

async function bootstrap() {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOWED_ORIGINS) {
    throw new Error("ALLOWED_ORIGINS environment variable must be set in production");
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true, bodyLimit: 10 * 1024 * 1024 }),
    { logger: new Logger() },
  );

  const config = app.get(ConfigService);

  await app.register(fastifyCookie as never);
  await app.register(helmet as never);

  app.enableCors({
    origin: config.getOrThrow<string[]>("app.allowedOrigins"),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix("api");

  const port = config.getOrThrow<number>("app.apiPort");
  await app.listen(port, "0.0.0.0");
  new Logger("Bootstrap").log(`API running on http://0.0.0.0:${port}/api`);
}

bootstrap();
