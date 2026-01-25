import { describe, it, expect } from "vitest";
import {
  generateOTP,
  generateSecureToken,
  hashWithHMAC,
  verifyHMAC,
  verifyWebhookSignature,
  maskEmail,
  generateNonce,
} from "../../utils/crypto.js";

describe("crypto utilities", () => {
  describe("generateOTP", () => {
    it("should generate a 6-digit OTP", () => {
      const otp = generateOTP();

      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it("should generate different OTPs on each call", () => {
      const otps = new Set<string>();

      for (let i = 0; i < 100; i++) {
        otps.add(generateOTP());
      }

      expect(otps.size).toBeGreaterThan(90);
    });
  });

  describe("generateSecureToken", () => {
    it("should generate a token with default length", () => {
      const token = generateSecureToken();

      expect(token).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it("should generate a token with custom length", () => {
      const token = generateSecureToken(16);

      expect(token).toHaveLength(32);
    });

    it("should generate unique tokens", () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe("hashWithHMAC", () => {
    it("should produce consistent hash for same input", () => {
      const secret = "test-secret";
      const data = "test-data";

      const hash1 = hashWithHMAC(data, secret);
      const hash2 = hashWithHMAC(data, secret);

      expect(hash1).toBe(hash2);
    });

    it("should produce different hash for different data", () => {
      const secret = "test-secret";

      const hash1 = hashWithHMAC("data1", secret);
      const hash2 = hashWithHMAC("data2", secret);

      expect(hash1).not.toBe(hash2);
    });

    it("should produce different hash for different secrets", () => {
      const data = "test-data";

      const hash1 = hashWithHMAC(data, "secret1");
      const hash2 = hashWithHMAC(data, "secret2");

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyHMAC", () => {
    it("should verify valid signature", () => {
      const secret = "test-secret";
      const data = "test-data";
      const signature = hashWithHMAC(data, secret);

      const isValid = verifyHMAC(data, signature, secret);

      expect(isValid).toBe(true);
    });

    it("should reject invalid signature", () => {
      const secret = "test-secret";
      const data = "test-data";
      const invalidSignature = "invalid-signature";

      const isValid = verifyHMAC(data, invalidSignature, secret);

      expect(isValid).toBe(false);
    });

    it("should reject tampered data", () => {
      const secret = "test-secret";
      const originalData = "original-data";
      const signature = hashWithHMAC(originalData, secret);

      const isValid = verifyHMAC("tampered-data", signature, secret);

      expect(isValid).toBe(false);
    });

    it("should reject wrong secret", () => {
      const data = "test-data";
      const signature = hashWithHMAC(data, "correct-secret");

      const isValid = verifyHMAC(data, signature, "wrong-secret");

      expect(isValid).toBe(false);
    });
  });

  describe("verifyWebhookSignature", () => {
    it("should verify valid webhook signature", () => {
      const secret = "webhook-secret";
      const payload = '{"event":"test"}';
      const signature = hashWithHMAC(payload, secret);

      const isValid = verifyWebhookSignature(payload, signature, secret);

      expect(isValid).toBe(true);
    });

    it("should reject invalid webhook signature", () => {
      const secret = "webhook-secret";
      const payload = '{"event":"test"}';

      const isValid = verifyWebhookSignature(payload, "invalid-sig", secret);

      expect(isValid).toBe(false);
    });
  });

  describe("maskEmail", () => {
    it("should mask standard email", () => {
      const masked = maskEmail("john.doe@example.com");

      expect(masked).toBe("joh*****@example.com");
    });

    it("should handle short local part", () => {
      const masked = maskEmail("ab@example.com");

      expect(masked).toBe("a*@example.com");
    });

    it("should handle single character local part", () => {
      const masked = maskEmail("a@example.com");

      expect(masked).toBe("a*@example.com");
    });

    it("should preserve domain", () => {
      const masked = maskEmail("test@subdomain.example.co.uk");

      expect(masked).toContain("@subdomain.example.co.uk");
    });
  });

  describe("generateNonce", () => {
    it("should generate base64url encoded nonce", () => {
      const nonce = generateNonce();

      expect(nonce.length).toBeGreaterThan(0);
      expect(/^[A-Za-z0-9_-]+$/.test(nonce)).toBe(true);
    });

    it("should generate unique nonces", () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();

      expect(nonce1).not.toBe(nonce2);
    });
  });
});
