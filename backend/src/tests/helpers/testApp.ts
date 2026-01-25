import Fastify, { type FastifyInstance, type InjectOptions } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";

import { registerRoutes } from "../../routes/index.js";
import { errorHandler, notFoundHandler } from "../../middlewares/errorHandler.js";
import { initializeTokenService } from "../../services/TokenService.js";

export async function buildTestApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(cookie);

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || "test-jwt-secret-must-be-at-least-32-chars-long",
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

export function injectRequest(
  app: FastifyInstance,
  options: {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    url: string;
    payload?: InjectOptions["payload"];
    headers?: Record<string, string>;
  }
) {
  return app.inject({
    method: options.method,
    url: options.url,
    payload: options.payload,
    headers: {
      "content-type": "application/json",
      ...options.headers,
    },
  });
}
