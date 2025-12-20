import { MessageType, QueueStatus } from '@/types';
import type { ExtensionMessage, ExtensionResponse, QueueItem, AppSettings, Folder } from '@/types';
import {
  getQueue,
  setQueue,
  getSettings,
  setSettings,
  getFolders,
  setFolders,
  updateQueueItem
} from '@/services/storageService';
import { generateImage } from '@/services/geminiService';

export default defineBackground(() => {
  console.log('Gemini Nano Flow background script loaded');

  let isProcessing = false;
  let processingController: AbortController | null = null;

  // Handle extension icon click - open side panel
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      try {
        await chrome.sidePanel.open({ tabId: tab.id });
      } catch (error) {
        console.error('Failed to open side panel:', error);
      }
    }
  });

  // Enable side panel on supported sites
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      const isGeminiSite =
        tab.url.includes('gemini.google.com') || tab.url.includes('aistudio.google.com');

      if (isGeminiSite) {
        await chrome.sidePanel.setOptions({
          tabId,
          path: 'sidepanel.html',
          enabled: true
        });
      }
    }
  });

  // Handle messages from sidepanel and content scripts
  chrome.runtime.onMessage.addListener(
    (
      message: ExtensionMessage,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: ExtensionResponse) => void
    ) => {
      handleMessage(message)
        .then((response) => sendResponse(response))
        .catch((error) => {
          console.error('Message handling error:', error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        });

      // Return true to indicate async response
      return true;
    }
  );

  async function handleMessage(message: ExtensionMessage): Promise<ExtensionResponse> {
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
            model: model as import('@/types').GeminiModel,
            imageBase64s: images
          });
          return { success: true, data: result };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Generation failed'
          };
        }
      }

      case MessageType.OPEN_SIDE_PANEL: {
        const tabId = message.payload as number;
        if (tabId) {
          await chrome.sidePanel.open({ tabId });
        }
        return { success: true };
      }

      default:
        return { success: false, error: 'Unknown message type' };
    }
  }

  async function startProcessing(): Promise<void> {
    isProcessing = true;
    processingController = new AbortController();

    // Notify sidepanel that processing started
    broadcastMessage({ type: MessageType.PROCESS_QUEUE });

    while (isProcessing) {
      const queue = await getQueue();
      const nextItem = queue.find((item) => item.status === QueueStatus.IDLE);

      if (!nextItem) {
        // No more items to process
        isProcessing = false;
        break;
      }

      // Update item to processing status
      const startTime = Date.now();
      await updateQueueItem(nextItem.id, {
        status: QueueStatus.PROCESSING,
        startTime
      });

      // Broadcast update
      broadcastMessage({
        type: MessageType.UPDATE_QUEUE,
        payload: await getQueue()
      });

      try {
        const settings = await getSettings();
        const result = await generateImage({
          prompt: nextItem.finalPrompt,
          model: settings.primaryModel,
          imageBase64s: nextItem.images
        });

        const endTime = Date.now();
        await updateQueueItem(nextItem.id, {
          status: QueueStatus.COMPLETED,
          endTime,
          results: {
            [settings.primaryModel.includes('flash') ? 'flash' : 'pro']: {
              url: result,
              modelName: settings.primaryModel.includes('flash') ? 'Flash 2.0' : 'Imagen 3',
              timestamp: endTime
            }
          }
        });

        // If drip feed is enabled, add a random delay
        if (settings.dripFeed) {
          await new Promise((resolve) =>
            setTimeout(resolve, 5000 + Math.random() * 5000)
          );
        }
      } catch (error) {
        await updateQueueItem(nextItem.id, {
          status: QueueStatus.FAILED,
          error: error instanceof Error ? error.message : 'Generation failed'
        });
      }

      // Broadcast queue update
      broadcastMessage({
        type: MessageType.UPDATE_QUEUE,
        payload: await getQueue()
      });

      // Small delay between items
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Notify that processing stopped
    broadcastMessage({ type: MessageType.STOP_PROCESSING });
  }

  function stopProcessing(): void {
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

