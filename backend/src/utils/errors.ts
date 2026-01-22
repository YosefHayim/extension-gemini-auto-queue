import { ERROR_CODES, HTTP_STATUS } from "../constants/index.js";
import { ERROR_MESSAGES } from "../constants/messages.js";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = ERROR_CODES.INTERNAL_ERROR,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES.AUTH_UNAUTHORIZED,
    code: string = ERROR_CODES.AUTH_TOKEN_INVALID
  ) {
    super(message, HTTP_STATUS.UNAUTHORIZED, code);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.FORBIDDEN) {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.AUTH_TOKEN_INVALID);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: string = ERROR_CODES.AUTH_EMAIL_EXISTS) {
    super(message, HTTP_STATUS.CONFLICT, code);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODES.RATE_LIMIT_EXCEEDED);
  }
}

export class SubscriptionError extends AppError {
  constructor(message: string, code: string = ERROR_CODES.SUB_NOT_FOUND) {
    super(message, HTTP_STATUS.FORBIDDEN, code);
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(creditsRequired: number, creditsRemaining: number) {
    super(
      ERROR_MESSAGES.SUB_INSUFFICIENT_CREDITS,
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.SUB_INSUFFICIENT_CREDITS,
      { creditsRequired, creditsRemaining }
    );
  }
}

export class WebhookError extends AppError {
  constructor(message: string = ERROR_MESSAGES.SUB_WEBHOOK_INVALID) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.SUB_WEBHOOK_INVALID);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function formatErrorResponse(error: AppError) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    },
  };
}
