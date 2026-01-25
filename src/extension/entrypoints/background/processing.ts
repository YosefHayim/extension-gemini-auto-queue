import {
  getQueue,
  getSettings,
  isExtensionEnabled,
  updateQueueItem,
} from "@/backend/services/storageService";
import { GeminiTool, MessageType, QueueStatus } from "@/backend/types";
import { logger } from "@/backend/utils/logger";

import { broadcastMessage, sendToContentScript } from "./contentScriptBridge";
import { handleProcessingError } from "./errorHandling";
import { getProcessingState, setProcessingState } from "./state";
import { findGeminiTab } from "./tabManagement";

const log = logger.module("Processing");

let processingController: AbortController | null = null;

export async function startProcessing(): Promise<void> {
  log.info("start", "startProcessing() called");

  try {
    const enabled = await isExtensionEnabled();
    log.debug("start", "Extension enabled check", { enabled });
    if (!enabled) {
      log.info("start", "Extension disabled, stopping");
      broadcastMessage({ type: MessageType.STOP_PROCESSING });
      return;
    }

    await setProcessingState({ isProcessing: true, isPaused: false });
    processingController = new AbortController();

    broadcastMessage({ type: MessageType.PROCESS_QUEUE });

    const tabId = await findGeminiTab();
    log.debug("start", "Gemini tab lookup", { tabId });
    if (!tabId) {
      log.warn("start", "No Gemini tab found, stopping");
      broadcastMessage({ type: MessageType.STOP_PROCESSING });
      await setProcessingState({ isProcessing: false });
      return;
    }

    let state = await getProcessingState();
    while (state.isProcessing && !state.isPaused) {
      const queue = await getQueue();
      const nextItem = queue.find((item) => item.status === QueueStatus.Pending);

      if (!nextItem) {
        await setProcessingState({ isProcessing: false });
        break;
      }

      const startTime = Date.now();
      await updateQueueItem(nextItem.id, {
        status: QueueStatus.Processing,
        startTime,
      });

      broadcastMessage({ type: MessageType.UPDATE_QUEUE });

      try {
        const settings = await getSettings();
        let tool = nextItem.tool || settings.defaultTool || GeminiTool.IMAGE;

        if (settings.useToolSequence && settings.toolSequence.length > 0) {
          const queueData = await getQueue();
          const itemIndex = queueData.findIndex((item) => item.id === nextItem.id);
          if (itemIndex >= 0) {
            tool = settings.toolSequence[itemIndex % settings.toolSequence.length];
          }
        }

        const imageStorageKey = `nano_flow_images_${nextItem.id}`;
        const images = nextItem.images ?? [];
        if (images.length > 0) {
          await chrome.storage.session.set({ [imageStorageKey]: images });
        }

        const response = await sendToContentScript({
          type: MessageType.PASTE_PROMPT,
          payload: {
            prompt: nextItem.finalPrompt,
            tool,
            imageStorageKey: images.length > 0 ? imageStorageKey : undefined,
            mode: nextItem.mode,
          },
        });

        if (images.length > 0) {
          await chrome.storage.session.remove(imageStorageKey);
        }

        const endTime = Date.now();
        const completionTimeSeconds = startTime ? (endTime - startTime) / 1000 : undefined;

        if (response.success) {
          await updateQueueItem(nextItem.id, {
            status: QueueStatus.Completed,
            endTime,
            completionTimeSeconds,
            results: {
              flash: {
                url: "",
                modelName: "Gemini Web",
                timestamp: endTime,
              },
            },
          });
        } else {
          throw new Error(response.error || "Web automation failed");
        }

        const waitTime = settings.dripFeed
          ? 8000 + Math.random() * 7000
          : 1500 + Math.random() * 1500;

        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } catch (error) {
        await handleProcessingError(nextItem, error);
      }

      broadcastMessage({ type: MessageType.UPDATE_QUEUE });

      state = await getProcessingState();
    }

    const finalState = await getProcessingState();
    if (finalState.isPaused) {
      await setProcessingState({ isProcessing: false });
      broadcastMessage({ type: MessageType.PAUSE_PROCESSING });
    } else {
      broadcastMessage({ type: MessageType.STOP_PROCESSING });
    }
  } catch (error) {
    log.error("start", "startProcessing error", error);
    await setProcessingState({ isProcessing: false, isPaused: false });
    broadcastMessage({ type: MessageType.STOP_PROCESSING });
  }
}

export async function pauseProcessing(): Promise<void> {
  await setProcessingState({ isPaused: true });
}

export async function stopProcessing(): Promise<void> {
  await setProcessingState({ isProcessing: false, isPaused: false });
  if (processingController) {
    processingController.abort();
    processingController = null;
  }
}

export async function restoreProcessingStateOnStartup(): Promise<void> {
  const state = await getProcessingState();
  log.info("restore", "Restored processing state", state);

  if (state.isProcessing && !state.isPaused) {
    log.info("restore", "Resuming processing after service worker restart");
    startProcessing();
  }
}
