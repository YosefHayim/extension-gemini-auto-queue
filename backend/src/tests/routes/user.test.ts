import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildTestApp, injectRequest } from "../helpers/testApp.js";
import { createTestUser, mockRedisClient } from "../setup.js";
import { generateTokenPair } from "../../services/TokenService.js";

describe("User Routes", () => {
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

  describe("GET /api/v1/users/me", () => {
    it("should return current user profile", async () => {
      const user = await createTestUser({
        email: "profile@example.com",
        name: "Test User",
      });
      const tokens = await generateTokenPair(user._id.toString(), user.email);

      const response = await injectRequest(app, {
        method: "GET",
        url: "/api/v1/users/me",
        headers: { authorization: `Bearer ${tokens.accessToken}` },
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe("profile@example.com");
      expect(body.data.user.name).toBe("Test User");
      expect(body.data.user.plan).toBe("free");
      expect(body.data.user.usage).toBeDefined();
    });

    it("should require authentication", async () => {
      const response = await injectRequest(app, {
        method: "GET",
        url: "/api/v1/users/me",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("PATCH /api/v1/users/me", () => {
    it("should update user profile name", async () => {
      const user = await createTestUser({ email: "update@example.com" });
      const tokens = await generateTokenPair(user._id.toString(), user.email);

      const response = await injectRequest(app, {
        method: "PATCH",
        url: "/api/v1/users/me",
        payload: { name: "Updated Name" },
        headers: { authorization: `Bearer ${tokens.accessToken}` },
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.user.name).toBe("Updated Name");
    });

    it("should require authentication", async () => {
      const response = await injectRequest(app, {
        method: "PATCH",
        url: "/api/v1/users/me",
        payload: { name: "Test" },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("DELETE /api/v1/users/me", () => {
    it("should delete user account", async () => {
      const user = await createTestUser({ email: "delete@example.com" });
      const tokens = await generateTokenPair(user._id.toString(), user.email);

      const response = await injectRequest(app, {
        method: "DELETE",
        url: "/api/v1/users/me",
        headers: { authorization: `Bearer ${tokens.accessToken}` },
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
    });

    it("should require authentication", async () => {
      const response = await injectRequest(app, {
        method: "DELETE",
        url: "/api/v1/users/me",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /api/v1/users/features/check", () => {
    it("should check feature access for free user", async () => {
      const user = await createTestUser({ email: "feature@example.com", plan: "free" });
      const tokens = await generateTokenPair(user._id.toString(), user.email);

      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/users/features/check",
        payload: { feature: "QUEUE_PROCESSING" },
        headers: { authorization: `Bearer ${tokens.accessToken}` },
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.access).toBeDefined();
      expect(body.data.access.allowed).toBeDefined();
    });

    it("should require valid feature name", async () => {
      const user = await createTestUser({ email: "feature2@example.com" });
      const tokens = await generateTokenPair(user._id.toString(), user.email);

      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/users/features/check",
        payload: { feature: "invalid_feature" },
        headers: { authorization: `Bearer ${tokens.accessToken}` },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/users/features/consume", () => {
    it("should consume feature credits", async () => {
      const user = await createTestUser({ email: "consume@example.com", plan: "free" });
      const tokens = await generateTokenPair(user._id.toString(), user.email);

      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/users/features/consume",
        payload: { feature: "QUEUE_PROCESSING" },
        headers: { authorization: `Bearer ${tokens.accessToken}` },
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.remaining).toBeDefined();
    });
  });
});
