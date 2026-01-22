import {
  lemonSqueezySetup,
  getSubscription,
  cancelSubscription as lsCancelSubscription,
  updateSubscription,
  type Subscription,
} from "@lemonsqueezy/lemonsqueezy.js";
import { env } from "../config/env.js";
import { User, type IUser } from "../models/User.js";
import {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  LEMON_SQUEEZY_EVENTS,
  PLAN_PRICING,
} from "../constants/index.js";
import type {
  LemonSqueezyWebhookPayload,
  LemonSqueezySubscriptionAttributes,
  UserSubscriptionInfo,
} from "../types/index.js";
import { SubscriptionError } from "../utils/errors.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import { trackSubscriptionEvent } from "./AnalyticsService.js";
import { sendSubscriptionConfirmedEmail } from "./EmailService.js";

lemonSqueezySetup({ apiKey: env.LEMON_SQUEEZY_API_KEY });

function mapLemonSqueezyStatus(
  status: string
): (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS] {
  const statusMap: Record<string, (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS]> =
    {
      active: SUBSCRIPTION_STATUS.ACTIVE,
      cancelled: SUBSCRIPTION_STATUS.CANCELLED,
      expired: SUBSCRIPTION_STATUS.EXPIRED,
      past_due: SUBSCRIPTION_STATUS.PAST_DUE,
      paused: SUBSCRIPTION_STATUS.PAUSED,
      on_trial: SUBSCRIPTION_STATUS.TRIALING,
      unpaid: SUBSCRIPTION_STATUS.UNPAID,
    };

  return statusMap[status] ?? SUBSCRIPTION_STATUS.EXPIRED;
}

function determinePlanFromVariant(
  variantId: string
): (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS] {
  if (variantId === env.LEMON_SQUEEZY_MONTHLY_VARIANT_ID) {
    return SUBSCRIPTION_PLANS.MONTHLY;
  }
  if (variantId === env.LEMON_SQUEEZY_ANNUAL_VARIANT_ID) {
    return SUBSCRIPTION_PLANS.ANNUAL;
  }
  return SUBSCRIPTION_PLANS.FREE;
}

export async function handleWebhookEvent(payload: LemonSqueezyWebhookPayload): Promise<void> {
  const { event_name } = payload.meta;
  const attributes = payload.data.attributes;

  const email = attributes.user_email;
  if (!email) {
    console.warn("Webhook received without user email");
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.warn(`Webhook received for unknown user: ${email}`);
    return;
  }

  switch (event_name) {
    case LEMON_SQUEEZY_EVENTS.SUBSCRIPTION_CREATED:
      await handleSubscriptionCreated(user, attributes, payload.data.id);
      break;

    case LEMON_SQUEEZY_EVENTS.SUBSCRIPTION_UPDATED:
      await handleSubscriptionUpdated(user, attributes);
      break;

    case LEMON_SQUEEZY_EVENTS.SUBSCRIPTION_CANCELLED:
      await handleSubscriptionCancelled(user, attributes);
      break;

    case LEMON_SQUEEZY_EVENTS.SUBSCRIPTION_RESUMED:
      await handleSubscriptionResumed(user, attributes);
      break;

    case LEMON_SQUEEZY_EVENTS.SUBSCRIPTION_EXPIRED:
      await handleSubscriptionExpired(user);
      break;

    case LEMON_SQUEEZY_EVENTS.SUBSCRIPTION_PAUSED:
      await handleSubscriptionPaused(user);
      break;

    case LEMON_SQUEEZY_EVENTS.SUBSCRIPTION_PAYMENT_FAILED:
      await handlePaymentFailed(user);
      break;

    default:
      console.info(`Unhandled webhook event: ${event_name}`);
  }
}

