/**
 * @fileoverview Feature flags and credit costs
 */

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
