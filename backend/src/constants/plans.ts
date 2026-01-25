export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  LIFETIME: "lifetime",
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
} as const;

export const PLAN_LIMITS = {
  [SUBSCRIPTION_PLANS.FREE]: {
    price: 0,
    dailyPrompts: 10,
    features: ["basic_queue", "limited_tools"],
  },
  [SUBSCRIPTION_PLANS.LIFETIME]: {
    price: 500,
    dailyPrompts: 100,
    features: ["full_queue", "all_tools", "priority_support"],
  },
} as const;

export const LEMON_SQUEEZY_EVENTS = {
  ORDER_CREATED: "order_created",
  ORDER_REFUNDED: "order_refunded",
} as const;
