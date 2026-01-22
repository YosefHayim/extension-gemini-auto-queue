import type { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { AppError, isAppError, formatErrorResponse } from "../utils/errors.js";
import { HTTP_STATUS, ERROR_CODES } from "../constants/index.js";
import { ERROR_MESSAGES } from "../constants/messages.js";
import { captureException, trackApiError } from "../services/AnalyticsService.js";
import { env } from "../config/env.js";

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  const userId = (request as FastifyRequest & { user?: { userId: string } }).user?.userId ?? null;

  if (isAppError(error)) {
    const response = formatErrorResponse(error);

    if (error.statusCode >= 500) {
      captureException(error, {
        userId,
        url: request.url,
        method: request.method,
      });
    }

    trackApiError(userId, request.url, error.code, error.message);

    reply.status(error.statusCode).send(response);
    return;
  }

  captureException(error as Error, {
    userId,
    url: request.url,
    method: request.method,
    headers: request.headers,
  });

  console.error("Unhandled error:", error);

  const response = {
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message:
        env.NODE_ENV === "production" ? ERROR_MESSAGES.INTERNAL_ERROR : (error as Error).message,
    },
  };

  trackApiError(userId, request.url, ERROR_CODES.INTERNAL_ERROR, (error as Error).message);

  reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(response);
}

export function notFoundHandler(request: FastifyRequest, reply: FastifyReply): void {
  reply.status(HTTP_STATUS.NOT_FOUND).send({
    success: false,
    error: {
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: `Route ${request.method} ${request.url} not found`,
    },
  });
}
