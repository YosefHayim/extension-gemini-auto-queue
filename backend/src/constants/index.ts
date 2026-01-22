/**
 * @fileoverview Application constants and configuration values
 * @description Centralized constants for the entire application
 */

// =============================================================================
// HTTP Status Codes
// =============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// =============================================================================
// Error Codes
// =============================================================================

export const ERROR_CODES = {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  AUTH_TOKEN_INVALID: "AUTH_TOKEN_INVALID",
  AUTH_REFRESH_TOKEN_INVALID: "AUTH_REFRESH_TOKEN_INVALID",
  AUTH_OTP_INVALID: "AUTH_OTP_INVALID",
  AUTH_OTP_EXPIRED: "AUTH_OTP_EXPIRED",
  AUTH_USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",
  AUTH_EMAIL_EXISTS: "AUTH_EMAIL_EXISTS",
  AUTH_OAUTH_FAILED: "AUTH_OAUTH_FAILED",

  // Subscription Errors
  SUB_NOT_FOUND: "SUB_NOT_FOUND",
  SUB_EXPIRED: "SUB_EXPIRED",
  SUB_INSUFFICIENT_CREDITS: "SUB_INSUFFICIENT_CREDITS",
  SUB_WEBHOOK_INVALID: "SUB_WEBHOOK_INVALID",
  SUB_PAYMENT_FAILED: "SUB_PAYMENT_FAILED",

  // Validation Errors
  VALIDATION_FAILED: "VALIDATION_FAILED",
  INVALID_INPUT: "INVALID_INPUT",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // General Errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
} as const;

// =============================================================================
// Subscription Plans
// =============================================================================

export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  MONTHLY: "monthly",
  ANNUAL: "annual",
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
  PAST_DUE: "past_due",
  PAUSED: "paused",
  TRIALING: "trialing",
  UNPAID: "unpaid",
} as const;

export const PLAN_PRICING = {
  [SUBSCRIPTION_PLANS.FREE]: {
    price: 0,
    credits: 100,
    features: ["basic_queue", "limited_prompts"],
  },
  [SUBSCRIPTION_PLANS.MONTHLY]: {
    price: 200, // $2.00 in cents
    credits: -1, // Unlimited
    features: ["unlimited_queue", "all_tools", "priority_support"],
  },
  [SUBSCRIPTION_PLANS.ANNUAL]: {
    price: 1600, // $16.00 in cents (discounted from $24)
    credits: -1, // Unlimited
    features: ["unlimited_queue", "all_tools", "priority_support", "early_access"],
  },
} as const;

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
// Lemon Squeezy Webhook Events
// =============================================================================

export const LEMON_SQUEEZY_EVENTS = {
  SUBSCRIPTION_CREATED: "subscription_created",
  SUBSCRIPTION_UPDATED: "subscription_updated",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",
  SUBSCRIPTION_RESUMED: "subscription_resumed",
  SUBSCRIPTION_EXPIRED: "subscription_expired",
  SUBSCRIPTION_PAUSED: "subscription_paused",
  SUBSCRIPTION_UNPAUSED: "subscription_unpaused",
  SUBSCRIPTION_PAYMENT_SUCCESS: "subscription_payment_success",
  SUBSCRIPTION_PAYMENT_FAILED: "subscription_payment_failed",
  ORDER_CREATED: "order_created",
  ORDER_REFUNDED: "order_refunded",
} as const;

// =============================================================================
// Analytics Events
// =============================================================================

export const ANALYTICS_EVENTS = {
  // User Events
  USER_SIGNED_UP: "user_signed_up",
  USER_LOGGED_IN: "user_logged_in",
  USER_LOGGED_OUT: "user_logged_out",
  USER_DELETED_ACCOUNT: "user_deleted_account",

  // Subscription Events
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_UPGRADED: "subscription_upgraded",
  SUBSCRIPTION_DOWNGRADED: "subscription_downgraded",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",
  SUBSCRIPTION_RENEWED: "subscription_renewed",

  // Feature Usage Events
  FEATURE_USED: "feature_used",
  CREDITS_CONSUMED: "credits_consumed",
  CREDITS_EXHAUSTED: "credits_exhausted",

  // Error Events
  AUTH_ERROR: "auth_error",
  PAYMENT_ERROR: "payment_error",
  API_ERROR: "api_error",
} as const;

// =============================================================================
// Feature Flags
// =============================================================================

export const FEATURES = {
  QUEUE_PROCESSING: "queue_processing",
  IMAGE_GENERATION: "image_generation",
  VIDEO_GENERATION: "video_generation",
  DEEP_RESEARCH: "deep_research",
  CANVAS: "canvas",
  BULK_ACTIONS: "bulk_actions",
  TEMPLATES: "templates",
  SCHEDULING: "scheduling",
  EXPORT: "export",
} as const;

export const FEATURE_CREDIT_COSTS = {
  [FEATURES.QUEUE_PROCESSING]: 1,
  [FEATURES.IMAGE_GENERATION]: 2,
  [FEATURES.VIDEO_GENERATION]: 5,
  [FEATURES.DEEP_RESEARCH]: 3,
  [FEATURES.CANVAS]: 1,
  [FEATURES.BULK_ACTIONS]: 0, // Free
  [FEATURES.TEMPLATES]: 0, // Free
  [FEATURES.SCHEDULING]: 1,
  [FEATURES.EXPORT]: 0, // Free
} as const;

// =============================================================================
// Validation Patterns
// =============================================================================

export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  OTP: /^\d{6}$/,
  MONGO_ID: /^[a-f\d]{24}$/i,
} as const;

// =============================================================================
// Pagination Defaults
// =============================================================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// =============================================================================
// Cache TTL (in seconds)
// =============================================================================

export const CACHE_TTL = {
  USER_PROFILE: 300, // 5 minutes
  SUBSCRIPTION_STATUS: 60, // 1 minute
  FEATURE_FLAGS: 600, // 10 minutes
} as const;
