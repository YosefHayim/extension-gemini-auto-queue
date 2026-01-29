/**
 * @fileoverview User-facing messages and error descriptions
 * @description Centralized messages for consistent user communication
 */

export const ERROR_MESSAGES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: "Invalid email or password",
  AUTH_TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  AUTH_TOKEN_INVALID: "Invalid authentication token",
  AUTH_REFRESH_TOKEN_INVALID: "Your session is invalid. Please log in again.",
  AUTH_OTP_INVALID: "Invalid verification code. Please try again.",
  AUTH_OTP_EXPIRED: "Verification code has expired. Please request a new one.",
  AUTH_USER_NOT_FOUND: "No account found with this email",
  AUTH_EMAIL_EXISTS: "An account with this email already exists",
  AUTH_OAUTH_FAILED: "Authentication failed. Please try again.",
  AUTH_UNAUTHORIZED: "You must be logged in to access this resource",

  // Subscription
  SUB_NOT_FOUND: "No subscription found for this account",
  SUB_EXPIRED: "Your subscription has expired. Please renew to continue.",
  SUB_INSUFFICIENT_CREDITS: "Insufficient credits. Please upgrade your plan.",
  SUB_WEBHOOK_INVALID: "Invalid webhook signature",
  SUB_PAYMENT_FAILED: "Payment failed. Please update your billing information.",
  SUB_UPGRADE_REQUIRED: "This feature requires a paid subscription",

  // Validation
  VALIDATION_FAILED: "Please check your input and try again",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_OTP: "Please enter a valid 6-digit code",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
  OTP_RATE_LIMIT: "Too many verification attempts. Please wait before trying again.",

  // General
  INTERNAL_ERROR: "Something went wrong. Please try again later.",
  SERVICE_UNAVAILABLE: "Service temporarily unavailable. Please try again later.",
  RESOURCE_NOT_FOUND: "The requested resource was not found",
  FORBIDDEN: "You do not have permission to access this resource",
} as const;

export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: "Successfully logged in",
  LOGOUT_SUCCESS: "Successfully logged out",
  OTP_SENT: "Verification code sent to your email",
  OTP_VERIFIED: "Email verified successfully",
  PASSWORD_RESET: "Password has been reset successfully",

  // Subscription
  SUB_CREATED: "Subscription activated successfully",
  SUB_CANCELLED: "Subscription cancelled successfully",
  SUB_RESUMED: "Subscription resumed successfully",

  // User
  PROFILE_UPDATED: "Profile updated successfully",
  ACCOUNT_DELETED: "Account deleted successfully",

  // General
  OPERATION_SUCCESS: "Operation completed successfully",
} as const;

export const EMAIL_SUBJECTS = {
  OTP_VERIFICATION: "Your PromptQueue Verification Code",
  WELCOME: "Welcome to PromptQueue!",
  SUBSCRIPTION_CONFIRMED: "Your Subscription is Active",
  SUBSCRIPTION_CANCELLED: "Subscription Cancellation Confirmed",
  SUBSCRIPTION_EXPIRING: "Your Subscription is Expiring Soon",
  PAYMENT_FAILED: "Payment Failed - Action Required",
  CREDITS_LOW: "Running Low on Credits",
} as const;
