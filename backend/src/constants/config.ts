/**
 * @fileoverview Configuration constants for OTP, JWT, rate limiting, and cache
 */

// =============================================================================
// OTP Configuration
// =============================================================================

export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  COOLDOWN_MINUTES: 1,
  RESEND_COOLDOWN_SECONDS: 60,
} as const;

// =============================================================================
// JWT Configuration
// =============================================================================

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",
  ISSUER: "gemini-nano-flow",
  AUDIENCE: "gemini-nano-flow-extension",
} as const;

// =============================================================================
// Rate Limiting
// =============================================================================

export const RATE_LIMITS = {
  GLOBAL: {
    max: 100,
    timeWindow: "1 minute",
  },
  AUTH: {
    max: 10,
    timeWindow: "1 minute",
  },
  OTP: {
    max: 5,
    timeWindow: "5 minutes",
  },
  WEBHOOK: {
    max: 1000,
    timeWindow: "1 minute",
  },
} as const;

// =============================================================================
// Redis Keys
// =============================================================================

export const REDIS_KEYS = {
  OTP: (userId: string) => `otp:${userId}`,
  OTP_ATTEMPTS: (userId: string) => `otp:attempts:${userId}`,
  REFRESH_TOKEN: (userId: string) => `refresh:${userId}`,
  USER_SESSION: (userId: string) => `session:${userId}`,
  RATE_LIMIT: (key: string) => `ratelimit:${key}`,
} as const;

// =============================================================================
// Cache TTL (in seconds)
// =============================================================================

export const CACHE_TTL = {
  USER_PROFILE: 300, // 5 minutes
  SUBSCRIPTION_STATUS: 60, // 1 minute
  FEATURE_FLAGS: 600, // 10 minutes
} as const;

// =============================================================================
// Validation Patterns
// =============================================================================

export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  OTP: /^\d{6}$/,
  MONGO_ID: /^[a-f\d]{24}$/i,
} as const;
