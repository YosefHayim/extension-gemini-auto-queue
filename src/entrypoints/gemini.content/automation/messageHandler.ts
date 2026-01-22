import {
  type GeminiMode,
  GeminiTool,
  MessageType,
  type ExtensionMessage,
  type ExtensionResponse,
} from "@/types";
import { logger } from "@/utils";
import {
  findAllMedia,
  downloadAllMedia,
  downloadAllViaNativeButtons,
} from "@/utils/mediaDownloader";

import { selectTool, submitPrompt } from "../modules";

import { processPromptThroughUI } from "./processPrompt";

const log = logger.module("Automation");

export function setupMessageListener(): void {
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, _sender, sendResponse: (response: ExtensionResponse) => void) => {
      log.debug("messageListener", "Received message", { type: message.type });

      if (message.type === MessageType.PING) {
        sendResponse({ success: true });
        return false;
      }

      const handleAsync = async () => {
        switch (message.type) {
          case MessageType.PASTE_PROMPT: {
            const payload = message.payload as {
              prompt: string;
              tool?: GeminiTool;
              imageStorageKey?: string;
              mode?: GeminiMode;
            };

            let images: string[] | undefined;
            if (payload.imageStorageKey) {
              const stored = await chrome.storage.session.get(payload.imageStorageKey);
              images = stored[payload.imageStorageKey] as string[] | undefined;
            }

            const result = await processPromptThroughUI(
              payload.prompt,
              payload.tool || GeminiTool.IMAGE,
              images,
              payload.mode
            );
            return { success: result.success, error: result.error };
          }

          case MessageType.ENABLE_IMAGE_CREATION: {
            const success = await selectTool(GeminiTool.IMAGE);
            return { success };
          }

          case MessageType.SUBMIT_PROMPT: {
            const success = await submitPrompt();
            return { success };
          }

          case MessageType.SCAN_CHAT_MEDIA: {
            const mediaItems = findAllMedia();
            return {
              success: true,
              data: {
                items: mediaItems,
                counts: {
                  images: mediaItems.filter((m) => m.type === "image").length,
                  videos: mediaItems.filter((m) => m.type === "video").length,
                  files: mediaItems.filter((m) => m.type === "file").length,
                  total: mediaItems.length,
                },
              },
            };
          }

          case MessageType.DOWNLOAD_CHAT_MEDIA: {
            const downloadPayload = message.payload as {
              method?: "native" | "direct";
              filterType?: "image" | "video" | "file";
            };

            const method = downloadPayload?.method ?? "native";
            const filterType = downloadPayload?.filterType;

            if (method === "native") {
              const count = await downloadAllViaNativeButtons();
              return {
                success: count > 0,
                data: { downloadCount: count },
              };
            } else {
              let items = findAllMedia();
              if (filterType) {
                items = items.filter((m) => m.type === filterType);
              }
              if (items.length === 0) {
                return { success: false, error: "No media found to download" };
              }
              const result = await downloadAllMedia(items);
              return {
                success: result.success > 0,
                data: { success: result.success, failed: result.failed },
              };
            }
          }

          default:
            return { success: false, error: "Unknown message type" };
        }
      };

      handleAsync()
        .then(sendResponse)
        .catch((error) => {
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        });

      return true;
    }
  );
}

export function setupKeyboardShortcuts(): void {
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "g") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("nano-flow-toggle-sidebar"));
    }
  });
}
