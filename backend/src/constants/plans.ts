export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  TRIAL: "trial",
  PRO: "pro",
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
} as const;

// Trial duration in days
export const TRIAL_DURATION_DAYS = 14;

export const PLAN_LIMITS = {
  [SUBSCRIPTION_PLANS.FREE]: {
    price: 0,
    dailyPrompts: 10,
    features: ["basic_queue", "limited_tools"],
  },
  [SUBSCRIPTION_PLANS.TRIAL]: {
    price: 0,
    dailyPrompts: Infinity, // Unlimited during trial
    features: ["full_queue", "all_tools", "priority_support"],
  },
  [SUBSCRIPTION_PLANS.PRO]: {
    price: 499,
    dailyPrompts: Infinity,
    features: ["full_queue", "all_tools", "priority_support"],
  },
} as const;

export const LEMON_SQUEEZY_EVENTS = {
  ORDER_CREATED: "order_created",
  ORDER_REFUNDED: "order_refunded",
} as const;
