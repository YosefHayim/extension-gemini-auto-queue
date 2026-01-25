import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildTestApp, injectRequest } from "../helpers/testApp.js";
import { createTestUser, mockRedisClient } from "../setup.js";
import { generateTokenPair } from "../../services/TokenService.js";

describe("Subscription Routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockRedisClient.get.mockResolvedValue(null);
    mockRedisClient.set.mockResolvedValue("OK");
    mockRedisClient.del.mockResolvedValue(1);
  });

  describe("GET /api/v1/subscriptions", () => {
    it("should return subscription info for authenticated user", async () => {
      const user = await createTestUser({ email: "sub@example.com" });
      const tokens = await generateTokenPair(user._id.toString(), user.email);

      const response = await injectRequest(app, {
        method: "GET",
        url: "/api/v1/subscriptions",
        headers: { authorization: `Bearer ${tokens.accessToken}` },
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.subscription).toBeDefined();
      expect(body.data.subscription.plan).toBe("free");
    });

    it("should require authentication", async () => {
      const response = await injectRequest(app, {
        method: "GET",
        url: "/api/v1/subscriptions",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/v1/subscriptions/checkout", () => {
    it("should return checkout URL for authenticated user", async () => {
      const user = await createTestUser({ email: "checkout@example.com" });
      const tokens = await generateTokenPair(user._id.toString(), user.email);

      const response = await injectRequest(app, {
        method: "GET",
        url: "/api/v1/subscriptions/checkout",
        headers: { authorization: `Bearer ${tokens.accessToken}` },
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.checkoutUrl).toBeDefined();
      expect(body.data.checkoutUrl).toContain("lemonsqueezy.com");
    });

    it("should require authentication", async () => {
      const response = await injectRequest(app, {
        method: "GET",
        url: "/api/v1/subscriptions/checkout",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/v1/subscriptions/plans", () => {
    it("should return available plans", async () => {
      const response = await injectRequest(app, {
        method: "GET",
        url: "/api/v1/subscriptions/plans",
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.plans).toBeInstanceOf(Array);
      expect(body.data.plans.length).toBeGreaterThan(0);

      const freePlan = body.data.plans.find((p: { id: string }) => p.id === "free");
      expect(freePlan).toBeDefined();
      expect(freePlan.price).toBe(0);
    });

    it("should include lifetime plan", async () => {
      const response = await injectRequest(app, {
        method: "GET",
        url: "/api/v1/subscriptions/plans",
      });

      const body = JSON.parse(response.body);
      const lifetimePlan = body.data.plans.find((p: { id: string }) => p.id === "lifetime");
      expect(lifetimePlan).toBeDefined();
      expect(lifetimePlan.isOneTime).toBe(true);
    });
  });

  describe("POST /api/v1/subscriptions/webhook", () => {
    it("should reject webhook without signature", async () => {
      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/subscriptions/webhook",
        payload: { event: "test" },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject webhook with invalid signature", async () => {
      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/subscriptions/webhook",
        payload: { event: "test" },
        headers: { "x-signature": "invalid-signature" },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
