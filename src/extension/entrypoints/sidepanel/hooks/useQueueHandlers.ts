import { useCallback } from "react";
import { toast } from "sonner";

import {
  AnalyticsEvent,
  trackEvent,
  trackQueueItemAdded,
} from "@/backend/services/analyticsService";
import { setQueue, StorageQuotaError } from "@/backend/services/storageService";
import { type GeminiMode, type GeminiTool, QueueStatus, type QueueItem } from "@/backend/types";

interface UseQueueHandlersProps {
  queue: QueueItem[];
  setQueueState: React.Dispatch<React.SetStateAction<QueueItem[]>>;
  constructFinalPrompt: (original: string) => string;
  defaultTool: GeminiTool;
}

export function useQueueHandlers({
  queue,
  setQueueState,
  constructFinalPrompt,
  defaultTool,
}: UseQueueHandlersProps) {
  const handleAddToQueue = useCallback(
    async (
      text?: string,
      templateText?: string,
      images?: string[],
      tool?: GeminiTool,
      mode?: GeminiMode
    ) => {
      const sourceText = text ?? "";
      const numberedPattern = /^(?:Prompt\s+)?\d+[.:)]\s+/i;

      const newlineSplit = sourceText.split(/\n/);
      let lines = newlineSplit.flatMap((line) => {
        const trimmed = line.trim();
        if (!trimmed) return [];

        if (numberedPattern.test(trimmed)) {
          return [trimmed];
        }

        const hasMultipleCommas = (trimmed.match(/,/g) ?? []).length > 1;
        const commaBeforeCapital = /,\s+[A-Z]/;

        if (hasMultipleCommas && commaBeforeCapital.test(trimmed)) {
          return trimmed
            .split(/,\s+(?=[A-Z])/)
            .map((item) => item.trim())
            .filter((item) => item !== "");
        }

        return [trimmed];
      });

      if (lines.length === 0 && images && images.length > 0) {
        lines = [""];
      }

      if (lines.length === 0) {
        return;
      }

      const newItems: QueueItem[] = lines.map((line) => {
        const combinedPrompt = templateText ? `${line} ${templateText}` : line;
        return {
          id: Math.random().toString(36).substring(2, 9),
          originalPrompt: line,
          finalPrompt: constructFinalPrompt(combinedPrompt),
          status: QueueStatus.Pending,
          tool: tool ?? defaultTool,
          mode: mode,
          images: images && images.length > 0 ? [...images] : undefined,
        };
      });

      const updatedQueue = [...queue, ...newItems];
      setQueueState(updatedQueue);
      try {
        await setQueue(updatedQueue);

        trackQueueItemAdded({
          tool: tool ?? defaultTool,
          mode,
          hasImages: Boolean(images && images.length > 0),
          itemCount: newItems.length,
        });

        toast.success(
          `Added ${newItems.length} prompt${newItems.length !== 1 ? "s" : ""} to queue`
        );
      } catch (error) {
        setQueueState(queue);
        if (error instanceof StorageQuotaError) {
          toast.error("Storage full! Clear completed items or reduce attached images.");
        } else {
          toast.error("Failed to save queue. Please try again.");
        }
      }
    },
    [queue, constructFinalPrompt, defaultTool, setQueueState]
  );

  const handleRemoveFromQueue = useCallback(
    async (id: string) => {
      const updatedQueue = queue.filter((item) => item.id !== id);
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      trackEvent(AnalyticsEvent.QUEUE_ITEM_REMOVED);
    },
    [queue, setQueueState]
  );

  const handleRetryQueueItem = useCallback(
    async (id: string) => {
      const updatedQueue = queue.map((item) =>
        item.id === id
          ? {
              ...item,
              status: QueueStatus.Pending,
              error: undefined,
              startTime: undefined,
              endTime: undefined,
              completionTimeSeconds: undefined,
              results: undefined,
            }
          : item
      );
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.info("Prompt queued for retry");
    },
    [queue, setQueueState]
  );

  const handleReorderQueue = useCallback(
    async (newQueue: QueueItem[]) => {
      setQueueState(newQueue);
      await setQueue(newQueue);
    },
    [setQueueState]
  );

  const handleEditItem = useCallback(
    async (id: string, newPrompt: string) => {
      const updatedQueue = queue.map((item) =>
        item.id === id
          ? { ...item, originalPrompt: newPrompt, finalPrompt: constructFinalPrompt(newPrompt) }
          : item
      );
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
    },
    [queue, constructFinalPrompt, setQueueState]
  );

  const handleUpdateItemImages = useCallback(
    async (id: string, images: string[]) => {
      const updatedQueue = queue.map((item) => (item.id === id ? { ...item, images } : item));
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
    },
    [queue, setQueueState]
  );

  return {
    handleAddToQueue,
    handleRemoveFromQueue,
    handleRetryQueueItem,
    handleReorderQueue,
    handleEditItem,
    handleUpdateItemImages,
  };
}
