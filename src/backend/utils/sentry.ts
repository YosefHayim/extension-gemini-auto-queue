import * as Sentry from "@sentry/react";

const SENTRY_DSN =
  "https://5c533eb20d4e26c213cb1e23d3f5c31e@o4510712201084928.ingest.us.sentry.io/4510772842725376";
const IS_PRODUCTION = import.meta.env.PROD;
const APP_VERSION = "2.1.0";

export type SentryContext = "background" | "sidepanel" | "content" | "popup" | "options";

interface SentryInitOptions {
  context: SentryContext;
  enableReplay?: boolean;
  enableTracing?: boolean;
}

let isInitialized = false;

export function isSentryEnabled(): boolean {
  return isInitialized;
}

function buildIntegrations(
  context: SentryContext,
  enableTracing: boolean,
  enableReplay: boolean
): Sentry.BrowserOptions["integrations"] {
  return (defaults) => {
    const result = [...defaults];

    result.push(Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }));

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

  if (isInitialized) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    release: `gqmini@${APP_VERSION}`,
    environment: IS_PRODUCTION ? "production" : "development",
    skipBrowserExtensionCheck: true,
    integrations: buildIntegrations(context, enableTracing, enableReplay),
    tracesSampleRate: enableTracing ? (IS_PRODUCTION ? 0.1 : 1.0) : 0,
    replaysSessionSampleRate: enableReplay ? 0.1 : 0,
    replaysOnErrorSampleRate: enableReplay ? 1.0 : 0,
    _experiments: {
      enableLogs: true,
    },
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

  isInitialized = true;
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

interface SpanOptions {
  op: string;
  name: string;
  attributes?: Record<string, string | number | boolean>;
}

export function startSpan<T>(options: SpanOptions, callback: () => T): T {
  if (!isSentryEnabled()) return callback();

  return Sentry.startSpan(
    {
      op: options.op,
      name: options.name,
    },
    (span) => {
      if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }
      return callback();
    }
  );
}

export async function startSpanAsync<T>(
  options: SpanOptions,
  callback: () => Promise<T>
): Promise<T> {
  if (!isSentryEnabled()) return callback();

  return Sentry.startSpan(
    {
      op: options.op,
      name: options.name,
    },
    async (span) => {
      if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }
      return callback();
    }
  );
}

export { Sentry };
