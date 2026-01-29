import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { beforeAll, afterAll, afterEach, vi } from "vitest";

let mongoServer: MongoMemoryServer;

vi.stubEnv("NODE_ENV", "test");
vi.stubEnv("PORT", "3001");
vi.stubEnv("HOST", "127.0.0.1");
vi.stubEnv("API_VERSION", "v1");
vi.stubEnv("JWT_SECRET", "test-jwt-secret-must-be-at-least-32-chars-long");
vi.stubEnv("JWT_REFRESH_SECRET", "test-refresh-secret-must-be-at-least-32-chars");
vi.stubEnv("JWT_ACCESS_EXPIRY", "15m");
vi.stubEnv("JWT_REFRESH_EXPIRY", "7d");
vi.stubEnv("LEMON_SQUEEZY_WEBHOOK_SECRET", "test-webhook-secret");
vi.stubEnv("CORS_ORIGINS", "http://localhost:3000,chrome-extension://test");
vi.stubEnv("MONGODB_URI", "mongodb://127.0.0.1:27017");
vi.stubEnv("MONGODB_DB_NAME", "promptqueue-test");
vi.stubEnv("REDIS_URL", "redis://127.0.0.1:6379");
vi.stubEnv("LEMON_SQUEEZY_API_KEY", "test-lemon-squeezy-api-key");
vi.stubEnv("LEMON_SQUEEZY_STORE_ID", "test-store-id");
vi.stubEnv("LEMON_SQUEEZY_LIFETIME_VARIANT_ID", "test-variant-id");
vi.stubEnv("RESEND_API_KEY", "re_test_api_key");
vi.stubEnv("EMAIL_FROM", "test@promptqueue.app");
vi.stubEnv("EMAIL_FROM_NAME", "PromptQueue Test");
vi.stubEnv("RATE_LIMIT_MAX", "1000");
vi.stubEnv("RATE_LIMIT_WINDOW_MS", "60000");

export const mockRedisClient = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue("OK"),
  setex: vi.fn().mockResolvedValue("OK"),
  del: vi.fn().mockResolvedValue(1),
  exists: vi.fn().mockResolvedValue(0),
  expire: vi.fn().mockResolvedValue(1),
  ttl: vi.fn().mockResolvedValue(-2),
  incr: vi.fn().mockResolvedValue(1),
  decr: vi.fn().mockResolvedValue(0),
  hget: vi.fn().mockResolvedValue(null),
  hset: vi.fn().mockResolvedValue(1),
  hdel: vi.fn().mockResolvedValue(1),
  hgetall: vi.fn().mockResolvedValue({}),
  keys: vi.fn().mockResolvedValue([]),
  scan: vi.fn().mockResolvedValue(["0", []]),
  quit: vi.fn().mockResolvedValue("OK"),
  disconnect: vi.fn().mockResolvedValue(undefined),
  on: vi.fn().mockReturnThis(),
  once: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  status: "ready" as const,
};

vi.mock("../config/redis.js", () => ({
  getRedisClient: vi.fn(() => mockRedisClient),
  disconnectRedis: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("resend", () => {
  const mockSend = vi.fn().mockResolvedValue({ id: "test-email-id" });
  return {
    Resend: class MockResend {
      emails = { send: mockSend };
    },
  };
});

vi.mock("posthog-node", () => ({
  PostHog: vi.fn().mockImplementation(() => ({
    capture: vi.fn(),
    identify: vi.fn(),
    shutdown: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("@sentry/node", () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  setContext: vi.fn(),
  setTag: vi.fn(),
  addBreadcrumb: vi.fn(),
  startTransaction: vi.fn(() => ({
    finish: vi.fn(),
    setHttpStatus: vi.fn(),
  })),
}));

vi.mock("@lemonsqueezy/lemonsqueezy.js", () => ({
  lemonSqueezySetup: vi.fn(),
  getCustomer: vi.fn().mockResolvedValue({ data: null }),
  listOrders: vi.fn().mockResolvedValue({ data: [] }),
  getOrder: vi.fn().mockResolvedValue({ data: null }),
  createCheckout: vi.fn().mockResolvedValue({
    data: {
      data: {
        attributes: {
          url: "https://test-checkout.lemonsqueezy.com/checkout/test",
        },
      },
    },
  }),
}));

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  vi.stubEnv("MONGODB_URI", mongoUri);

  await mongoose.connect(mongoUri, {
    dbName: "promptqueue-test",
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  vi.clearAllMocks();
});

export const createTestUser = async (
  overrides: Partial<{
    email: string;
    name: string;
    googleId: string;
    plan: "free" | "lifetime";
    status: "active" | "expired";
    isEmailVerified: boolean;
  }> = {}
) => {
  const { User } = await import("../models/User.js");

  const userData = {
    email: overrides.email || `test-${Date.now()}@example.com`,
    name: overrides.name || "Test User",
    googleId: overrides.googleId || null,
    plan: overrides.plan || "free",
    status: overrides.status || "active",
    isEmailVerified: overrides.isEmailVerified ?? true,
    usage: {
      promptsToday: 0,
      lastResetAt: new Date(),
    },
    metadata: {
      lastLoginAt: new Date(),
      loginCount: 1,
      createdFrom: overrides.googleId ? "google" : ("email" as const),
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
    },
  };

  const user = new User(userData);
  await user.save();
  return user;
};

export const getAuthHeaders = (accessToken: string) => ({
  authorization: `Bearer ${accessToken}`,
});
