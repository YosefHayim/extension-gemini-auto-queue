import posthog from "posthog-js";

import type { GeminiMode, GeminiTool, QueueStatus } from "@/backend/types";

const POSTHOG_API_KEY = (import.meta.env.VITE_POSTHOG_API_KEY as string | undefined) ?? "";
const POSTHOG_HOST =
  (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://us.i.posthog.com";

export const AnalyticsEvent = {
  QUEUE_ITEM_ADDED: "queue_item_added",
  QUEUE_ITEM_REMOVED: "queue_item_removed",
  QUEUE_ITEM_STARTED: "queue_item_started",
  QUEUE_ITEM_COMPLETED: "queue_item_completed",
  QUEUE_ITEM_FAILED: "queue_item_failed",
  QUEUE_ITEM_RETRIED: "queue_item_retried",
  QUEUE_CLEARED: "queue_cleared",
  QUEUE_PROCESSING_STARTED: "queue_processing_started",
  QUEUE_PROCESSING_PAUSED: "queue_processing_paused",
  QUEUE_PROCESSING_STOPPED: "queue_processing_stopped",

  TOOL_SELECTED: "tool_selected",
  MODE_SELECTED: "mode_selected",
  TEMPLATE_USED: "template_used",
  TEMPLATE_CREATED: "template_created",
  FOLDER_CREATED: "folder_created",
  BULK_ACTION_USED: "bulk_action_used",
  CSV_IMPORTED: "csv_imported",
  EXPORT_USED: "export_used",
  SCHEDULE_SET: "schedule_set",
  SCHEDULE_CANCELLED: "schedule_cancelled",
  DRIP_FEED_ENABLED: "drip_feed_enabled",
  AI_OPTIMIZATION_USED: "ai_optimization_used",

  SIDEPANEL_OPENED: "sidepanel_opened",
  SETTINGS_CHANGED: "settings_changed",
  THEME_CHANGED: "theme_changed",
  ONBOARDING_COMPLETED: "onboarding_completed",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

let isInitialized = false;
let isEnabled = true;

export function initAnalytics(enabled = true): void {
  isEnabled = enabled;

  if (!POSTHOG_API_KEY) {
    return;
  }

  if (!enabled) {
    return;
  }

  if (isInitialized) {
    return;
  }

  try {
    posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false,
      disable_session_recording: true,
      respect_dnt: true,
      persistence: "localStorage",
      autocapture: false,
      bootstrap: {
        distinctID: getOrCreateDistinctId(),
      },
    });

    isInitialized = true;
  } catch {
    // Intentionally empty - analytics failures should not affect app functionality
  }
}

function getOrCreateDistinctId(): string {
  const storageKey = "nano_flow_analytics_id";
  let distinctId = localStorage.getItem(storageKey);

  if (!distinctId) {
    distinctId = `anon_${crypto.randomUUID()}`;
    localStorage.setItem(storageKey, distinctId);
  }

  return distinctId;
}

export function setAnalyticsEnabled(enabled: boolean): void {
  isEnabled = enabled;

  if (!POSTHOG_API_KEY) {
    return;
  }

  if (enabled && !isInitialized) {
    initAnalytics(true);
  } else if (!enabled && isInitialized) {
    posthog.opt_out_capturing();
  } else if (enabled && isInitialized) {
    posthog.opt_in_capturing();
  }
}

export function isAnalyticsEnabled(): boolean {
  return isEnabled && isInitialized;
}

export function trackEvent(
  eventName: AnalyticsEventName,
  properties?: Record<string, unknown>
): void {
  if (!isEnabled || !isInitialized || !POSTHOG_API_KEY) {
    return;
  }

  try {
    posthog.capture(eventName, {
      ...properties,
      extension_version: chrome.runtime.getManifest().version,
      timestamp: Date.now(),
    });
  } catch {
    // Intentionally empty - analytics failures should not affect app functionality
  }
}

export function trackQueueItemAdded(properties: {
  tool?: GeminiTool;
  mode?: GeminiMode;
  hasImages: boolean;
  itemCount: number;
}): void {
  trackEvent(AnalyticsEvent.QUEUE_ITEM_ADDED, properties);
}

export function trackQueueItemCompleted(properties: {
  tool?: GeminiTool;
  mode?: GeminiMode;
  processingTimeMs: number;
}): void {
  trackEvent(AnalyticsEvent.QUEUE_ITEM_COMPLETED, properties);
}

export function trackQueueItemFailed(properties: {
  tool?: GeminiTool;
  mode?: GeminiMode;
  errorCategory: string;
  retryCount: number;
}): void {
  trackEvent(AnalyticsEvent.QUEUE_ITEM_FAILED, properties);
}

export function trackQueueItemStatusChange(properties: {
  previousStatus: QueueStatus;
  newStatus: QueueStatus;
  tool?: GeminiTool;
}): void {
  const eventMap: Record<QueueStatus, AnalyticsEventName | null> = {
    Pending: null,
    Processing: AnalyticsEvent.QUEUE_ITEM_STARTED,
    Completed: AnalyticsEvent.QUEUE_ITEM_COMPLETED,
    Failed: AnalyticsEvent.QUEUE_ITEM_FAILED,
  };

  const event = eventMap[properties.newStatus];
  if (event) {
    trackEvent(event, {
      previous_status: properties.previousStatus,
      tool: properties.tool,
    });
  }
}

export function trackToolSelected(tool: GeminiTool): void {
  trackEvent(AnalyticsEvent.TOOL_SELECTED, { tool });
}

export function trackModeSelected(mode: GeminiMode): void {
  trackEvent(AnalyticsEvent.MODE_SELECTED, { mode });
}

export function trackBulkAction(actionType: string, itemCount: number): void {
  trackEvent(AnalyticsEvent.BULK_ACTION_USED, {
    action_type: actionType,
    item_count: itemCount,
  });
}

export function trackCSVImport(itemCount: number, hasImages: boolean): void {
  trackEvent(AnalyticsEvent.CSV_IMPORTED, {
    item_count: itemCount,
    has_images: hasImages,
  });
}

export function trackExport(format: string, itemCount: number): void {
  trackEvent(AnalyticsEvent.EXPORT_USED, {
    format,
    item_count: itemCount,
  });
}

export function trackSettingsChanged(settingKey: string): void {
  trackEvent(AnalyticsEvent.SETTINGS_CHANGED, {
    setting_key: settingKey,
  });
}

export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (!isEnabled || !isInitialized || !POSTHOG_API_KEY) {
    return;
  }

  try {
    posthog.identify(userId, traits);
  } catch {
    // Intentionally empty - analytics failures should not affect app functionality
  }
}

export function resetAnalytics(): void {
  if (!isInitialized || !POSTHOG_API_KEY) {
    return;
  }

  try {
    posthog.reset();
  } catch {
    // Intentionally empty - analytics failures should not affect app functionality
  }
}
