import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { findUserById, updateUser, deleteUser } from "../services/UserService.js";
import { checkFeatureAccess, consumeFeatureCredits } from "../middlewares/featureGate.js";
import { updateProfileSchema, featureCheckSchema } from "../validators/user.js";
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

    return reply.send({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          picture: user.picture,
          isEmailVerified: user.isEmailVerified,
          plan: user.plan,
          status: user.status,
          purchasedAt: user.purchasedAt,
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
}