async function handleSubscriptionCreated(
  user: IUser,
  attributes: LemonSqueezySubscriptionAttributes,
  subscriptionId: string
): Promise<void> {
  const plan = determinePlanFromVariant(String(attributes.variant_id));

  user.subscription.plan = plan;
  user.subscription.status = mapLemonSqueezyStatus(attributes.status);
  user.subscription.lemonSqueezyCustomerId = String(attributes.customer_id);
  user.subscription.lemonSqueezySubscriptionId = subscriptionId;
  user.subscription.variantId = String(attributes.variant_id);
  user.subscription.currentPeriodEnd = attributes.renews_at ? new Date(attributes.renews_at) : null;
  user.subscription.cancelAtPeriodEnd = attributes.cancelled;
  user.subscription.customerPortalUrl = attributes.urls.customer_portal;
  user.subscription.updatePaymentUrl = attributes.urls.update_payment_method;

  await user.save();

  await trackSubscriptionEvent(user._id.toString(), "subscription_started", {
    plan,
    variantId: attributes.variant_id,
  });

  const planInfo = PLAN_PRICING[plan];
  await sendSubscriptionConfirmedEmail(
    user.email,
    plan === SUBSCRIPTION_PLANS.MONTHLY ? "Monthly" : "Annual"
  );
}

async function handleSubscriptionUpdated(
  user: IUser,
  attributes: LemonSqueezySubscriptionAttributes
): Promise<void> {
  const newPlan = determinePlanFromVariant(String(attributes.variant_id));
  const oldPlan = user.subscription.plan;

  user.subscription.plan = newPlan;
  user.subscription.status = mapLemonSqueezyStatus(attributes.status);
  user.subscription.variantId = String(attributes.variant_id);
  user.subscription.currentPeriodEnd = attributes.renews_at ? new Date(attributes.renews_at) : null;
  user.subscription.cancelAtPeriodEnd = attributes.cancelled;
  user.subscription.customerPortalUrl = attributes.urls.customer_portal;
  user.subscription.updatePaymentUrl = attributes.urls.update_payment_method;

  await user.save();

  if (oldPlan !== newPlan) {
    const eventName =
      PLAN_PRICING[newPlan].price > PLAN_PRICING[oldPlan].price
        ? "subscription_upgraded"
        : "subscription_downgraded";

    await trackSubscriptionEvent(user._id.toString(), eventName, {
      fromPlan: oldPlan,
      toPlan: newPlan,
    });
  }
}

async function handleSubscriptionCancelled(
  user: IUser,
  attributes: LemonSqueezySubscriptionAttributes
): Promise<void> {
  user.subscription.status = SUBSCRIPTION_STATUS.CANCELLED;
  user.subscription.cancelAtPeriodEnd = true;
  user.subscription.currentPeriodEnd = attributes.ends_at ? new Date(attributes.ends_at) : null;

  await user.save();

  await trackSubscriptionEvent(user._id.toString(), "subscription_cancelled", {
    plan: user.subscription.plan,
    endsAt: attributes.ends_at,
  });
}

async function handleSubscriptionResumed(
  user: IUser,
  attributes: LemonSqueezySubscriptionAttributes
): Promise<void> {
  user.subscription.status = mapLemonSqueezyStatus(attributes.status);
  user.subscription.cancelAtPeriodEnd = false;
  user.subscription.currentPeriodEnd = attributes.renews_at ? new Date(attributes.renews_at) : null;

  await user.save();
}

async function handleSubscriptionExpired(user: IUser): Promise<void> {
  user.subscription.plan = SUBSCRIPTION_PLANS.FREE;
  user.subscription.status = SUBSCRIPTION_STATUS.EXPIRED;
  user.subscription.lemonSqueezySubscriptionId = null;
  user.subscription.variantId = null;
  user.subscription.currentPeriodEnd = null;
  user.subscription.cancelAtPeriodEnd = false;

  user.credits.total = env.FREE_TRIAL_CREDITS;
  user.credits.used = 0;
  user.credits.lastResetAt = new Date();

  await user.save();
}

async function handleSubscriptionPaused(user: IUser): Promise<void> {
  user.subscription.status = SUBSCRIPTION_STATUS.PAUSED;
  await user.save();
}

async function handlePaymentFailed(user: IUser): Promise<void> {
  user.subscription.status = SUBSCRIPTION_STATUS.PAST_DUE;
  await user.save();
}

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
