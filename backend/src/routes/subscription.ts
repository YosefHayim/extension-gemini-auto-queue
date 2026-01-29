import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  getSubscriptionInfo,
  getCheckoutUrl,
  handleWebhookEvent,
} from "../services/SubscriptionService.js";
import { createAuditLog } from "../services/UserService.js";
import { verifyWebhookSignature } from "../utils/crypto.js";
import { WebhookError } from "../utils/errors.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages.js";
import { requireAuth, getAuthenticatedUser } from "../middlewares/auth.js";
import { getClientIp, sanitizeUserAgent } from "../utils/index.js";
import { SUBSCRIPTION_PLANS, PLAN_LIMITS } from "../constants/index.js";
import { env } from "../config/env.js";
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

  app.get("/checkout", {
    preHandler: [requireAuth],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = getAuthenticatedUser(request);

      const checkoutUrl = await getCheckoutUrl(userId);

      await createAuditLog({
        userId,
        action: "checkout_initiated",
        resource: "subscription",
        ipAddress: getClientIp(request),
        userAgent: sanitizeUserAgent(request.headers["user-agent"]),
      });

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
            dailyLimit: PLAN_LIMITS[SUBSCRIPTION_PLANS.FREE].dailyPrompts,
            features: PLAN_LIMITS[SUBSCRIPTION_PLANS.FREE].features,
          },
          {
            id: SUBSCRIPTION_PLANS.TRIAL,
            name: "Trial",
            price: 0,
            currency: "USD",
            dailyLimit: PLAN_LIMITS[SUBSCRIPTION_PLANS.TRIAL].dailyPrompts,
            features: PLAN_LIMITS[SUBSCRIPTION_PLANS.TRIAL].features,
            isTrial: true,
            trialDays: 14,
          },
          {
            id: SUBSCRIPTION_PLANS.PRO,
            name: "Pro",
            price: PLAN_LIMITS[SUBSCRIPTION_PLANS.PRO].price,
            currency: "USD",
            dailyLimit: PLAN_LIMITS[SUBSCRIPTION_PLANS.PRO].dailyPrompts,
            features: PLAN_LIMITS[SUBSCRIPTION_PLANS.PRO].features,
            isOneTime: true,
          },
        ],
      },
    });
  });
}
