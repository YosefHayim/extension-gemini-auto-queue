import {
  trackQueueItemFailed,
  AnalyticsEvent,
  trackEvent,
} from "@/backend/services/analyticsService";
import { getSettings, updateQueueItem } from "@/backend/services/storageService";
import { QueueStatus } from "@/backend/types";
import { calculateBackoff, categorizeError, shouldRetry } from "@/backend/utils/retryStrategy";

import type { QueueItem } from "@/backend/types";

export async function handleProcessingError(nextItem: QueueItem, error: unknown): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : "Generation failed";
  const category = categorizeError(errorMessage);
  const settings = await getSettings();
  const { retryConfig } = settings;

  const currentRetry = nextItem.retryInfo ?? {
    attempts: 0,
    maxAttempts: retryConfig.maxAttempts,
    lastAttemptTime: 0,
    nextRetryTime: null,
    errorCategory: category,
  };

  currentRetry.attempts++;
  currentRetry.lastAttemptTime = Date.now();
  currentRetry.errorCategory = category;

  const canRetry =
    retryConfig.enabled &&
    shouldRetry(category) &&
    currentRetry.attempts < currentRetry.maxAttempts;

  if (canRetry && retryConfig.autoRetry) {
    const delay = calculateBackoff(
      currentRetry.attempts,
      retryConfig.baseDelayMs,
      retryConfig.maxDelayMs,
      category
    );
    currentRetry.nextRetryTime = Date.now() + delay;

    await updateQueueItem(nextItem.id, {
      status: QueueStatus.Pending,
      retryInfo: currentRetry,
      error: errorMessage,
    });

    trackEvent(AnalyticsEvent.QUEUE_ITEM_RETRIED, {
      tool: nextItem.tool,
      mode: nextItem.mode,
      error_category: category,
      retry_count: currentRetry.attempts,
    });

    await new Promise((resolve) => setTimeout(resolve, delay));
  } else {
    await updateQueueItem(nextItem.id, {
      status: QueueStatus.Failed,
      retryInfo: currentRetry,
      error: errorMessage,
    });

    trackQueueItemFailed({
      tool: nextItem.tool,
      mode: nextItem.mode,
      errorCategory: category,
      retryCount: currentRetry.attempts,
    });
  }
}
