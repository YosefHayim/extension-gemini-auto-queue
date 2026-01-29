import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { findUserById, updateUser, deleteUser } from "../services/UserService.js";
import { checkFeatureAccess, consumeFeatureCredits } from "../middlewares/featureGate.js";
import { updateProfileSchema, featureCheckSchema, syncDataSchema, trackEventSchema } from "../validators/user.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages.js";
import { requireAuth, getAuthenticatedUser } from "../middlewares/auth.js";
import { FEATURES } from "../constants/index.js";

export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("preHandler", requireAuth);

  app.get("/me", async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = getAuthenticatedUser(request);
    const user = await findUserById(userId);

    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.AUTH_USER_NOT_FOUND);
    }

    await user.checkAndResetDaily();

    // Get effective plan (considers trial expiration)
    const effectivePlan = user.getEffectivePlan();

    return reply.send({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          picture: user.picture,
          isEmailVerified: user.isEmailVerified,
          plan: effectivePlan,
          status: user.status,
          purchasedAt: user.purchasedAt,
          trialEndsAt: user.trialEndsAt,
          usage: {
            dailyLimit: user.getDailyLimit(),
            promptsUsedToday: user.usage.promptsToday,
            promptsRemaining: user.getRemainingPrompts(),
          },
          metadata: {
            createdAt: user.createdAt,
            lastLoginAt: user.metadata.lastLoginAt,
          },
        },
      },
    });
  });

  app.patch("/me", async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = getAuthenticatedUser(request);

    const parseResult = updateProfileSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid input", {
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const user = await updateUser(userId, parseResult.data);

    return reply.send({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
        message: SUCCESS_MESSAGES.PROFILE_UPDATED,
      },
    });
  });

  app.delete("/me", async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = getAuthenticatedUser(request);

    await deleteUser(userId);

    return reply.send({
      success: true,
      data: { message: SUCCESS_MESSAGES.ACCOUNT_DELETED },
    });
  });

  app.post("/features/check", async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = getAuthenticatedUser(request);

    const parseResult = featureCheckSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid input", {
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { feature } = parseResult.data;
    const access = await checkFeatureAccess(userId, feature as keyof typeof FEATURES);

    return reply.send({
      success: true,
      data: { access },
    });
  });

  app.post("/features/consume", async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = getAuthenticatedUser(request);

    const parseResult = featureCheckSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid input", {
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { feature } = parseResult.data;
    const result = await consumeFeatureCredits(userId, feature as keyof typeof FEATURES);

    return reply.send({
      success: true,
      data: result,
    });
  });

  // Sync local extension data to backend
  app.post("/sync", async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = getAuthenticatedUser(request);

    const parseResult = syncDataSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid input", {
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const user = await findUserById(userId);
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.AUTH_USER_NOT_FOUND);
    }

    const { preferences, metadata } = parseResult.data;

    // Update preferences if provided
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    // Update metadata if provided (merge with existing)
    if (metadata) {
      user.metadata = {
        ...user.metadata,
        country: metadata.country ?? user.metadata.country,
        timezone: metadata.timezone ?? user.metadata.timezone,
        language: metadata.language ?? user.metadata.language,
        platform: metadata.platform ?? user.metadata.platform,
        extensionVersion: metadata.extensionVersion ?? user.metadata.extensionVersion,
        userAgent: metadata.userAgent ?? user.metadata.userAgent,
      };
    }

    await user.save();

    return reply.send({
      success: true,
      data: { message: "User data synced successfully" },
    });
  });

  // Track analytics events
  app.post("/track", async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = getAuthenticatedUser(request);

    const parseResult = trackEventSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid input", {
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { event, properties } = parseResult.data;

    // For now, just log the event - can be extended to send to analytics service
    request.log.info({ userId, event, properties }, "Analytics event tracked");

    // If event is prompt_used, consume a prompt credit
    if (event === "prompt_used") {
      const user = await findUserById(userId);
      if (user && user.canUsePrompt()) {
        await user.consumePrompt();
      }
    }

    return reply.send({
      success: true,
      data: { message: "Event tracked" },
    });
  });
}
