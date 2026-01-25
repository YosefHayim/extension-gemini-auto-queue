import * as Sentry from "@sentry/react";

/**
 * Sentry configuration for Gemini Nano Flow Chrome Extension
 *
 * Environment: VITE_SENTRY_DSN - Your Sentry DSN
 * Get DSN: sentry.io > Settings > Projects > Client Keys (DSN)
 */

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const IS_PRODUCTION = import.meta.env.PROD;
const APP_VERSION = "2.1.0";

export type SentryContext = "background" | "sidepanel" | "content" | "popup" | "options";

interface SentryInitOptions {
  context: SentryContext;
  enableReplay?: boolean;
  enableTracing?: boolean;
}

export function isSentryEnabled(): boolean {
  return Boolean(SENTRY_DSN);
}

function buildIntegrations(
  context: SentryContext,
  enableTracing: boolean,
  enableReplay: boolean
): Sentry.BrowserOptions["integrations"] {
  return (defaults) => {
    const result = [...defaults];

    if (enableTracing && context !== "background" && context !== "content") {
      result.push(Sentry.browserTracingIntegration());
    }

    if (enableReplay && context === "sidepanel") {
      result.push(
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        })
      );
    }

    return result;
  };
}

export function initSentry(options: SentryInitOptions): void {
  const { context, enableReplay = false, enableTracing = false } = options;

  if (!SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    release: `gemini-nano-flow@${APP_VERSION}`,
    environment: IS_PRODUCTION ? "production" : "development",
    skipBrowserExtensionCheck: true,
    integrations: buildIntegrations(context, enableTracing, enableReplay),
    tracesSampleRate: enableTracing ? (IS_PRODUCTION ? 0.1 : 1.0) : 0,
    replaysSessionSampleRate: enableReplay ? 0.1 : 0,
    replaysOnErrorSampleRate: enableReplay ? 1.0 : 0,
    beforeSend(event) {
      if (event.exception?.values?.some((e) => e.value?.includes("chrome-extension://"))) {
        return null;
      }
      return event;
    },
    initialScope: {
      tags: {
        "extension.context": context,
      },
    },
  });
}

export function captureError(
  error: Error | string,
  context?: Record<string, unknown>
): string | undefined {
  if (!isSentryEnabled()) return undefined;

  const errorObj = typeof error === "string" ? new Error(error) : error;

  return Sentry.captureException(errorObj, {
    extra: context,
  });
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, unknown>
): string | undefined {
  if (!isSentryEnabled()) return undefined;

  return Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

export function setUser(user: { id?: string; email?: string } | null): void {
  if (!isSentryEnabled()) return;
  Sentry.setUser(user);
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  if (!isSentryEnabled()) return;
  Sentry.addBreadcrumb(breadcrumb);
}

export function setTag(key: string, value: string): void {
  if (!isSentryEnabled()) return;
  Sentry.setTag(key, value);
}

export function setContext(name: string, context: Record<string, unknown> | null): void {
  if (!isSentryEnabled()) return;
  Sentry.setContext(name, context);
}

export { Sentry };
