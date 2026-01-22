import type { QueueItem } from "@/types";
import { QueueStatus } from "@/types";
import { calculateBackoff, categorizeError, shouldRetry } from "@/utils/retryStrategy";
import { getSettings, updateQueueItem } from "@/services/storageService";

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

    await new Promise((resolve) => setTimeout(resolve, delay));
  } else {
    await updateQueueItem(nextItem.id, {
      status: QueueStatus.Failed,
      retryInfo: currentRetry,
      error: errorMessage,
    });
  }
}
