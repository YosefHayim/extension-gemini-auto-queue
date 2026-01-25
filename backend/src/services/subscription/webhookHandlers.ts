import type { IUser } from "../../models/User.js";
import {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  LEMON_SQUEEZY_EVENTS,
} from "../../constants/index.js";
import type { LemonSqueezyWebhookPayload } from "../../types/index.js";
import { User } from "../../models/User.js";
import { trackSubscriptionEvent } from "../AnalyticsService.js";
import { sendSubscriptionConfirmedEmail } from "../EmailService.js";

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
    case LEMON_SQUEEZY_EVENTS.ORDER_CREATED:
      await handleOrderCreated(user, payload.data.id, String(attributes.customer_id));
      break;
    case LEMON_SQUEEZY_EVENTS.ORDER_REFUNDED:
      await handleOrderRefunded(user);
      break;
    default:
      console.info(`Unhandled webhook event: ${event_name}`);
  }
}

async function handleOrderCreated(user: IUser, orderId: string, customerId: string): Promise<void> {
  user.plan = SUBSCRIPTION_PLANS.LIFETIME;
  user.status = SUBSCRIPTION_STATUS.ACTIVE;
  user.lemonSqueezyOrderId = orderId;
  user.lemonSqueezyCustomerId = customerId;
  user.purchasedAt = new Date();

  await user.save();

  await trackSubscriptionEvent(user._id.toString(), "lifetime_purchased", {
    orderId,
  });

  await sendSubscriptionConfirmedEmail(user.email, "Lifetime");
}

async function handleOrderRefunded(user: IUser): Promise<void> {
  user.plan = SUBSCRIPTION_PLANS.FREE;
  user.status = SUBSCRIPTION_STATUS.ACTIVE;
  user.lemonSqueezyOrderId = null;
  user.purchasedAt = null;

  await user.save();

  await trackSubscriptionEvent(user._id.toString(), "lifetime_refunded", {});
}
