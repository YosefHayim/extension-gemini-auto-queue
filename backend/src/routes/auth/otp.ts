import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { createOTP, verifyOTP, canRequestNewOTP, deleteOTP } from "../../services/OTPService.js";
import { generateTokenPair } from "../../services/TokenService.js";
import {
  findUserByEmail,
  createUser,
  updateLoginMetadata,
  verifyUserEmail,
  createAuditLog,
} from "../../services/UserService.js";
import { sendOTPEmail } from "../../services/EmailService.js";
import { trackUserEvent, identifyUser } from "../../services/AnalyticsService.js";
import { otpRequestSchema, otpVerifySchema } from "../../validators/auth.js";
import { ValidationError, AuthenticationError, RateLimitError } from "../../utils/errors.js";
import { ERROR_CODES, RATE_LIMITS } from "../../constants/index.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/messages.js";
import { getClientIp, sanitizeUserAgent, maskEmail } from "../../utils/index.js";

export async function otpRoutes(app: FastifyInstance): Promise<void> {
  app.post("/request", {
    config: {
      rateLimit: RATE_LIMITS.OTP,
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = otpRequestSchema.safeParse(request.body);

      if (!parseResult.success) {
        throw new ValidationError("Invalid email", {
          errors: parseResult.error.flatten().fieldErrors,
        });
      }

      const { email } = parseResult.data;

      const cooldown = await canRequestNewOTP(email);
      if (!cooldown.allowed) {
        throw new RateLimitError(
          `Please wait ${cooldown.waitSeconds} seconds before requesting a new code`
        );
      }

      const otp = await createOTP(email);

      try {
        await sendOTPEmail(email, otp);
      } catch (error) {
        await deleteOTP(email);
        throw error;
      }

      return reply.send({
        success: true,
        data: {
          message: SUCCESS_MESSAGES.OTP_SENT,
          email: maskEmail(email),
        },
      });
    },
  });

  app.post("/verify", {
    config: {
      rateLimit: RATE_LIMITS.OTP,
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = otpVerifySchema.safeParse(request.body);

      if (!parseResult.success) {
        throw new ValidationError("Invalid input", {
          errors: parseResult.error.flatten().fieldErrors,
        });
      }

      const { email, code } = parseResult.data;
      const ipAddress = getClientIp(request);
      const userAgent = sanitizeUserAgent(request.headers["user-agent"]);

      const verifyResult = await verifyOTP(email, code);

      if (!verifyResult.valid) {
        const errorMap: Record<string, { message: string; code: string }> = {
          OTP_NOT_FOUND: {
            message: ERROR_MESSAGES.AUTH_OTP_INVALID,
            code: ERROR_CODES.AUTH_OTP_INVALID,
          },
          OTP_EXPIRED: {
            message: ERROR_MESSAGES.AUTH_OTP_EXPIRED,
            code: ERROR_CODES.AUTH_OTP_EXPIRED,
          },
          MAX_ATTEMPTS_EXCEEDED: {
            message: ERROR_MESSAGES.OTP_RATE_LIMIT,
            code: ERROR_CODES.AUTH_OTP_INVALID,
          },
          INVALID_CODE: {
            message: ERROR_MESSAGES.AUTH_OTP_INVALID,
            code: ERROR_CODES.AUTH_OTP_INVALID,
          },
        };

        const errorInfo = errorMap[verifyResult.reason!] ?? errorMap.INVALID_CODE;
        throw new AuthenticationError(errorInfo.message, errorInfo.code);
      }

      let user = await findUserByEmail(email);
      let isNewUser = false;

      if (!user) {
        user = await createUser({
          email,
          isEmailVerified: true,
          createdFrom: "email",
          ipAddress,
          userAgent,
        });
        isNewUser = true;
      } else {
        if (!user.isEmailVerified) {
          await verifyUserEmail(user._id.toString());
        }
        await updateLoginMetadata(user._id.toString(), ipAddress, userAgent);
      }

      const tokens = await generateTokenPair(user._id.toString(), user.email);

      await createAuditLog({
        userId: user._id.toString(),
        action: isNewUser ? "user_registered" : "user_logged_in",
        resource: "auth",
        details: { method: "otp" },
        ipAddress,
        userAgent,
      });

      trackUserEvent(user._id.toString(), isNewUser ? "user_signed_up" : "user_logged_in", {
        method: "otp",
      });

      identifyUser(user._id.toString(), {
        email: user.email,
        name: user.name,
        plan: user.subscription.plan,
        createdAt: user.createdAt,
      });

      return reply.send({
        success: true,
        data: {
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            picture: user.picture,
            isEmailVerified: user.isEmailVerified,
            subscription: {
              plan: user.subscription.plan,
              status: user.subscription.status,
            },
            credits: {
              total: user.credits.total,
              used: user.credits.used,
              remaining: user.getRemainingCredits(),
            },
          },
          tokens,
          isNewUser,
        },
      });
    },
  });
}
