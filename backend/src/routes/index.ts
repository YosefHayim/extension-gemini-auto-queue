import type { FastifyInstance } from "fastify";
import { authRoutes } from "./auth/index.js";
import { userRoutes } from "./user.js";
import { subscriptionRoutes } from "./subscription.js";
import { healthRoutes } from "./health.js";
import { env } from "../config/env.js";

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  const apiPrefix = `/api/${env.API_VERSION}`;

  await app.register(healthRoutes, { prefix: "/health" });

  await app.register(authRoutes, { prefix: `${apiPrefix}/auth` });
  await app.register(userRoutes, { prefix: `${apiPrefix}/users` });
  await app.register(subscriptionRoutes, { prefix: `${apiPrefix}/subscriptions` });
}
