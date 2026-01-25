import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildTestApp, injectRequest } from "../helpers/testApp.js";
import { createTestUser, mockRedisClient } from "../setup.js";
import { generateTokenPair } from "../../services/TokenService.js";

describe("Auth Routes", () => {
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
    mockRedisClient.ttl.mockResolvedValue(300);
  });

  describe("POST /api/v1/auth/otp/request", () => {
    it("should send OTP email for valid email", async () => {
      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/auth/otp/request",
        payload: { email: "test@example.com" },
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.message.toLowerCase()).toContain("verification");
      expect(body.data.email).toMatch(/\*+/);
    });

    it("should reject missing email", async () => {
      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/auth/otp/request",
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/auth/otp/verify", () => {
    it("should verify valid OTP and create new user", async () => {
      const validOTP = JSON.stringify({
        code: "123456",
        email: "newuser@example.com",
        attempts: 0,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });
      mockRedisClient.get.mockResolvedValue(validOTP);

      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/auth/otp/verify",
        payload: { email: "newuser@example.com", code: "123456" },
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe("newuser@example.com");
      expect(body.data.tokens.accessToken).toBeDefined();
      expect(body.data.tokens.refreshToken).toBeDefined();
      expect(body.data.isNewUser).toBe(true);
    });

    it("should verify OTP for existing user", async () => {
      const existingUser = await createTestUser({ email: "existing@example.com" });

      const validOTP = JSON.stringify({
        code: "654321",
        email: "existing@example.com",
        attempts: 0,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });
      mockRedisClient.get.mockResolvedValue(validOTP);

      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/auth/otp/verify",
        payload: { email: "existing@example.com", code: "654321" },
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.user.id).toBe(existingUser._id.toString());
      expect(body.data.isNewUser).toBe(false);
    });

    it("should reject missing fields", async () => {
      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/auth/otp/verify",
        payload: { email: "test@example.com" },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/auth/google/token", () => {
    it("should authenticate with valid Google token", async () => {
      const mockGoogleProfile = {
        sub: "google-user-id-123",
        email: "googleuser@gmail.com",
        email_verified: true,
        name: "Google User",
        picture: "https://example.com/photo.jpg",
      };

      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockGoogleProfile,
      });

      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/auth/google/token",
        payload: { accessToken: "valid-google-token" },
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe("googleuser@gmail.com");
      expect(body.data.user.name).toBe("Google User");
      expect(body.data.tokens.accessToken).toBeDefined();
      expect(body.data.isNewUser).toBe(true);

      global.fetch = originalFetch;
    });

    it("should return existing user for repeat Google login", async () => {
      const existingUser = await createTestUser({
        email: "repeat@gmail.com",
        googleId: "google-repeat-id",
      });

      const mockGoogleProfile = {
        sub: "google-repeat-id",
        email: "repeat@gmail.com",
        email_verified: true,
        name: "Repeat User",
      };

      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockGoogleProfile,
      });

      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/auth/google/token",
        payload: { accessToken: "valid-token" },
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.data.user.id).toBe(existingUser._id.toString());
      expect(body.data.isNewUser).toBe(false);

      global.fetch = originalFetch;
    });

    it("should reject missing access token", async () => {
      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/auth/google/token",
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("should refresh tokens with valid refresh token", async () => {
      const user = await createTestUser({ email: "refresh@example.com" });
      const tokens = await generateTokenPair(user._id.toString(), user.email);

      mockRedisClient.get.mockResolvedValue(tokens.refreshToken);

      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/auth/refresh",
        payload: { refreshToken: tokens.refreshToken },
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.tokens.accessToken).toBeDefined();
      expect(body.data.tokens.refreshToken).toBeDefined();
    });

    it("should reject missing refresh token", async () => {
      const response = await injectRequest(app, {
        method: "POST",
        url: "/api/v1/auth/refresh",
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("Health check", () => {
    it("should return healthy status", async () => {
      const response = await injectRequest(app, {
        method: "GET",
        url: "/health",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe("ok");
    });
  });
});
