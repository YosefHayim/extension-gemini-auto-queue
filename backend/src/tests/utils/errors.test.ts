import { describe, it, expect } from "vitest";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  SubscriptionError,
  InsufficientCreditsError,
  WebhookError,
  isAppError,
  formatErrorResponse,
} from "../../utils/errors.js";
import { HTTP_STATUS, ERROR_CODES } from "../../constants/index.js";

describe("error utilities", () => {
  describe("AppError", () => {
    it("should create error with default values", () => {
      const error = new AppError("Test error");

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
      expect(error.isOperational).toBe(true);
    });

    it("should create error with custom values", () => {
      const error = new AppError("Custom error", 400, "CUSTOM_CODE", { field: "test" });

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("CUSTOM_CODE");
      expect(error.details).toEqual({ field: "test" });
    });

    it("should be instance of Error", () => {
      const error = new AppError("Test");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe("AuthenticationError", () => {
    it("should create with default message", () => {
      const error = new AuthenticationError();

      expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(error.code).toBe(ERROR_CODES.AUTH_TOKEN_INVALID);
    });

    it("should create with custom message", () => {
      const error = new AuthenticationError("Custom auth error");

      expect(error.message).toBe("Custom auth error");
      expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
    });
  });

  describe("AuthorizationError", () => {
    it("should create with correct status code", () => {
      const error = new AuthorizationError();

      expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
    });
  });

  describe("ValidationError", () => {
    it("should create with details", () => {
      const error = new ValidationError("Invalid input", {
        fields: ["email", "password"],
      });

      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(error.code).toBe(ERROR_CODES.VALIDATION_FAILED);
      expect(error.details).toEqual({ fields: ["email", "password"] });
    });
  });

  describe("NotFoundError", () => {
    it("should create with default message", () => {
      const error = new NotFoundError();

      expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
      expect(error.code).toBe(ERROR_CODES.RESOURCE_NOT_FOUND);
    });

    it("should create with custom message", () => {
      const error = new NotFoundError("User not found");

      expect(error.message).toBe("User not found");
    });
  });

  describe("ConflictError", () => {
    it("should create with default code", () => {
      const error = new ConflictError("Email already exists");

      expect(error.statusCode).toBe(HTTP_STATUS.CONFLICT);
      expect(error.code).toBe(ERROR_CODES.AUTH_EMAIL_EXISTS);
    });

    it("should create with custom code", () => {
      const error = new ConflictError("Duplicate entry", "CUSTOM_CONFLICT");

      expect(error.code).toBe("CUSTOM_CONFLICT");
    });
  });

  describe("RateLimitError", () => {
    it("should create with correct status code", () => {
      const error = new RateLimitError();

      expect(error.statusCode).toBe(HTTP_STATUS.TOO_MANY_REQUESTS);
      expect(error.code).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
    });
  });

  describe("SubscriptionError", () => {
    it("should create with forbidden status", () => {
      const error = new SubscriptionError("Subscription required");

      expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
    });
  });

  describe("InsufficientCreditsError", () => {
    it("should include credits info in details", () => {
      const error = new InsufficientCreditsError(5, 2);

      expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
      expect(error.code).toBe(ERROR_CODES.SUB_INSUFFICIENT_CREDITS);
      expect(error.details).toEqual({ creditsRequired: 5, creditsRemaining: 2 });
    });
  });

  describe("WebhookError", () => {
    it("should create with bad request status", () => {
      const error = new WebhookError();

      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(error.code).toBe(ERROR_CODES.SUB_WEBHOOK_INVALID);
    });
  });

  describe("isAppError", () => {
    it("should return true for AppError instances", () => {
      expect(isAppError(new AppError("test"))).toBe(true);
      expect(isAppError(new AuthenticationError())).toBe(true);
      expect(isAppError(new ValidationError("test"))).toBe(true);
    });

    it("should return false for non-AppError", () => {
      expect(isAppError(new Error("test"))).toBe(false);
      expect(isAppError("string error")).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
      expect(isAppError({ message: "fake error" })).toBe(false);
    });
  });

  describe("formatErrorResponse", () => {
    it("should format error without details", () => {
      const error = new NotFoundError("User not found");
      const response = formatErrorResponse(error);

      expect(response).toEqual({
        success: false,
        error: {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: "User not found",
        },
      });
    });

    it("should format error with details", () => {
      const error = new ValidationError("Invalid input", { field: "email" });
      const response = formatErrorResponse(error);

      expect(response).toEqual({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_FAILED,
          message: "Invalid input",
          details: { field: "email" },
        },
      });
    });
  });
});
