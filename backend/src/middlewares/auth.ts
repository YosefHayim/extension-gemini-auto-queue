import type { FastifyRequest, FastifyReply } from "fastify";
import { AuthenticationError } from "../utils/errors.js";
import { ERROR_CODES } from "../constants/index.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import type { JWTPayload } from "../types/index.js";

export interface AuthUser {
  userId: string;
  email: string;
}

declare module "fastify" {
  interface FastifyRequest {
    authUser?: AuthUser;
  }
}

export async function authenticateRequest(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AuthenticationError(
        ERROR_MESSAGES.AUTH_UNAUTHORIZED,
        ERROR_CODES.AUTH_TOKEN_INVALID
      );
    }

    const token = authHeader.substring(7);
    const decoded = await request.jwtVerify<JWTPayload>();

    if (decoded.type !== "access") {
      throw new AuthenticationError(
        ERROR_MESSAGES.AUTH_TOKEN_INVALID,
        ERROR_CODES.AUTH_TOKEN_INVALID
      );
    }

    request.authUser = {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    const err = error as Error;
    if (err.message.includes("expired")) {
      throw new AuthenticationError(
        ERROR_MESSAGES.AUTH_TOKEN_EXPIRED,
        ERROR_CODES.AUTH_TOKEN_EXPIRED
      );
    }

    throw new AuthenticationError(
      ERROR_MESSAGES.AUTH_TOKEN_INVALID,
      ERROR_CODES.AUTH_TOKEN_INVALID
    );
  }
}

export function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: Error) => void
): void {
  authenticateRequest(request, reply)
    .then(() => done())
    .catch(done);
}

export function getAuthenticatedUser(request: FastifyRequest): { userId: string; email: string } {
  if (!request.authUser) {
    throw new AuthenticationError(ERROR_MESSAGES.AUTH_UNAUTHORIZED, ERROR_CODES.AUTH_TOKEN_INVALID);
  }
  return request.authUser;
}

export function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: Error) => void
): void {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    done();
    return;
  }

  authenticateRequest(request, reply)
    .then(() => done())
    .catch(() => done());
}
