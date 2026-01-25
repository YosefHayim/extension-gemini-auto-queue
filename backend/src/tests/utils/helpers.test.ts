import { describe, it, expect, vi } from "vitest";
import {
  sleep,
  omit,
  pick,
  getClientIp,
  sanitizeUserAgent,
  isValidEmail,
  normalizeEmail,
  calculateExpirationDate,
  isExpired,
} from "../../utils/index.js";

describe("helper utilities", () => {
  describe("sleep", () => {
    it("should resolve after specified time", async () => {
      vi.useFakeTimers();
      const promise = sleep(100);

      vi.advanceTimersByTime(100);
      await promise;

      vi.useRealTimers();
    });
  });

  describe("omit", () => {
    it("should remove specified keys from object", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = omit(obj, ["b"]);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it("should handle multiple keys", () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = omit(obj, ["b", "d"]);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it("should not modify original object", () => {
      const obj = { a: 1, b: 2 };
      omit(obj, ["b"]);

      expect(obj).toEqual({ a: 1, b: 2 });
    });
  });

  describe("pick", () => {
    it("should keep only specified keys", () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = pick(obj, ["a", "c"]);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it("should handle non-existent keys", () => {
      const obj = { a: 1, b: 2 };
      const result = pick(obj, ["a", "z" as keyof typeof obj]);

      expect(result).toEqual({ a: 1 });
    });
  });

  describe("getClientIp", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const request = {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178" },
      };

      const ip = getClientIp(request);

      expect(ip).toBe("203.0.113.195");
    });

    it("should handle array x-forwarded-for header", () => {
      const request = {
        headers: { "x-forwarded-for": ["203.0.113.195", "70.41.3.18"] },
      };

      const ip = getClientIp(request);

      expect(ip).toBe("203.0.113.195");
    });

    it("should fall back to request.ip", () => {
      const request = {
        ip: "192.168.1.1",
        headers: {},
      };

      const ip = getClientIp(request);

      expect(ip).toBe("192.168.1.1");
    });

    it("should return null when no IP available", () => {
      const request = {
        headers: {},
      };

      const ip = getClientIp(request);

      expect(ip).toBeNull();
    });
  });

  describe("sanitizeUserAgent", () => {
    it("should truncate long user agent", () => {
      const longAgent = "x".repeat(600);
      const result = sanitizeUserAgent(longAgent);

      expect(result).toHaveLength(500);
    });

    it("should return null for undefined", () => {
      const result = sanitizeUserAgent(undefined);

      expect(result).toBeNull();
    });

    it("should keep short user agent unchanged", () => {
      const agent = "Mozilla/5.0";
      const result = sanitizeUserAgent(agent);

      expect(result).toBe(agent);
    });
  });

  describe("isValidEmail", () => {
    it("should validate correct emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.org")).toBe(true);
      expect(isValidEmail("user+tag@example.com")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("not-an-email")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("user@domain")).toBe(false);
      expect(isValidEmail("user name@example.com")).toBe(false);
    });
  });

  describe("normalizeEmail", () => {
    it("should lowercase email", () => {
      const result = normalizeEmail("TEST@EXAMPLE.COM");

      expect(result).toBe("test@example.com");
    });

    it("should trim whitespace", () => {
      const result = normalizeEmail("  test@example.com  ");

      expect(result).toBe("test@example.com");
    });

    it("should handle mixed case with whitespace", () => {
      const result = normalizeEmail("  TEST@Example.COM  ");

      expect(result).toBe("test@example.com");
    });
  });

  describe("calculateExpirationDate", () => {
    it("should calculate correct expiration", () => {
      vi.useFakeTimers();
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const expiration = calculateExpirationDate(30);

      expect(expiration.getTime()).toBe(now.getTime() + 30 * 60 * 1000);

      vi.useRealTimers();
    });
  });

  describe("isExpired", () => {
    it("should return true for past date", () => {
      const pastDate = new Date(Date.now() - 1000);

      expect(isExpired(pastDate)).toBe(true);
    });

    it("should return false for future date", () => {
      const futureDate = new Date(Date.now() + 60000);

      expect(isExpired(futureDate)).toBe(false);
    });
  });
});
