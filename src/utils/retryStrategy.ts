import { ErrorCategory } from "@/types";

export function categorizeError(error: string): ErrorCategory {
  const lowerError = error.toLowerCase();

  if (
    lowerError.includes("rate limit") ||
    lowerError.includes("429") ||
    lowerError.includes("too many")
  ) {
    return ErrorCategory.RATE_LIMIT;
  }
  if (
    lowerError.includes("network") ||
    lowerError.includes("fetch") ||
    lowerError.includes("connection") ||
    lowerError.includes("failed to fetch")
  ) {
    return ErrorCategory.NETWORK;
  }
  if (
    lowerError.includes("policy") ||
    lowerError.includes("blocked") ||
    lowerError.includes("inappropriate") ||
    lowerError.includes("safety") ||
    lowerError.includes("harmful")
  ) {
    return ErrorCategory.CONTENT_POLICY;
  }
  if (lowerError.includes("timeout") || lowerError.includes("timed out")) {
    return ErrorCategory.TIMEOUT;
  }
  return ErrorCategory.UNKNOWN;
}

export function shouldRetry(category: ErrorCategory): boolean {
  return category !== ErrorCategory.CONTENT_POLICY;
}

export function calculateBackoff(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
  category: ErrorCategory
): number {
  let delay = baseDelayMs * Math.pow(2, attempt - 1);

  if (category === ErrorCategory.RATE_LIMIT) {
    delay *= 2;
  }

  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  delay += jitter;

  return Math.min(delay, maxDelayMs);
}

export function formatRetryDelay(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60000)}m`;
}

export function getErrorCategoryLabel(category: ErrorCategory): string {
  switch (category) {
    case ErrorCategory.RATE_LIMIT:
      return "Rate Limited";
    case ErrorCategory.NETWORK:
      return "Network Error";
    case ErrorCategory.CONTENT_POLICY:
      return "Content Policy";
    case ErrorCategory.TIMEOUT:
      return "Timeout";
    default:
      return "Unknown Error";
  }
}
