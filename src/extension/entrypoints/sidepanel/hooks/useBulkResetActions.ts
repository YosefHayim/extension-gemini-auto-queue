import { useCallback } from "react";
import { toast } from "sonner";

import { setQueue } from "@/backend/services/storageService";
import { type GeminiMode, type GeminiTool, QueueStatus, type QueueItem } from "@/backend/types";

import type { ResetFilter } from "@/extension/components/BulkActionsDialog";

interface UseBulkResetActionsProps {
  queue: QueueItem[];
  setQueueState: React.Dispatch<React.SetStateAction<QueueItem[]>>;
}

export function useBulkResetActions({ queue, setQueueState }: UseBulkResetActionsProps) {
  const handleBulkReset = useCallback(
    async (filter: ResetFilter, selectedIds?: string[]) => {
      const targetIds = selectedIds ? new Set(selectedIds) : null;
      let resetCount = 0;
      const updatedQueue = queue.map((item) => {
        if (targetIds && !targetIds.has(item.id)) return item;

        const isResettable =
          item.status === QueueStatus.Completed ||
          item.status === QueueStatus.Failed ||
          item.status === QueueStatus.Processing;

        if (filter.type === "status") {
          if (filter.status && item.status === filter.status) {
            resetCount++;
            return {
              ...item,
              status: QueueStatus.Pending,
              startTime: undefined,
              endTime: undefined,
              completionTimeSeconds: undefined,
              error: undefined,
              results: undefined,
            };
          }
          return item;
        }

        if (!isResettable || item.status === QueueStatus.Processing) return item;

        let shouldReset = false;
        switch (filter.type) {
          case "all":
            shouldReset = true;
            break;
          case "text":
            shouldReset = filter.textMatch
              ? item.originalPrompt.toLowerCase().includes(filter.textMatch.toLowerCase())
              : false;
            break;
          case "hasImages":
            shouldReset = !!(item.images && item.images.length > 0);
            break;
          case "tool":
            shouldReset = filter.tool ? item.tool === filter.tool : false;
            break;
          case "mode":
            shouldReset = filter.mode ? item.mode === filter.mode : false;
            break;
        }

        if (shouldReset) {
          resetCount++;
          return {
            ...item,
            status: QueueStatus.Pending,
            startTime: undefined,
            endTime: undefined,
            completionTimeSeconds: undefined,
            error: undefined,
            results: undefined,
          };
        }
        return item;
      });

      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.success(`Reset ${resetCount} prompt${resetCount !== 1 ? "s" : ""} to pending`);
    },
    [queue, setQueueState]
  );

  const handleClearByFilter = useCallback(
    async (filter: { status?: QueueStatus; tool?: GeminiTool; mode?: GeminiMode }) => {
      const itemsToRemove = queue.filter((item) => {
        if (filter.status && item.status !== filter.status) return false;
        if (filter.tool && item.tool !== filter.tool) return false;
        if (filter.mode && item.mode !== filter.mode) return false;
        return true;
      });
      const count = itemsToRemove.length;
      const updatedQueue = queue.filter((item) => !itemsToRemove.includes(item));
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.success(`Cleared ${count} item${count !== 1 ? "s" : ""}`);
    },
    [queue, setQueueState]
  );

  const handleClearCompleted = useCallback(async () => {
    const completedCount = queue.filter((item) => item.status === QueueStatus.Completed).length;
    const updatedQueue = queue.filter((item) => item.status !== QueueStatus.Completed);
    setQueueState(updatedQueue);
    await setQueue(updatedQueue);
    if (completedCount > 0) {
      toast.success(`Cleared ${completedCount} completed item${completedCount !== 1 ? "s" : ""}`);
    }
  }, [queue, setQueueState]);

  const handleClearAll = useCallback(async () => {
    const count = queue.length;
    setQueueState([]);
    await setQueue([]);
    toast.success(`Cleared ${count} item${count !== 1 ? "s" : ""} from queue`);
  }, [queue.length, setQueueState]);

  return {
    handleBulkReset,
    handleClearByFilter,
    handleClearCompleted,
    handleClearAll,
  };
}
