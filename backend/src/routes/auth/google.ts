import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { generateTokenPair } from "../../services/TokenService.js";
import { findOrCreateGoogleUser, createAuditLog } from "../../services/UserService.js";
import { trackUserEvent, identifyUser } from "../../services/AnalyticsService.js";
import { AuthenticationError, ValidationError } from "../../utils/errors.js";
import { ERROR_CODES } from "../../constants/index.js";
import { ERROR_MESSAGES } from "../../constants/messages.js";
import { getClientIp, sanitizeUserAgent } from "../../utils/index.js";

const googleTokenSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
});

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export async function googleRoutes(app: FastifyInstance): Promise<void> {
  app.post("/token", async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = googleTokenSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid input", {
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { accessToken } = parseResult.data;

    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoResponse.ok) {
      throw new AuthenticationError(
        ERROR_MESSAGES.AUTH_OAUTH_FAILED,
        ERROR_CODES.AUTH_OAUTH_FAILED
      );
    }

    const profile = (await userInfoResponse.json()) as GoogleUserInfo;

    if (!profile.email) {
      throw new AuthenticationError(
        ERROR_MESSAGES.AUTH_OAUTH_FAILED,
        ERROR_CODES.AUTH_OAUTH_FAILED
      );
    }

    const ipAddress = getClientIp(request);
    const userAgent = sanitizeUserAgent(request.headers["user-agent"]);

    const { user, isNewUser } = await findOrCreateGoogleUser({
      id: profile.sub,
      email: profile.email,
      name: profile.name ?? profile.given_name,
      picture: profile.picture,
      ipAddress,
      userAgent,
    });

    const tokens = await generateTokenPair(user._id.toString(), user.email);

    await createAuditLog({
      userId: user._id.toString(),
      action: isNewUser ? "user_registered" : "user_logged_in",
      resource: "auth",
      details: { method: "google_token" },
      ipAddress,
      userAgent,
    });

    trackUserEvent(user._id.toString(), isNewUser ? "user_signed_up" : "user_logged_in", {
      method: "google_token",
    });

    identifyUser(user._id.toString(), {
      email: user.email,
      name: user.name,
      plan: user.plan,
      createdAt: user.createdAt,
    });

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
          plan: effectivePlan,
          status: user.status,
          trialEndsAt: user.trialEndsAt,
          usage: {
            dailyLimit: user.getDailyLimit(),
            promptsUsedToday: user.usage.promptsToday,
            promptsRemaining: user.getRemainingPrompts(),
          },
        },
        tokens,
        isNewUser,
      },
    });
  });
}
