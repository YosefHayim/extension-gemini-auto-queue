import { getRedisClient } from "../config/redis.js";
import { OTP_CONFIG, REDIS_KEYS } from "../constants/index.js";
import { generateOTP, calculateExpirationDate, isExpired } from "../utils/index.js";
import type { OTPData } from "../types/index.js";

interface StoredOTP {
  code: string;
  email: string;
  attempts: number;
  createdAt: string;
  expiresAt: string;
}

export async function createOTP(email: string): Promise<string> {
  const redis = getRedisClient();
  const code = generateOTP();
  const now = new Date();
  const expiresAt = calculateExpirationDate(OTP_CONFIG.EXPIRY_MINUTES);

  const otpData: StoredOTP = {
    code,
    email,
    attempts: 0,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const key = REDIS_KEYS.OTP(email);
  const ttlSeconds = OTP_CONFIG.EXPIRY_MINUTES * 60;

  await redis.set(key, JSON.stringify(otpData), "EX", ttlSeconds);

  return code;
}

export async function verifyOTP(
  email: string,
  code: string
): Promise<{ valid: boolean; reason?: string }> {
  const redis = getRedisClient();
  const key = REDIS_KEYS.OTP(email);

  const storedData = await redis.get(key);

  if (!storedData) {
    return { valid: false, reason: "OTP_NOT_FOUND" };
  }

  const otpData: StoredOTP = JSON.parse(storedData);

  if (isExpired(new Date(otpData.expiresAt))) {
    await redis.del(key);
    return { valid: false, reason: "OTP_EXPIRED" };
  }

  if (otpData.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
    await redis.del(key);
    return { valid: false, reason: "MAX_ATTEMPTS_EXCEEDED" };
  }

  if (otpData.code !== code) {
    otpData.attempts += 1;
    const remainingTTL = await redis.ttl(key);
    await redis.set(key, JSON.stringify(otpData), "EX", remainingTTL);
    return { valid: false, reason: "INVALID_CODE" };
  }

  await redis.del(key);
  return { valid: true };
}

export async function getOTPData(email: string): Promise<OTPData | null> {
  const redis = getRedisClient();
  const key = REDIS_KEYS.OTP(email);

  const storedData = await redis.get(key);

  if (!storedData) {
    return null;
  }

  const data: StoredOTP = JSON.parse(storedData);

  return {
    code: data.code,
    email: data.email,
    attempts: data.attempts,
    createdAt: new Date(data.createdAt),
    expiresAt: new Date(data.expiresAt),
  };
}

export async function canRequestNewOTP(
  email: string
): Promise<{ allowed: boolean; waitSeconds?: number }> {
  const redis = getRedisClient();
  const key = REDIS_KEYS.OTP(email);

  const storedData = await redis.get(key);

  if (!storedData) {
    return { allowed: true };
  }

  const otpData: StoredOTP = JSON.parse(storedData);
  const createdAt = new Date(otpData.createdAt);
  const cooldownEnd = new Date(createdAt.getTime() + OTP_CONFIG.RESEND_COOLDOWN_SECONDS * 1000);
  const now = new Date();

  if (now < cooldownEnd) {
    const waitSeconds = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000);
    return { allowed: false, waitSeconds };
  }

  return { allowed: true };
}

export async function deleteOTP(email: string): Promise<void> {
  const redis = getRedisClient();
  const key = REDIS_KEYS.OTP(email);
  await redis.del(key);
}
