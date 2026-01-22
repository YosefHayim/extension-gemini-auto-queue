import { useCallback } from "react";
import { toast } from "sonner";

import { improvePrompt } from "@/services/geminiService";
import { hasAnyAIKey, setQueue } from "@/services/storageService";
import { QueueStatus, type AppSettings, type QueueItem } from "@/types";

import type { ResetFilter } from "@/components/BulkActionsDialog";

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

  return {
    handleBulkAttachImages,
    handleBulkAIOptimize,
    handleBulkModify,
    handleBulkRemoveText,
    handleBulkRemoveFiles,
  };
}

export type { ResetFilter };
