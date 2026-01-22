/**
 * @fileoverview Subscription plans and pricing configuration
 */

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
