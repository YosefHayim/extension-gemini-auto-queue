import { useMemo } from "react";

import { QueueStatus, type QueueItem } from "@/backend/types";

export interface QueueStats {
  pendingCount: number;
  pendingItems: QueueItem[];
  completedCount: number;
  failedCount: number;
  estimatedTimeRemaining: string | null;
}

export function useQueueStats(queue: QueueItem[]): QueueStats {
  const pendingCount = useMemo(() => {
    return queue.filter((item) => item.status === QueueStatus.Pending).length;
  }, [queue]);

  const pendingItems = useMemo(() => {
    return queue.filter((item) => item.status === QueueStatus.Pending);
  }, [queue]);

  const completedCount = useMemo(() => {
    return queue.filter((item) => item.status === QueueStatus.Completed).length;
  }, [queue]);

  const failedCount = useMemo(() => {
    return queue.filter((item) => item.status === QueueStatus.Failed).length;
  }, [queue]);

  const estimatedTimeRemaining = useMemo(() => {
    const completedItems = queue.filter(
      (item) => item.status === QueueStatus.Completed && item.completionTimeSeconds
    );
    if (completedItems.length === 0 || pendingCount === 0) return null;

    const totalTime = completedItems.reduce(
      (sum, item) => sum + (item.completionTimeSeconds ?? 0),
      0
    );
    const avgTimePerPrompt = totalTime / completedItems.length;
    const estimatedSeconds = Math.round(avgTimePerPrompt * pendingCount);

    if (estimatedSeconds < 60) {
      return `~${estimatedSeconds}s`;
    } else if (estimatedSeconds < 3600) {
      const minutes = Math.floor(estimatedSeconds / 60);
      const seconds = estimatedSeconds % 60;
      return seconds > 0 ? `~${minutes}m ${seconds}s` : `~${minutes}m`;
    } else {
      const hours = Math.floor(estimatedSeconds / 3600);
      const minutes = Math.floor((estimatedSeconds % 3600) / 60);
      return minutes > 0 ? `~${hours}h ${minutes}m` : `~${hours}h`;
    }
  }, [queue, pendingCount]);

  return {
    pendingCount,
    pendingItems,
    completedCount,
    failedCount,
    estimatedTimeRemaining,
  };
}
