import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  API_VERSION: z.string().default("v1"),

  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  LEMON_SQUEEZY_WEBHOOK_SECRET: z.string(),
  CORS_ORIGINS: z.string().transform((val) => val.split(",")),

  MONGODB_URI: z.string().url(),
  MONGODB_DB_NAME: z.string().default("groove"),

  REDIS_URL: z.string().url(),

  LEMON_SQUEEZY_API_KEY: z.string(),
  LEMON_SQUEEZY_STORE_ID: z.string(),
  LEMON_SQUEEZY_LIFETIME_VARIANT_ID: z.string(),

  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string().email(),
  EMAIL_FROM_NAME: z.string().default("Groove"),

  SENTRY_DSN: z.string().optional(),
  POSTHOG_API_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().url().default("https://app.posthog.com"),

  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;
