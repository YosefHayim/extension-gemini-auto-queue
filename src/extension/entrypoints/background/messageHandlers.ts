import { generateImage } from "@/backend/services/geminiService";
import {
  getFolders,
  getQueue,
  getSettings,
  isExtensionEnabled,
  setExtensionEnabled,
  setFolders,
  setQueue,
  setSettings,
} from "@/backend/services/storageService";
import {
  type GeminiMode,
  type GeminiTool,
  MessageType,
  type AppSettings,
  type ExtensionMessage,
  type ExtensionResponse,
  type Folder,
  type QueueItem,
  type GeminiModel,
} from "@/backend/types";
import { sendToContentScript } from "@/extension/entrypoints/background/contentScriptBridge";
import {
  startProcessing,
  pauseProcessing,
  stopProcessing,
} from "@/extension/entrypoints/background/processing";
import { setProcessingState } from "@/extension/entrypoints/background/state";
import { SCHEDULE_ALARM_NAME, isPermittedHost } from "@/extension/entrypoints/background/types";

export async function handleMessage(
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
      const procState = await import("./state").then((m) => m.getProcessingState());
      if (!procState.isProcessing) {
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
          model: model as GeminiModel,
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
        if (activeTab.id && activeTab.url) {
          if (!isPermittedHost(activeTab.url)) {
            return { success: false, error: "Sidebar is only available on Gemini sites" };
          }
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
      if (sender?.tab?.id) {
        await setProcessingState({ activeGeminiTabId: sender.tab.id });
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
      const payload = message.payload as {
        prompt: string;
        tool?: GeminiTool;
        images?: string[];
        mode?: GeminiMode;
      };

      const images = payload.images ?? [];
      let imageStorageKey: string | undefined;

      if (images.length > 0) {
        imageStorageKey = `nano_flow_images_${Date.now()}`;
        await chrome.storage.session.set({ [imageStorageKey]: images });
      }

      const response = await sendToContentScript({
        type: MessageType.PASTE_PROMPT,
        payload: {
          prompt: payload.prompt,
          tool: payload.tool,
          imageStorageKey,
          mode: payload.mode,
        },
      });

      if (imageStorageKey) {
        await chrome.storage.session.remove(imageStorageKey);
      }

      return response;
    }

    case MessageType.SET_SCHEDULE: {
      const { scheduledTime, repeatDaily } = message.payload as {
        scheduledTime: number;
        repeatDaily: boolean;
      };

      await chrome.alarms.clear(SCHEDULE_ALARM_NAME);

      if (scheduledTime) {
        chrome.alarms.create(SCHEDULE_ALARM_NAME, { when: scheduledTime });
        await setSettings({
          schedule: { enabled: true, scheduledTime, repeatDaily },
        });
      }
      return { success: true };
    }

    case MessageType.CANCEL_SCHEDULE: {
      await chrome.alarms.clear(SCHEDULE_ALARM_NAME);
      await setSettings({
        schedule: { enabled: false, scheduledTime: null, repeatDaily: false },
      });
      return { success: true };
    }

    default:
      return { success: false, error: "Unknown message type" };
  }
}
