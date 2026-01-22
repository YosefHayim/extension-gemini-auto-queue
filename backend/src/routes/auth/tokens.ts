import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  rotateRefreshToken,
  revokeRefreshToken,
  validateRefreshToken,
  verifyToken,
} from "../../services/TokenService.js";
import { createAuditLog } from "../../services/UserService.js";
import { trackUserEvent } from "../../services/AnalyticsService.js";
import { refreshTokenSchema } from "../../validators/auth.js";
import { ValidationError, AuthenticationError } from "../../utils/errors.js";
import { ERROR_CODES } from "../../constants/index.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/messages.js";
import { getClientIp, sanitizeUserAgent } from "../../utils/index.js";
import { requireAuth, getAuthenticatedUser } from "../../middlewares/auth.js";

export async function tokenRoutes(app: FastifyInstance): Promise<void> {
  app.post("/refresh", async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = refreshTokenSchema.safeParse(request.body);

    if (!parseResult.success) {
      throw new ValidationError("Invalid refresh token", {
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { refreshToken } = parseResult.data;

    let decoded;
    try {
      decoded = verifyToken(refreshToken);
    } catch {
      throw new AuthenticationError(
        ERROR_MESSAGES.AUTH_REFRESH_TOKEN_INVALID,
        ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID
      );
    }

    if (decoded.type !== "refresh") {
      throw new AuthenticationError(
        ERROR_MESSAGES.AUTH_REFRESH_TOKEN_INVALID,
        ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID
      );
    }

    const isValid = await validateRefreshToken(decoded.userId, refreshToken);
    if (!isValid) {
      throw new AuthenticationError(
        ERROR_MESSAGES.AUTH_REFRESH_TOKEN_INVALID,
        ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID
      );
    }

    const tokens = await rotateRefreshToken(decoded.userId, decoded.email);

    return reply.send({
      success: true,
      data: { tokens },
    });
  });

  app.post("/logout", {
    preHandler: [requireAuth],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = getAuthenticatedUser(request);

      await revokeRefreshToken(userId);

      await createAuditLog({
        userId,
        action: "user_logged_out",
        resource: "auth",
        ipAddress: getClientIp(request),
        userAgent: sanitizeUserAgent(request.headers["user-agent"]),
      });

      trackUserEvent(userId, "user_logged_out");

      return reply.send({
        success: true,
        data: { message: SUCCESS_MESSAGES.LOGOUT_SUCCESS },
      });
    },
  });
}
