import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { isDatabaseConnected } from "../config/database.js";
import { getRedisClient } from "../config/redis.js";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      data: {
        status: "ok",
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.get("/ready", async (request: FastifyRequest, reply: FastifyReply) => {
    const checks = {
      database: isDatabaseConnected(),
      redis: false,
    };

    try {
      const redis = getRedisClient();
      await redis.ping();
      checks.redis = true;
    } catch {
      checks.redis = false;
    }

    const allHealthy = Object.values(checks).every(Boolean);

    return reply.status(allHealthy ? 200 : 503).send({
      success: allHealthy,
      data: {
        status: allHealthy ? "ready" : "degraded",
        checks,
        timestamp: new Date().toISOString(),
      },
    });
  });

  app.get("/live", async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      data: {
        status: "alive",
        timestamp: new Date().toISOString(),
      },
    });
  });
}
