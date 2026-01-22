import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { env } from "../config/env.js";
import {
  getSubscriptionInfo,
  cancelSubscription,
  getCheckoutUrl,
  handleWebhookEvent,
  syncSubscriptionFromLemonSqueezy,
} from "../services/SubscriptionService.js";
import { createAuditLog } from "../services/UserService.js";
import { verifyWebhookSignature } from "../utils/crypto.js";
import { WebhookError, ValidationError } from "../utils/errors.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages.js";
import { requireAuth, getAuthenticatedUser } from "../middlewares/auth.js";
import { getClientIp, sanitizeUserAgent } from "../utils/index.js";
import { SUBSCRIPTION_PLANS } from "../constants/index.js";
import type { LemonSqueezyWebhookPayload } from "../types/index.js";

export async function subscriptionRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", {
    preHandler: [requireAuth],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = getAuthenticatedUser(request);
      const subscriptionInfo = await getSubscriptionInfo(userId);

      return reply.send({
        success: true,
        data: { subscription: subscriptionInfo },
      });
    },
  });

  app.post("/sync", {
    preHandler: [requireAuth],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = getAuthenticatedUser(request);

      await syncSubscriptionFromLemonSqueezy(userId);
      const subscriptionInfo = await getSubscriptionInfo(userId);

      return reply.send({
        success: true,
        data: { subscription: subscriptionInfo },
      });
    },
  });

  app.post("/cancel", {
    preHandler: [requireAuth],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = getAuthenticatedUser(request);

      await cancelSubscription(userId);

      await createAuditLog({
        userId,
        action: "subscription_cancelled",
        resource: "subscription",
        ipAddress: getClientIp(request),
        userAgent: sanitizeUserAgent(request.headers["user-agent"]),
      });

      return reply.send({
        success: true,
        data: { message: SUCCESS_MESSAGES.SUB_CANCELLED },
      });
    },
  });

  app.get("/checkout/:plan", {
    preHandler: [requireAuth],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = getAuthenticatedUser(request);
      const { plan } = request.params as { plan: string };

      let variantId: string;

      switch (plan) {
        case SUBSCRIPTION_PLANS.MONTHLY:
          variantId = env.LEMON_SQUEEZY_MONTHLY_VARIANT_ID;
          break;
        case SUBSCRIPTION_PLANS.ANNUAL:
          variantId = env.LEMON_SQUEEZY_ANNUAL_VARIANT_ID;
          break;
        default:
          throw new ValidationError("Invalid plan. Use 'monthly' or 'annual'");
      }

      const checkoutUrl = await getCheckoutUrl(userId, variantId);

      return reply.send({
        success: true,
        data: { checkoutUrl },
      });
    },
  });

  app.post("/webhook", async (request: FastifyRequest, reply: FastifyReply) => {
    const signature = request.headers["x-signature"] as string;
    const rawBody = (request as FastifyRequest & { rawBody?: string }).rawBody;

    if (!signature || !rawBody) {
      throw new WebhookError("Missing webhook signature or body");
    }

    const isValid = verifyWebhookSignature(rawBody, signature, env.LEMON_SQUEEZY_WEBHOOK_SECRET);

    if (!isValid) {
      throw new WebhookError(ERROR_MESSAGES.SUB_WEBHOOK_INVALID);
    }

    const payload = request.body as LemonSqueezyWebhookPayload;

    await handleWebhookEvent(payload);

    return reply.send({ success: true });
  });

  app.get("/plans", async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      data: {
        plans: [
          {
            id: SUBSCRIPTION_PLANS.FREE,
            name: "Free",
            price: 0,
            currency: "USD",
            interval: null,
            features: ["100 credits", "Basic queue processing", "Limited tools"],
          },
          {
            id: SUBSCRIPTION_PLANS.MONTHLY,
            name: "Monthly",
            price: 200,
            currency: "USD",
            interval: "month",
            features: ["Unlimited usage", "All tools", "Priority support"],
          },
          {
            id: SUBSCRIPTION_PLANS.ANNUAL,
            name: "Annual",
            price: 1600,
            currency: "USD",
            interval: "year",
            originalPrice: 2400,
            savings: "33%",
            features: [
              "Unlimited usage",
              "All tools",
              "Priority support",
              "Early access to new features",
            ],
          },
        ],
      },
    });
  });
}
