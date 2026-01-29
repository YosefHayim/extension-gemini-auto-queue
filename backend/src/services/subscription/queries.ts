import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";
import { env } from "../../config/env.js";
import { User } from "../../models/User.js";
import { SUBSCRIPTION_PLANS } from "../../constants/index.js";
import type { UserSubscriptionInfo } from "../../types/index.js";
import { SubscriptionError } from "../../utils/errors.js";
import { ERROR_MESSAGES } from "../../constants/messages.js";

lemonSqueezySetup({ apiKey: env.LEMON_SQUEEZY_API_KEY });

export async function getSubscriptionInfo(userId: string): Promise<UserSubscriptionInfo> {
  const user = await User.findById(userId);

  if (!user) {
    throw new SubscriptionError(ERROR_MESSAGES.AUTH_USER_NOT_FOUND);
  }

  await user.checkAndResetDaily();

  const effectivePlan = user.getEffectivePlan();

  return {
    plan: effectivePlan,
    status: user.status,
    dailyLimit: user.getDailyLimit(),
    promptsUsedToday: user.usage.promptsToday,
    promptsRemaining: user.getRemainingPrompts(),
    isPro: effectivePlan === SUBSCRIPTION_PLANS.PRO,
    isTrial: effectivePlan === SUBSCRIPTION_PLANS.TRIAL,
    trialEndsAt: user.trialEndsAt,
    purchasedAt: user.purchasedAt,
    lemonSqueezyOrderId: user.lemonSqueezyOrderId,
  };
}

export async function getCheckoutUrl(userId: string): Promise<string> {
  const user = await User.findById(userId);

  if (!user) {
    throw new SubscriptionError(ERROR_MESSAGES.AUTH_USER_NOT_FOUND);
  }

  if (user.plan === SUBSCRIPTION_PLANS.PRO) {
    throw new SubscriptionError("You already have a Pro plan");
  }

  const baseUrl = `https://app.lemonsqueezy.com/checkout/buy/${env.LEMON_SQUEEZY_LIFETIME_VARIANT_ID}`;
  const params = new URLSearchParams({
    "checkout[email]": user.email,
    "checkout[custom][user_id]": userId,
  });

  return `${baseUrl}?${params.toString()}`;
}
