import { PostHog } from "posthog-node";
import * as Sentry from "@sentry/node";
import { env } from "../config/env.js";
import { ANALYTICS_EVENTS } from "../constants/index.js";

let posthogClient: PostHog | null = null;

export function initializeAnalytics(): void {
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
      integrations: [Sentry.httpIntegration()],
    });
  }

  if (env.POSTHOG_API_KEY) {
    posthogClient = new PostHog(env.POSTHOG_API_KEY, {
      host: env.POSTHOG_HOST,
      flushAt: 20,
      flushInterval: 10000,
    });
  }
}

export async function shutdownAnalytics(): Promise<void> {
  if (posthogClient) {
    await posthogClient.shutdown();
  }

  await Sentry.close(2000);
}

export function captureException(error: Error, context?: Record<string, unknown>): void {
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info"): void {
  Sentry.captureMessage(message, level);
}

export function trackEvent(
  userId: string,
  event: string,
  properties?: Record<string, unknown>
): void {
  if (!posthogClient) return;

  posthogClient.capture({
    distinctId: userId,
    event,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
}

export function trackUserEvent(
  userId: string,
  event: keyof typeof ANALYTICS_EVENTS | string,
  properties?: Record<string, unknown>
): void {
  trackEvent(userId, event, properties);
}

export function trackSubscriptionEvent(
  userId: string,
  event: string,
  properties?: Record<string, unknown>
): void {
  trackEvent(userId, event, {
    ...properties,
    category: "subscription",
  });
}

export function trackFeatureUsage(
  userId: string,
  feature: string,
  properties?: Record<string, unknown>
): void {
  trackEvent(userId, ANALYTICS_EVENTS.FEATURE_USED, {
    feature,
    ...properties,
  });
}

export function trackCreditsConsumed(
  userId: string,
  credits: number,
  feature: string,
  remaining: number
): void {
  trackEvent(userId, ANALYTICS_EVENTS.CREDITS_CONSUMED, {
    credits,
    feature,
    remaining,
  });
}

export function identifyUser(
  userId: string,
  properties: {
    email: string;
    name?: string | null;
    plan?: string;
    createdAt?: Date;
  }
): void {
  if (!posthogClient) return;

  posthogClient.identify({
    distinctId: userId,
    properties: {
      email: properties.email,
      name: properties.name,
      plan: properties.plan,
      created_at: properties.createdAt?.toISOString(),
    },
  });
}

export function setUserProperties(userId: string, properties: Record<string, unknown>): void {
  if (!posthogClient) return;

  posthogClient.identify({
    distinctId: userId,
    properties,
  });
}

export function trackApiError(
  userId: string | null,
  endpoint: string,
  errorCode: string,
  errorMessage: string
): void {
  trackEvent(userId ?? "anonymous", ANALYTICS_EVENTS.API_ERROR, {
    endpoint,
    errorCode,
    errorMessage,
  });
}
