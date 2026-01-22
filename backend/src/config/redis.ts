import Redis from "ioredis";
import { env } from "./env.js";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err: Error) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    redisClient.on("error", (err: Error) => {
      console.error("Redis connection error:", err);
    });

    redisClient.on("connect", () => {
      console.info("Redis connected");
    });

    redisClient.on("ready", () => {
      console.info("Redis ready");
    });
  }

  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.info("Redis disconnected");
  }
}
