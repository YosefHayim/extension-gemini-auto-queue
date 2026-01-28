import { useCallback } from "react";
import { toast } from "sonner";

import { improvePrompt } from "@/backend/services/geminiService";
import { hasAnyAIKey, setQueue } from "@/backend/services/storageService";
import {
  type GeminiMode,
  type GeminiTool,
  QueueStatus,
  type AppSettings,
  type QueueItem,
} from "@/backend/types";

import type { ResetFilter } from "@/extension/components/BulkActionsDialog";

interface UseBulkModifyActionsProps {
  queue: QueueItem[];
  setQueueState: React.Dispatch<React.SetStateAction<QueueItem[]>>;
  constructFinalPrompt: (original: string) => string;
  settings: AppSettings;
}

export function useBulkModifyActions({
  queue,
  setQueueState,
  constructFinalPrompt,
  settings,
}: UseBulkModifyActionsProps) {
  const handleBulkAttachImages = useCallback(
    async (images: string[], selectedIds?: string[]) => {
      const targetIds = selectedIds ? new Set(selectedIds) : null;
      const updatedQueue = queue.map((item) => {
        const isTarget = targetIds ? targetIds.has(item.id) : item.status === QueueStatus.Pending;
        return isTarget ? { ...item, images: [...(item.images ?? []), ...images] } : item;
      });
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      const count = targetIds
        ? targetIds.size
        : queue.filter((i) => i.status === QueueStatus.Pending).length;
      toast.success(`Attached ${images.length} image(s) to ${count} prompts`);
    },
    [queue, setQueueState]
  );

  const handleBulkAIOptimize = useCallback(
    async (instructions: string, selectedIds?: string[]) => {
      if (!hasAnyAIKey(settings)) {
        toast.error("No API key configured. Add one in Settings > API.");
        return;
      }

      const targetIds = selectedIds ? new Set(selectedIds) : null;
      const targetItems = targetIds
        ? queue.filter((item) => targetIds.has(item.id))
        : queue.filter((item) => item.status === QueueStatus.Pending);

      if (targetItems.length === 0) {
        toast.error("No prompts to optimize");
        return;
      }

      toast.info(`Optimizing ${targetItems.length} prompts with AI...`);

      try {
        const optimizedPromises = targetItems.map(async (item) => {
          const enhancedPrompt = await improvePrompt(
            `${item.originalPrompt}\n\nInstructions: ${instructions}`
          );
          return {
            id: item.id,
            originalPrompt: enhancedPrompt,
            finalPrompt: constructFinalPrompt(enhancedPrompt),
          };
        });

        const optimizedResults = await Promise.all(optimizedPromises);

        const updatedQueue = queue.map((item) => {
          const optimized = optimizedResults.find((r) => r.id === item.id);
          return optimized
            ? {
                ...item,
                originalPrompt: optimized.originalPrompt,
                finalPrompt: optimized.finalPrompt,
              }
            : item;
        });

        setQueueState(updatedQueue);
        await setQueue(updatedQueue);
        toast.success(`Optimized ${targetItems.length} prompts with AI`);
      } catch {
        toast.error("Failed to optimize prompts. Check your API key.");
      }
    },
    [queue, constructFinalPrompt, settings, setQueueState]
  );

  const handleBulkModify = useCallback(
    async (text: string, position: "prepend" | "append", selectedIds?: string[]) => {
      const targetIds = selectedIds ? new Set(selectedIds) : null;
      let modifiedCount = 0;
      const updatedQueue = queue.map((item) => {
        const isTarget = targetIds ? targetIds.has(item.id) : item.status === QueueStatus.Pending;
        if (!isTarget) return item;
        modifiedCount++;
        const newPrompt =
          position === "prepend"
            ? `${text} ${item.originalPrompt}`
            : `${item.originalPrompt} ${text}`;
        return {
          ...item,
          originalPrompt: newPrompt,
          finalPrompt: constructFinalPrompt(newPrompt),
        };
      });
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.success(`Modified ${modifiedCount} prompts`);
    },
    [queue, constructFinalPrompt, setQueueState]
  );

  const handleBulkRemoveText = useCallback(
    async (textToRemove: string, selectedIds?: string[]) => {
      if (!textToRemove.trim()) return;

      const targetIds = selectedIds ? new Set(selectedIds) : null;
      let modifiedCount = 0;
      const updatedQueue = queue.map((item) => {
        const isTarget = targetIds ? targetIds.has(item.id) : item.status === QueueStatus.Pending;
        if (!isTarget) return item;
        if (!item.finalPrompt.toLowerCase().includes(textToRemove.toLowerCase())) return item;

        modifiedCount++;
        const newOriginalPrompt = item.originalPrompt
          .split(textToRemove)
          .join("")
          .replace(/\s+/g, " ")
          .trim();
        return {
          ...item,
          originalPrompt: newOriginalPrompt,
          finalPrompt: constructFinalPrompt(newOriginalPrompt),
        };
      });

      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.success(`Removed text from ${modifiedCount} prompt${modifiedCount !== 1 ? "s" : ""}`);
    },
    [queue, constructFinalPrompt, setQueueState]
  );

  const handleBulkRemoveFiles = useCallback(
    async (indices: number[] | "all", selectedIds?: string[]) => {
      const targetIds = selectedIds ? new Set(selectedIds) : null;
      const targetItems = targetIds
        ? queue.filter((item) => targetIds.has(item.id))
        : queue.filter((item) => item.status === QueueStatus.Pending);

      const allUniqueImages: string[] = [];
      targetItems.forEach((item) => {
        item.images?.forEach((img) => {
          if (!allUniqueImages.includes(img)) {
            allUniqueImages.push(img);
          }
        });
      });

      const imagesToRemove =
        indices === "all"
          ? new Set(allUniqueImages)
          : new Set(indices.map((i) => allUniqueImages[i]));

      let totalRemoved = 0;
      const updatedQueue = queue.map((item) => {
        const isTarget = targetIds ? targetIds.has(item.id) : item.status === QueueStatus.Pending;
        if (!isTarget || !item.images?.length) return item;

        const newImages = item.images.filter((img) => !imagesToRemove.has(img));
        const removedFromThis = item.images.length - newImages.length;
        totalRemoved += removedFromThis;

        return { ...item, images: newImages };
      });

      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.success(`Removed ${totalRemoved} image${totalRemoved !== 1 ? "s" : ""} from prompts`);
    },
    [queue, setQueueState]
  );

  const handleBulkShuffle = useCallback(
    async (selectedIds?: string[]) => {
      const targetIds = selectedIds ? new Set(selectedIds) : null;

      const shuffleArray = <T>(arr: T[]): T[] => {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      let updatedQueue: QueueItem[];
      if (targetIds) {
        const selectedItems = queue.filter((item) => targetIds.has(item.id));
        const otherItems = queue.filter((item) => !targetIds.has(item.id));
        const shuffledSelected = shuffleArray(selectedItems);

        updatedQueue = [];
        let selectedIndex = 0;
        for (const item of queue) {
          if (targetIds.has(item.id)) {
            updatedQueue.push(shuffledSelected[selectedIndex++]);
          } else {
            const otherItem = otherItems.find((o) => o.id === item.id);
            if (otherItem) {
              updatedQueue.push(otherItem);
            }
          }
        }
      } else {
        const pendingItems = queue.filter((i) => i.status === QueueStatus.Pending);
        const nonPendingItems = queue.filter((i) => i.status !== QueueStatus.Pending);
        updatedQueue = [...shuffleArray(pendingItems), ...nonPendingItems];
      }

      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      const count = targetIds
        ? targetIds.size
        : queue.filter((i) => i.status === QueueStatus.Pending).length;
      toast.success(`Shuffled ${count} prompts`);
    },
    [queue, setQueueState]
  );

  const handleBulkMoveToTop = useCallback(
    async (selectedIds?: string[]) => {
      if (!selectedIds || selectedIds.length === 0) {
        toast.info("Select items to move to top");
        return;
      }

      const targetIds = new Set(selectedIds);
      const selectedItems = queue.filter((item) => targetIds.has(item.id));
      const otherItems = queue.filter((item) => !targetIds.has(item.id));
      const updatedQueue = [...selectedItems, ...otherItems];

      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.success(`Moved ${selectedItems.length} items to top`);
    },
    [queue, setQueueState]
  );

  const handleBulkRetryFailed = useCallback(
    async (selectedIds?: string[]) => {
      const targetIds = selectedIds ? new Set(selectedIds) : null;
      let retryCount = 0;

      const updatedQueue = queue.map((item) => {
        const isTarget = targetIds ? targetIds.has(item.id) : item.status === QueueStatus.Failed;
        if (isTarget && item.status === QueueStatus.Failed) {
          retryCount++;
          return {
            ...item,
            status: QueueStatus.Pending,
            error: undefined,
            retryInfo: undefined,
          };
        }
        return item;
      });

      if (retryCount === 0) {
        toast.info("No failed items to retry");
        return;
      }

      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.success(`Reset ${retryCount} failed items to pending`);
    },
    [queue, setQueueState]
  );

  const handleBulkChangeTool = useCallback(
    async (tool: GeminiTool, selectedIds?: string[]) => {
      const targetIds = selectedIds ? new Set(selectedIds) : null;
      let modifiedCount = 0;

      const updatedQueue = queue.map((item) => {
        const isTarget = targetIds ? targetIds.has(item.id) : item.status === QueueStatus.Pending;
        if (isTarget) {
          modifiedCount++;
          return { ...item, tool };
        }
        return item;
      });

      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.success(`Changed tool for ${modifiedCount} prompts`);
    },
    [queue, setQueueState]
  );

  const handleBulkChangeMode = useCallback(
    async (mode: GeminiMode, selectedIds?: string[]) => {
      const targetIds = selectedIds ? new Set(selectedIds) : null;
      let modifiedCount = 0;

      const updatedQueue = queue.map((item) => {
        const isTarget = targetIds ? targetIds.has(item.id) : item.status === QueueStatus.Pending;
        if (isTarget) {
          modifiedCount++;
          return { ...item, mode };
        }
        return item;
      });

      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.success(`Changed mode for ${modifiedCount} prompts`);
    },
    [queue, setQueueState]
  );

  const handleBulkDelete = useCallback(
    async (selectedIds?: string[]) => {
      const targetIds = selectedIds ? new Set(selectedIds) : null;

      const updatedQueue = targetIds
        ? queue.filter((item) => !targetIds.has(item.id))
        : queue.filter((item) => item.status !== QueueStatus.Pending);

      const deletedCount = queue.length - updatedQueue.length;

      if (deletedCount === 0) {
        toast.info("No items to delete");
        return;
      }

      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.success(`Deleted ${deletedCount} item${deletedCount !== 1 ? "s" : ""}`);
    },
    [queue, setQueueState]
  );

  const handleBulkDeleteByPattern = useCallback(
    async (pattern: string, selectedIds?: string[]) => {
      if (!pattern.trim()) {
        toast.info("Please enter a pattern to match");
        return;
      }

      const targetIds = selectedIds ? new Set(selectedIds) : null;
      const patternLower = pattern.toLowerCase();

      const updatedQueue = queue.filter((item) => {
        const isTarget = targetIds ? targetIds.has(item.id) : item.status === QueueStatus.Pending;
        if (!isTarget) return true;
        return !item.finalPrompt.toLowerCase().includes(patternLower);
      });

      const deletedCount = queue.length - updatedQueue.length;

      if (deletedCount === 0) {
        toast.info("No items match the pattern");
        return;
      }

      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.success(
        `Deleted ${deletedCount} item${deletedCount !== 1 ? "s" : ""} matching pattern`
      );
    },
    [queue, setQueueState]
  );

  return {
    handleBulkAttachImages,
    handleBulkAIOptimize,
    handleBulkModify,
    handleBulkRemoveText,
    handleBulkRemoveFiles,
    handleBulkShuffle,
    handleBulkMoveToTop,
    handleBulkRetryFailed,
    handleBulkChangeTool,
    handleBulkChangeMode,
    handleBulkDelete,
    handleBulkDeleteByPattern,
  };
}

export type { ResetFilter };
