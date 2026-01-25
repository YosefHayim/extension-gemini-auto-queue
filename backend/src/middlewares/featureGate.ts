import type { FastifyRequest, FastifyReply } from "fastify";
import { User } from "../models/User.js";
import { FEATURES, SUBSCRIPTION_STATUS } from "../constants/index.js";
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

    if (user.status !== SUBSCRIPTION_STATUS.ACTIVE) {
      throw new SubscriptionError(ERROR_MESSAGES.SUB_EXPIRED, ERROR_CODES.SUB_EXPIRED);
    }

    await user.checkAndResetDaily();

    if (!user.canUsePrompt()) {
      const remaining = user.getRemainingPrompts();
      throw new InsufficientCreditsError(1, remaining);
    }

    trackFeatureUsage(userId, FEATURES[feature], {
      plan: user.plan,
      promptsRemaining: user.getRemainingPrompts(),
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

  await user.checkAndResetDaily();

  const remaining = user.getRemainingPrompts();

  if (!user.canUsePrompt()) {
    return { success: false, remaining };
  }

  await user.consumePrompt();
  const newRemaining = user.getRemainingPrompts();

  trackCreditsConsumed(userId, 1, FEATURES[feature], newRemaining);

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

  if (user.status !== SUBSCRIPTION_STATUS.ACTIVE) {
    return {
      allowed: false,
      reason: "Account expired or inactive",
    };
  }

  await user.checkAndResetDaily();

  const remaining = user.getRemainingPrompts();

  if (!user.canUsePrompt()) {
    return {
      allowed: false,
      reason: "Daily prompt limit reached",
      creditsRequired: 1,
      creditsRemaining: remaining,
    };
  }

  return {
    allowed: true,
    creditsRequired: 1,
    creditsRemaining: remaining,
  };
}

export const requireQueueProcessing = createFeatureGate("QUEUE_PROCESSING");
export const requireImageGeneration = createFeatureGate("IMAGE_GENERATION");
export const requireVideoGeneration = createFeatureGate("VIDEO_GENERATION");
export const requireDeepResearch = createFeatureGate("DEEP_RESEARCH");
export const requireCanvas = createFeatureGate("CANVAS");
export const requireScheduling = createFeatureGate("SCHEDULING");
