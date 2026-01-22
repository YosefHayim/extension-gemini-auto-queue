import type { FastifyRequest, FastifyReply } from "fastify";
import { User } from "../models/User.js";
import { FEATURES, FEATURE_CREDIT_COSTS, SUBSCRIPTION_PLANS } from "../constants/index.js";
import {
  InsufficientCreditsError,
  SubscriptionError,
  AuthenticationError,
} from "../utils/errors.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import { ERROR_CODES } from "../constants/index.js";
import { trackFeatureUsage, trackCreditsConsumed } from "../services/AnalyticsService.js";
import type { FeatureAccess } from "../types/index.js";

type FeatureKey = keyof typeof FEATURES;

export function createFeatureGate(feature: FeatureKey) {
  return async function featureGate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.authUser) {
      throw new AuthenticationError(
        ERROR_MESSAGES.AUTH_UNAUTHORIZED,
        ERROR_CODES.AUTH_TOKEN_INVALID
      );
    }

    const { userId } = request.authUser;
    const user = await User.findById(userId);

    if (!user) {
      throw new AuthenticationError(
        ERROR_MESSAGES.AUTH_USER_NOT_FOUND,
        ERROR_CODES.AUTH_USER_NOT_FOUND
      );
    }

    if (!user.hasActiveSubscription()) {
      throw new SubscriptionError(ERROR_MESSAGES.SUB_EXPIRED, ERROR_CODES.SUB_EXPIRED);
    }

    const creditCost = FEATURE_CREDIT_COSTS[FEATURES[feature]];

    if (user.subscription.plan === SUBSCRIPTION_PLANS.FREE && creditCost > 0) {
      const remaining = user.getRemainingCredits();

      if (remaining < creditCost) {
        throw new InsufficientCreditsError(creditCost, remaining);
      }
    }

    trackFeatureUsage(userId, FEATURES[feature], {
      plan: user.subscription.plan,
      creditCost,
    });
  };
}

export async function consumeFeatureCredits(
  userId: string,
  feature: FeatureKey
): Promise<{ success: boolean; remaining: number }> {
  const user = await User.findById(userId);

  if (!user) {
    throw new AuthenticationError(
      ERROR_MESSAGES.AUTH_USER_NOT_FOUND,
      ERROR_CODES.AUTH_USER_NOT_FOUND
    );
  }

  if (user.subscription.plan !== SUBSCRIPTION_PLANS.FREE) {
    return { success: true, remaining: -1 };
  }

  const creditCost = FEATURE_CREDIT_COSTS[FEATURES[feature]];
  const remaining = user.getRemainingCredits();

  if (remaining < creditCost) {
    return { success: false, remaining };
  }

  await user.consumeCredits(creditCost);
  const newRemaining = user.getRemainingCredits();

  trackCreditsConsumed(userId, creditCost, FEATURES[feature], newRemaining);

  return { success: true, remaining: newRemaining };
}

export async function checkFeatureAccess(
  userId: string,
  feature: FeatureKey
): Promise<FeatureAccess> {
  const user = await User.findById(userId);

  if (!user) {
    return {
      allowed: false,
      reason: "User not found",
    };
  }

  if (!user.hasActiveSubscription()) {
    return {
      allowed: false,
      reason: "Subscription expired or inactive",
    };
  }

  const creditCost = FEATURE_CREDIT_COSTS[FEATURES[feature]];

  if (user.subscription.plan !== SUBSCRIPTION_PLANS.FREE) {
    return { allowed: true };
  }

  const remaining = user.getRemainingCredits();

  if (remaining < creditCost) {
    return {
      allowed: false,
      reason: "Insufficient credits",
      creditsRequired: creditCost,
      creditsRemaining: remaining,
    };
  }

  return {
    allowed: true,
    creditsRequired: creditCost,
    creditsRemaining: remaining,
  };
}

export const requireQueueProcessing = createFeatureGate("QUEUE_PROCESSING");
export const requireImageGeneration = createFeatureGate("IMAGE_GENERATION");
export const requireVideoGeneration = createFeatureGate("VIDEO_GENERATION");
export const requireDeepResearch = createFeatureGate("DEEP_RESEARCH");
export const requireCanvas = createFeatureGate("CANVAS");
export const requireScheduling = createFeatureGate("SCHEDULING");
