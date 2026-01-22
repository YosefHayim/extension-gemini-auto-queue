import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { env } from "../../config/env.js";
import {
  generateTokenPair,
  storeOAuthState,
  getOAuthState,
  generateStateToken,
} from "../../services/TokenService.js";
import { findOrCreateGoogleUser, createAuditLog } from "../../services/UserService.js";
import { trackUserEvent, identifyUser } from "../../services/AnalyticsService.js";
import { AuthenticationError } from "../../utils/errors.js";
import { ERROR_CODES } from "../../constants/index.js";
import { ERROR_MESSAGES } from "../../constants/messages.js";
import { getClientIp, sanitizeUserAgent } from "../../utils/index.js";

export async function googleRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const state = generateStateToken();
    const redirectUri = (request.query as Record<string, string>).redirect_uri;

    await storeOAuthState(state, { redirectUri });

    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "consent",
    });

    return reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });

  app.get("/callback", async (request: FastifyRequest, reply: FastifyReply) => {
    const { code, state } = request.query as { code?: string; state?: string };

    if (!code || !state) {
      throw new AuthenticationError(
        ERROR_MESSAGES.AUTH_OAUTH_FAILED,
        ERROR_CODES.AUTH_OAUTH_FAILED
      );
    }

    const stateData = await getOAuthState(state);
    if (!stateData) {
      throw new AuthenticationError(
        ERROR_MESSAGES.AUTH_OAUTH_FAILED,
        ERROR_CODES.AUTH_OAUTH_FAILED
      );
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: env.GOOGLE_CALLBACK_URL,
      }),
    });

    if (!tokenResponse.ok) {
      throw new AuthenticationError(
        ERROR_MESSAGES.AUTH_OAUTH_FAILED,
        ERROR_CODES.AUTH_OAUTH_FAILED
      );
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string };

    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoResponse.ok) {
      throw new AuthenticationError(
        ERROR_MESSAGES.AUTH_OAUTH_FAILED,
        ERROR_CODES.AUTH_OAUTH_FAILED
      );
    }

    const profile = (await userInfoResponse.json()) as {
      id: string;
      email: string;
      name?: string;
      picture?: string;
    };

    const ipAddress = getClientIp(request);
    const userAgent = sanitizeUserAgent(request.headers["user-agent"]);

    const { user, isNewUser } = await findOrCreateGoogleUser({
      ...profile,
      ipAddress,
      userAgent,
    });

    const tokens = await generateTokenPair(user._id.toString(), user.email);

    await createAuditLog({
      userId: user._id.toString(),
      action: isNewUser ? "user_registered" : "user_logged_in",
      resource: "auth",
      details: { method: "google" },
      ipAddress,
      userAgent,
    });

    trackUserEvent(user._id.toString(), isNewUser ? "user_signed_up" : "user_logged_in", {
      method: "google",
    });

    identifyUser(user._id.toString(), {
      email: user.email,
      name: user.name,
      plan: user.subscription.plan,
      createdAt: user.createdAt,
    });

    const redirectUri = stateData.redirectUri as string | undefined;
    if (redirectUri) {
      const params = new URLSearchParams({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        is_new_user: String(isNewUser),
      });
      return reply.redirect(`${redirectUri}?${params}`);
    }

    return reply.send({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
        tokens,
        isNewUser,
      },
    });
  });
}
