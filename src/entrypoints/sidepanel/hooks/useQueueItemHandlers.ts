import { useCallback } from "react";
import { toast } from "sonner";

import { improvePrompt } from "@/services/geminiService";
import { hasAnyAIKey, setQueue } from "@/services/storageService";
import { GeminiTool, MessageType, QueueStatus, type AppSettings, type QueueItem } from "@/types";

import type { SendMessageFn } from "../types";

function parseToolFromString(toolStr: string): GeminiTool | undefined {
  const toolLower = toolStr.toLowerCase().trim();
  const toolMap: Record<string, GeminiTool> = {
    image: GeminiTool.IMAGE,
    imagen: GeminiTool.IMAGE,
    canvas: GeminiTool.CANVAS,
    video: GeminiTool.VIDEO,
    veo: GeminiTool.VIDEO,
    research: GeminiTool.DEEP_RESEARCH,
    deep_research: GeminiTool.DEEP_RESEARCH,
    learning: GeminiTool.LEARNING,
    layout: GeminiTool.VISUAL_LAYOUT,
    visual_layout: GeminiTool.VISUAL_LAYOUT,
    none: GeminiTool.NONE,
    "": GeminiTool.NONE,
  };
  if (toolLower in toolMap) return toolMap[toolLower];
  const toolKey = Object.keys(GeminiTool).find(
    (key) =>
      key.toLowerCase() === toolLower ||
      GeminiTool[key as keyof typeof GeminiTool].toLowerCase() === toolLower
  );
  return toolKey ? (GeminiTool[toolKey as keyof typeof GeminiTool] as GeminiTool) : undefined;
}

interface UseQueueItemHandlersProps {
  queue: QueueItem[];
  setQueueState: React.Dispatch<React.SetStateAction<QueueItem[]>>;
  constructFinalPrompt: (original: string) => string;
  settings: AppSettings;
  sendMessage: SendMessageFn;
}

export function useQueueItemHandlers({
  queue,
  setQueueState,
  constructFinalPrompt,
  settings,
  sendMessage,
}: UseQueueItemHandlersProps) {
  const handleDuplicateItem = useCallback(
    async (id: string) => {
      const item = queue.find((i) => i.id === id);
      if (!item) return;
      const newItem: QueueItem = {
        ...item,
        id: Math.random().toString(36).substring(2, 9),
        status: QueueStatus.Pending,
        error: undefined,
        completionTimeSeconds: undefined,
        startTime: undefined,
        endTime: undefined,
      };
      const updatedQueue = [...queue, newItem];
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.success("Prompt duplicated and added to end of queue");
    },
    [queue, setQueueState]
  );

  const handleDuplicateWithAI = useCallback(
    async (id: string) => {
      if (!hasAnyAIKey(settings)) {
        toast.error("No API key configured. Add one in Settings > API to use AI optimization.");
        return;
      }
      const item = queue.find((i) => i.id === id);
      if (!item) return;
      toast.info("Optimizing prompt with AI...");
      try {
        const optimized = await improvePrompt(item.originalPrompt);
        const newItem: QueueItem = {
          ...item,
          id: Math.random().toString(36).substring(2, 9),
          originalPrompt: optimized,
          finalPrompt: constructFinalPrompt(optimized),
          status: QueueStatus.Pending,
          error: undefined,
          completionTimeSeconds: undefined,
          startTime: undefined,
          endTime: undefined,
        };
        const updatedQueue = [...queue, newItem];
        setQueueState(updatedQueue);
        await setQueue(updatedQueue);
        toast.success("AI-optimized prompt added to queue");
      } catch {
        toast.error("Failed to optimize prompt. Check your API key.");
      }
    },
    [queue, constructFinalPrompt, settings, setQueueState]
  );

  const handleRunSingleItem = useCallback(
    async (id: string) => {
      const item = queue.find((i) => i.id === id);
      if (!item) return;
      const startTime = Date.now();
      const updatedQueue = queue.map((i) =>
        i.id === id ? { ...i, status: QueueStatus.Processing, startTime } : i
      );
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.info("Running prompt...");
      try {
        const response = await sendMessage<boolean>({
          type: MessageType.PASTE_PROMPT,
          payload: {
            prompt: item.finalPrompt,
            tool: item.tool ?? settings.defaultTool,
            images: item.images ?? [],
            mode: item.mode,
          },
        });
        const endTime = Date.now();
        const completionTimeSeconds = (endTime - startTime) / 1000;
        if (response.success) {
          const completedQueue = queue.map((i) =>
            i.id === id
              ? { ...i, status: QueueStatus.Completed, endTime, completionTimeSeconds }
              : i
          );
          setQueueState(completedQueue);
          await setQueue(completedQueue);
          toast.success("Prompt completed!");
        } else {
          throw new Error(response.error ?? "Unknown error");
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        const failedQueue = queue.map((i) =>
          i.id === id ? { ...i, status: QueueStatus.Failed, error: errorMsg } : i
        );
        setQueueState(failedQueue);
        await setQueue(failedQueue);
        toast.error(errorMsg);
      }
    },
    [queue, settings.defaultTool, setQueueState, sendMessage]
  );

  const handleCsvUpload = useCallback(
    async (items: { prompt: string; tool?: string; images?: string[] }[]) => {
      const newItems: QueueItem[] = items.map((item) => ({
        id: Math.random().toString(36).substring(2, 9),
        originalPrompt: item.prompt,
        finalPrompt: constructFinalPrompt(item.prompt),
        status: QueueStatus.Pending,
        tool: (item.tool ? parseToolFromString(item.tool) : undefined) ?? settings.defaultTool,
        images: item.images && item.images.length > 0 ? [...item.images] : undefined,
      }));
      const updatedQueue = [...queue, ...newItems];
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
      toast.success(
        `Imported ${newItems.length} prompt${newItems.length !== 1 ? "s" : ""} from CSV`
      );
    },
    [queue, constructFinalPrompt, settings.defaultTool, setQueueState]
  );

  return { handleDuplicateItem, handleDuplicateWithAI, handleRunSingleItem, handleCsvUpload };
}
