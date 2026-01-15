import type { AppSettings, ExtensionMessage, ExtensionResponse, Folder, QueueItem } from "@/types";
import { GeminiTool, MessageType, QueueStatus } from "@/types";
import {
  getFolders,
  getQueue,
  getSettings,
  initializeQueueStorage,
  isExtensionEnabled,
  setExtensionEnabled,
  setFolders,
  setQueue,
  setSettings,
  updateQueueItem,
} from "@/services/storageService";

import { generateImage } from "@/services/geminiService";

export default defineBackground(() => {
  let isProcessing = false;
  let isPaused = false;
  let processingController: AbortController | null = null;
  let activeGeminiTabId: number | null = null;

  initializeQueueStorage();

  // Note: chrome.action.onClicked is not fired when a popup is defined
  // The popup will handle the UI, but we can still listen for clicks if popup is removed
  // For now, the popup handles the toggle UI

  // Enable side panel on supported sites and track Gemini tabs
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
      const isGeminiSite =
        tab.url.includes("gemini.google.com") || tab.url.includes("aistudio.google.com");

      if (isGeminiSite) {
        await chrome.sidePanel.setOptions({
          tabId,
          path: "sidepanel.html",
          enabled: true,
        });
        // Track this tab as potential target for automation
        activeGeminiTabId = tabId;
      }
    }
  });

  // Handle tab activation to track active Gemini tab
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab.url?.includes("gemini.google.com")) {
        activeGeminiTabId = activeInfo.tabId;
      }
    } catch {
      // Tab might not exist
    }
  });

  // Handle messages from sidepanel and content scripts
  chrome.runtime.onMessage.addListener(
    (
      message: ExtensionMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: ExtensionResponse) => void
    ) => {
      handleMessage(message, sender)
        .then((response) => {
          sendResponse(response);
        })
        .catch((error) => {
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        });

      // Return true to indicate async response
      return true;
    }
  );

  async function handleMessage(
    message: ExtensionMessage,
    sender?: chrome.runtime.MessageSender
  ): Promise<ExtensionResponse> {
    switch (message.type) {
      case MessageType.GET_QUEUE: {
        const queue = await getQueue();
        return { success: true, data: queue };
      }

      case MessageType.UPDATE_QUEUE: {
        const queue = message.payload as QueueItem[];
        await setQueue(queue);
        return { success: true };
      }

      case MessageType.GET_SETTINGS: {
        const settings = await getSettings();
        return { success: true, data: settings };
      }

      case MessageType.UPDATE_SETTINGS: {
        const settings = message.payload as AppSettings;
        await setSettings(settings);
        return { success: true };
      }

      case MessageType.GET_FOLDERS: {
        const folders = await getFolders();
        return { success: true, data: folders };
      }

      case MessageType.UPDATE_FOLDERS: {
        const folders = message.payload as Folder[];
        await setFolders(folders);
        return { success: true };
      }

      case MessageType.PROCESS_QUEUE: {
        if (!isProcessing) {
          startProcessing();
        }
        return { success: true };
      }

      case MessageType.PAUSE_PROCESSING: {
        pauseProcessing();
        return { success: true };
      }

      case MessageType.STOP_PROCESSING: {
        stopProcessing();
        return { success: true };
      }

      case MessageType.GENERATE_IMAGE: {
        const { prompt, model, images } = message.payload as {
          prompt: string;
          model: string;
          images?: string[];
        };
        try {
          const result = await generateImage({
            prompt,
            model: model as import("@/types").GeminiModel,
            imageBase64s: images,
          });
          return { success: true, data: result };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Generation failed",
          };
        }
      }

      case MessageType.OPEN_SIDE_PANEL: {
        try {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab?.id) {
            await chrome.sidePanel.setOptions({
              tabId: activeTab.id,
              path: "sidepanel.html",
              enabled: true,
            });
            await chrome.sidePanel.open({ tabId: activeTab.id });
            return { success: true };
          }
          return { success: false, error: "No active tab found" };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to open side panel",
          };
        }
      }

      case MessageType.CONTENT_SCRIPT_READY: {
        // Content script is ready - update active tab
        if (sender?.tab?.id) {
          activeGeminiTabId = sender.tab.id;
        }
        return { success: true };
      }

      case MessageType.GET_EXTENSION_ENABLED: {
        const enabled = await isExtensionEnabled();
        return { success: true, data: enabled };
      }

      case MessageType.SET_EXTENSION_ENABLED: {
        const enabled = message.payload as boolean;
        await setExtensionEnabled(enabled);
        return { success: true };
      }

      case MessageType.PASTE_PROMPT: {
        const response = await sendToContentScript(message);
        return response;
      }

      default:
        return { success: false, error: "Unknown message type" };
    }
  }

  // Find a Gemini tab to send messages to
  async function findGeminiTab(): Promise<number | null> {
    // First try the active tracked tab
    if (activeGeminiTabId) {
      try {
        const tab = await chrome.tabs.get(activeGeminiTabId);
        if (tab.url?.includes("gemini.google.com")) {
          return activeGeminiTabId;
        }
      } catch {
        activeGeminiTabId = null;
      }
    }

    // Search for any Gemini tab
    const tabs = await chrome.tabs.query({ url: "https://gemini.google.com/*" });
    if (tabs.length > 0 && tabs[0].id) {
      activeGeminiTabId = tabs[0].id;
      return activeGeminiTabId;
    }

    return null;
  }

  async function ensureContentScriptReady(tabId: number): Promise<boolean> {
    try {
      await chrome.tabs.sendMessage(tabId, { type: MessageType.PING });
      return true;
    } catch {
      console.log("[NanoFlow] Content script not ready, injecting...");
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ["content-scripts/gemini.js"],
        });
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await chrome.tabs.sendMessage(tabId, { type: MessageType.PING });
        return true;
      } catch (injectError) {
        console.error("[NanoFlow] Failed to inject content script:", injectError);
        return false;
      }
    }
  }

  function sendMessageWithTimeout<T>(
    tabId: number,
    message: ExtensionMessage,
    timeout = 300000
  ): Promise<ExtensionResponse<T>> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Message timeout after ${timeout / 1000}s`));
      }, timeout);

      chrome.tabs
        .sendMessage(tabId, message)
        .then((response) => {
          clearTimeout(timeoutId);
          resolve(response);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  async function sendToContentScript<T>(message: ExtensionMessage): Promise<ExtensionResponse<T>> {
    const tabId = await findGeminiTab();
    console.log("[NanoFlow] sendToContentScript - tabId:", tabId, "message:", message.type);
    if (!tabId) {
      throw new Error("No Gemini tab found. Please open gemini.google.com");
    }

    const isReady = await ensureContentScriptReady(tabId);
    if (!isReady) {
      throw new Error("Content script not available. Please refresh the Gemini page.");
    }

    try {
      const response = await sendMessageWithTimeout<T>(tabId, message);
      console.log("[NanoFlow] Content script response:", response);
      return response;
    } catch (error) {
      console.error("[NanoFlow] sendToContentScript error:", error);
      throw error;
    }
  }

  async function startProcessing(): Promise<void> {
    console.log("[NanoFlow] startProcessing() called");

    const enabled = await isExtensionEnabled();
    console.log("[NanoFlow] Extension enabled:", enabled);
    if (!enabled) {
      console.log("[NanoFlow] Extension disabled, stopping");
      broadcastMessage({ type: MessageType.STOP_PROCESSING });
      return;
    }

    isProcessing = true;
    isPaused = false;
    processingController = new AbortController();

    broadcastMessage({ type: MessageType.PROCESS_QUEUE });

    const tabId = await findGeminiTab();
    console.log("[NanoFlow] Found Gemini tab:", tabId);
    if (!tabId) {
      console.log("[NanoFlow] No Gemini tab found, stopping");
      broadcastMessage({ type: MessageType.STOP_PROCESSING });
      isProcessing = false;
      return;
    }

    while (isProcessing && !isPaused) {
      const queue = await getQueue();
      const nextItem = queue.find((item) => item.status === QueueStatus.Pending);

      if (!nextItem) {
        isProcessing = false;
        break;
      }

      // Update item to processing status
      const startTime = Date.now();
      await updateQueueItem(nextItem.id, {
        status: QueueStatus.Processing,
        startTime,
      });

      // Notify listeners that queue changed (they fetch from storage)
      broadcastMessage({ type: MessageType.UPDATE_QUEUE });

      try {
        // Determine which tool to use
        const settings = await getSettings();
        let tool = nextItem.tool || settings.defaultTool || GeminiTool.IMAGE;

        // If using tool sequence, calculate which tool to use based on queue position
        if (settings.useToolSequence && settings.toolSequence.length > 0) {
          const queueData = await getQueue();
          const itemIndex = queueData.findIndex((item) => item.id === nextItem.id);
          if (itemIndex >= 0) {
            tool = settings.toolSequence[itemIndex % settings.toolSequence.length];
          }
        }

        // Send prompt to content script for web automation
        const response = await sendToContentScript({
          type: MessageType.PASTE_PROMPT,
          payload: {
            prompt: nextItem.finalPrompt,
            tool,
            images: nextItem.images ?? [],
          },
        });

        const endTime = Date.now();
        const completionTimeSeconds = startTime ? (endTime - startTime) / 1000 : undefined;

        if (response.success) {
          await updateQueueItem(nextItem.id, {
            status: QueueStatus.Completed,
            endTime,
            completionTimeSeconds,
            results: {
              flash: {
                url: "", // No URL from web automation
                modelName: "Gemini Web",
                timestamp: endTime,
              },
            },
          });
        } else {
          throw new Error(response.error || "Web automation failed");
        }

        // Wait between items
        const waitTime = settings.dripFeed
          ? 8000 + Math.random() * 7000 // 8-15 seconds with drip feed
          : 1500 + Math.random() * 1500; // 1.5-3 seconds normally

        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } catch (error) {
        await updateQueueItem(nextItem.id, {
          status: QueueStatus.Failed,
          error: error instanceof Error ? error.message : "Generation failed",
        });
      }

      broadcastMessage({ type: MessageType.UPDATE_QUEUE });
    }

    if (isPaused) {
      isProcessing = false;
      broadcastMessage({ type: MessageType.PAUSE_PROCESSING });
    } else {
      broadcastMessage({ type: MessageType.STOP_PROCESSING });
    }
  }

  function pauseProcessing(): void {
    isPaused = true;
    // Don't set isProcessing = false yet - let the current item finish
    // The while loop will check isPaused and exit gracefully
  }

  function stopProcessing(): void {
    isProcessing = false;
    isPaused = false;
    if (processingController) {
      processingController.abort();
      processingController = null;
    }
  }

  function broadcastMessage(message: ExtensionMessage): void {
    chrome.runtime.sendMessage(message).catch(() => {
      // Ignore errors when no listeners are available
    });
  }
});
