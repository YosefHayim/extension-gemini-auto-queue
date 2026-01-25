import { useCallback, useEffect, useState } from "react";

import { getQueue, onQueueChange, setQueue } from "@/backend/services/storageService";
import {
  type GeminiTool,
  MessageType,
  QueueStatus,
  type AppSettings,
  type QueueItem,
} from "@/backend/types";
import { expandPromptWithVariables } from "@/backend/utils/variableExpander";

interface UseQueueReturn {
  queue: QueueItem[];
  isProcessing: boolean;
  isLoading: boolean;
  addToQueue: (items: QueueItem[]) => Promise<void>;
  removeFromQueue: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  clearAll: () => Promise<void>;
  startProcessing: () => Promise<void>;
  stopProcessing: () => Promise<void>;
  toggleProcessing: () => Promise<void>;
}

/**
 * React hook for managing the generation queue
 * @returns Queue state and control functions
 */
export function useQueue(): UseQueueReturn {
  const [queue, setQueueState] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial queue
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const queueData = (await getQueue()) ?? [];
        setQueueState(queueData);
        const hasProcessing = queueData.some((item) => item.status === QueueStatus.Processing);
        setIsProcessing(hasProcessing);
      } catch {
        setQueueState([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadQueue();
  }, []);

  // Listen for queue changes from IndexedDB
  useEffect(() => {
    const cleanup = onQueueChange((newQueue) => {
      const safeQueue = newQueue ?? [];
      setQueueState(safeQueue);
      const hasProcessing = safeQueue.some((item) => item.status === QueueStatus.Processing);
      setIsProcessing(hasProcessing);
    });

    return cleanup;
  }, []);

  // Listen for processing state messages from background
  useEffect(() => {
    const handleMessage = (message: { type: MessageType }) => {
      if (message.type === MessageType.PROCESS_QUEUE) {
        setIsProcessing(true);
      } else if (message.type === MessageType.STOP_PROCESSING) {
        setIsProcessing(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const addToQueue = useCallback(
    async (items: QueueItem[]) => {
      const updatedQueue = [...queue, ...items];
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
    },
    [queue]
  );

  const removeFromQueue = useCallback(
    async (id: string) => {
      const updatedQueue = queue.filter((item) => item.id !== id);
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
    },
    [queue]
  );

  const clearCompleted = useCallback(async () => {
    const updatedQueue = queue.filter((item) => item.status !== QueueStatus.Completed);
    setQueueState(updatedQueue);
    await setQueue(updatedQueue);
  }, [queue]);

  const clearAll = useCallback(async () => {
    setQueueState([]);
    await setQueue([]);
  }, []);

  const startProcessing = useCallback(async () => {
    await chrome.runtime.sendMessage({ type: MessageType.PROCESS_QUEUE });
    setIsProcessing(true);
  }, []);

  const stopProcessing = useCallback(async () => {
    await chrome.runtime.sendMessage({ type: MessageType.STOP_PROCESSING });
    setIsProcessing(false);
  }, []);

  const toggleProcessing = useCallback(async () => {
    if (isProcessing) {
      await stopProcessing();
    } else {
      await startProcessing();
    }
  }, [isProcessing, startProcessing, stopProcessing]);

  return {
    queue,
    isProcessing,
    isLoading,
    addToQueue,
    removeFromQueue,
    clearCompleted,
    clearAll,
    startProcessing,
    stopProcessing,
    toggleProcessing,
  };
}

/**
 * Helper function to construct the final prompt with settings
 */
export function constructFinalPrompt(
  original: string,
  settings: Pick<AppSettings, "prefix" | "suffix" | "globalNegatives" | "globalNegativesEnabled">
): string {
  let prompt = `${settings.prefix} ${original} ${settings.suffix}`.trim();
  if (settings.globalNegativesEnabled && settings.globalNegatives.trim()) {
    prompt += `. NOT ${settings.globalNegatives.trim()}`;
  }
  return prompt;
}

export function createQueueItems(
  prompts: string[],
  settings: Pick<
    AppSettings,
    "prefix" | "suffix" | "globalNegatives" | "globalNegativesEnabled" | "globalVariables"
  >,
  images?: string[],
  tool?: GeminiTool
): QueueItem[] {
  const expandedPrompts: string[] = [];

  for (const prompt of prompts) {
    const expanded = expandPromptWithVariables(prompt, settings.globalVariables ?? []);
    expandedPrompts.push(...expanded);
  }

  return expandedPrompts.map((prompt) => ({
    id: Math.random().toString(36).substring(2, 9),
    originalPrompt: prompt,
    finalPrompt: constructFinalPrompt(prompt, settings),
    status: QueueStatus.Pending,
    tool,
    images: images && images.length > 0 ? [...images] : undefined,
  }));
}

export default useQueue;
