import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";

import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { disconnectRedis } from "./config/redis.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { initializeTokenService } from "./services/TokenService.js";
import { initializeAnalytics, shutdownAnalytics } from "./services/AnalyticsService.js";
import { RATE_LIMITS } from "./constants/index.js";

async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        env.NODE_ENV !== "production"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
              },
            }
          : undefined,
    },
    trustProxy: true,
  });

  await app.register(cors, {
    origin: env.CORS_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Signature"],
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cookie);

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  await app.register(rateLimit, {
    max: RATE_LIMITS.GLOBAL.max,
    timeWindow: RATE_LIMITS.GLOBAL.timeWindow,
  });

  initializeTokenService(app);

  app.addContentTypeParser("application/json", { parseAs: "string" }, (req, body, done) => {
    try {
      const json = JSON.parse(body as string);
      (req as typeof req & { rawBody?: string }).rawBody = body as string;
      done(null, json);
    } catch (err) {
      done(err as Error, undefined);
    }
  });

  await registerRoutes(app);

  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  return app;
}

async function start() {
  initializeAnalytics();

  await connectDatabase();

  const app = await buildApp();

  const shutdown = async (signal: string) => {
    console.info(`Received ${signal}, shutting down gracefully...`);

    await app.close();
    await disconnectDatabase();
    await disconnectRedis();
    await shutdownAnalytics();

    console.info("Shutdown complete");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  try {
    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.info(`Server running at http://${env.HOST}:${env.PORT}`);
    console.info(`Environment: ${env.NODE_ENV}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
