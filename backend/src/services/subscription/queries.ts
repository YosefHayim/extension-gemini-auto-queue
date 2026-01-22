import {
  lemonSqueezySetup,
  getSubscription,
  cancelSubscription as lsCancelSubscription,
} from "@lemonsqueezy/lemonsqueezy.js";
import { env } from "../../config/env.js";
import { User } from "../../models/User.js";
import { SUBSCRIPTION_PLANS } from "../../constants/index.js";
import type {
  UserSubscriptionInfo,
  LemonSqueezySubscriptionAttributes,
} from "../../types/index.js";
import { SubscriptionError } from "../../utils/errors.js";
import { ERROR_MESSAGES } from "../../constants/messages.js";
import { handleSubscriptionUpdated } from "./webhookHandlers.js";

lemonSqueezySetup({ apiKey: env.LEMON_SQUEEZY_API_KEY });

export async function getSubscriptionInfo(userId: string): Promise<UserSubscriptionInfo> {
  const user = await User.findById(userId);

  if (!user) {
    throw new SubscriptionError(ERROR_MESSAGES.AUTH_USER_NOT_FOUND);
  }

  const isActive = user.hasActiveSubscription();
  const credits = user.subscription.plan === SUBSCRIPTION_PLANS.FREE ? user.credits.total : -1;
  const creditsUsed = user.subscription.plan === SUBSCRIPTION_PLANS.FREE ? user.credits.used : 0;

  return {
    plan: user.subscription.plan,
    status: user.subscription.status,
    credits,
    creditsUsed,
    isActive,
    expiresAt: user.subscription.currentPeriodEnd,
    lemonSqueezySubscriptionId: user.subscription.lemonSqueezySubscriptionId,
    customerPortalUrl: user.subscription.customerPortalUrl,
    updatePaymentUrl: user.subscription.updatePaymentUrl,
  };
}

export async function cancelSubscription(userId: string): Promise<void> {
  const user = await User.findById(userId);

  if (!user) {
    throw new SubscriptionError(ERROR_MESSAGES.AUTH_USER_NOT_FOUND);
  }

  if (!user.subscription.lemonSqueezySubscriptionId) {
    throw new SubscriptionError(ERROR_MESSAGES.SUB_NOT_FOUND);
  }

  await lsCancelSubscription(user.subscription.lemonSqueezySubscriptionId);
}

export async function getCheckoutUrl(userId: string, variantId: string): Promise<string> {
  const user = await User.findById(userId);

  if (!user) {
    throw new SubscriptionError(ERROR_MESSAGES.AUTH_USER_NOT_FOUND);
  }

  const baseUrl = `https://app.lemonsqueezy.com/checkout/buy/${variantId}`;
  const params = new URLSearchParams({
    "checkout[email]": user.email,
    "checkout[custom][user_id]": userId,
  });

  return `${baseUrl}?${params.toString()}`;
}

export async function syncSubscriptionFromLemonSqueezy(userId: string): Promise<void> {
  const user = await User.findById(userId);

  if (!user || !user.subscription.lemonSqueezySubscriptionId) {
    return;
  }

  try {
    const { data } = await getSubscription(user.subscription.lemonSqueezySubscriptionId);

    if (data?.data?.attributes) {
      const attributes = data.data.attributes as unknown as LemonSqueezySubscriptionAttributes;
      await handleSubscriptionUpdated(user, attributes);
    }
  } catch (error) {
    console.error("Failed to sync subscription from Lemon Squeezy:", error);
  }
}
