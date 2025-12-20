import { generateImage } from "@/services/geminiService";
import {
  getFolders,
  getQueue,
  getSettings,
  setFolders,
  setQueue,
  setSettings,
  updateQueueItem,
} from "@/services/storageService";
import { GeminiTool, MessageType, QueueStatus } from "@/types";

import type { AppSettings, ExtensionMessage, ExtensionResponse, Folder, QueueItem } from "@/types";

export default defineBackground(() => {
  console.log("[Nano Flow] Background script loaded");

  let isProcessing = false;
  let processingController: AbortController | null = null;
  let activeGeminiTabId: number | null = null;

  // Handle extension icon click - open side panel
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      try {
        await chrome.sidePanel.open({ tabId: tab.id });
      } catch (error) {
        console.error("[Nano Flow] Failed to open side panel:", error);
      }
    }
  });

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
        console.log("[Nano Flow] Gemini tab detected:", tabId);
      }
    }
  });

  // Handle tab activation to track active Gemini tab
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab.url?.includes("gemini.google.com")) {
        activeGeminiTabId = activeInfo.tabId;
        console.log("[Nano Flow] Active Gemini tab:", activeGeminiTabId);
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
          console.error("[Nano Flow] Message handling error:", error);
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
        // Get the current active tab if no tabId provided
        try {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab?.id) {
            await chrome.sidePanel.open({ tabId: activeTab.id });
          }
        } catch (error) {
          console.error("[Nano Flow] Failed to open side panel:", error);
        }
        return { success: true };
      }

      case MessageType.CONTENT_SCRIPT_READY: {
        // Content script is ready - update active tab
        if (sender?.tab?.id) {
          activeGeminiTabId = sender.tab.id;
          console.log("[Nano Flow] Content script ready in tab:", activeGeminiTabId);
        }
        return { success: true };
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

  // Send message to content script in Gemini tab
  async function sendToContentScript<T>(message: ExtensionMessage): Promise<ExtensionResponse<T>> {
    const tabId = await findGeminiTab();
    if (!tabId) {
      throw new Error("No Gemini tab found. Please open gemini.google.com");
    }

    console.log("[Nano Flow] Sending to content script:", message.type);
    return chrome.tabs.sendMessage(tabId, message);
  }

  async function startProcessing(): Promise<void> {
    isProcessing = true;
    processingController = new AbortController();

    // Notify sidepanel that processing started
    broadcastMessage({ type: MessageType.PROCESS_QUEUE });

    // Check if we have a Gemini tab
    const tabId = await findGeminiTab();
    if (!tabId) {
      console.error("[Nano Flow] No Gemini tab found");
      broadcastMessage({ type: MessageType.STOP_PROCESSING });
      isProcessing = false;
      return;
    }

    console.log("[Nano Flow] Starting queue processing via web automation");

    while (isProcessing) {
      const queue = await getQueue();
      const nextItem = queue.find((item) => item.status === QueueStatus.IDLE);

      if (!nextItem) {
        // No more items to process
        console.log("[Nano Flow] Queue empty, stopping processing");
        isProcessing = false;
        break;
      }

      // Update item to processing status
      const startTime = Date.now();
      await updateQueueItem(nextItem.id, {
        status: QueueStatus.PROCESSING,
        startTime,
      });

      // Broadcast update
      broadcastMessage({
        type: MessageType.UPDATE_QUEUE,
        payload: await getQueue(),
      });

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

        console.log(
          "[Nano Flow] Processing item:",
          nextItem.id,
          nextItem.finalPrompt.substring(0, 50)
        );
        console.log("[Nano Flow] Using tool:", tool, "| Images:", nextItem.images?.length ?? 0);

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

        if (response.success) {
          await updateQueueItem(nextItem.id, {
            status: QueueStatus.COMPLETED,
            endTime,
            results: {
              flash: {
                url: "", // No URL from web automation
                modelName: "Gemini Web",
                timestamp: endTime,
              },
            },
          });
          console.log("[Nano Flow] Item completed:", nextItem.id);
        } else {
          throw new Error(response.error || "Web automation failed");
        }

        // Wait between items (longer for web automation)
        // Note: settings already loaded earlier for tool selection
        const waitTime = settings.dripFeed
          ? 15000 + Math.random() * 10000 // 15-25 seconds with drip feed
          : 8000 + Math.random() * 4000; // 8-12 seconds normally

        console.log("[Nano Flow] Waiting", Math.round(waitTime / 1000), "seconds before next item");
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } catch (error) {
        console.error("[Nano Flow] Processing error:", error);
        await updateQueueItem(nextItem.id, {
          status: QueueStatus.FAILED,
          error: error instanceof Error ? error.message : "Generation failed",
        });
      }

      // Broadcast queue update
      broadcastMessage({
        type: MessageType.UPDATE_QUEUE,
        payload: await getQueue(),
      });
    }

    // Notify that processing stopped
    broadcastMessage({ type: MessageType.STOP_PROCESSING });
    console.log("[Nano Flow] Processing stopped");
  }

  function stopProcessing(): void {
    console.log("[Nano Flow] Stop processing requested");
    isProcessing = false;
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
