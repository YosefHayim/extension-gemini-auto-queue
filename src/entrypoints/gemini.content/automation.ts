import type { ExtensionMessage, ExtensionResponse } from "@/types";
import { GeminiMode, GeminiTool, MessageType } from "@/types";
import { sleep, logger } from "@/utils";
import {
  findAllMedia,
  downloadAllMedia,
  downloadAllViaNativeButtons,
} from "@/utils/mediaDownloader";

const log = logger.module("Automation");
import {
  initNetworkMonitor,
  selectTool,
  selectMode,
  uploadImages,
  pastePromptToInput,
  submitPrompt,
  waitForGenerationComplete,
} from "./modules";

async function processPromptThroughUI(
  prompt: string,
  tool: GeminiTool = GeminiTool.IMAGE,
  images?: string[],
  mode?: GeminiMode
): Promise<{ success: boolean; error?: string }> {
  const actionKey = log.startAction("processPrompt");

  try {
    log.info("processPrompt", "Starting prompt processing", {
      tool,
      mode,
      hasImages: !!images?.length,
      promptLength: prompt.length,
    });

    if (mode) {
      log.debug("processPrompt", "Selecting mode", { mode });
      await selectMode(mode);
    }

    if (tool !== GeminiTool.NONE) {
      log.debug("processPrompt", "Selecting tool", { tool });
      const toolSelected = await selectTool(tool);
      if (!toolSelected) {
        log.endAction(actionKey, "processPrompt", "Failed to select tool", false, { tool });
        return { success: false, error: `Failed to select tool: ${tool}` };
      }
    }

    if (images && images.length > 0) {
      log.debug("processPrompt", "Uploading images", { count: images.length });
      const uploaded = await uploadImages(images);
      if (!uploaded) {
        log.warn("processPrompt", "Image upload failed, continuing with text only");
      }
      await sleep(200);
    }

    log.debug("processPrompt", "Pasting prompt");
    const pasted = await pastePromptToInput(prompt);
    if (!pasted) {
      log.endAction(actionKey, "processPrompt", "Failed to paste prompt", false);
      return { success: false, error: "Failed to paste prompt - input field not found" };
    }

    log.debug("processPrompt", "Submitting prompt");
    const submitted = await submitPrompt();
    if (!submitted) {
      log.endAction(actionKey, "processPrompt", "Failed to submit", false);
      return { success: false, error: "Failed to submit - send button not found or disabled" };
    }

    log.debug("processPrompt", "Waiting for generation to complete");
    await waitForGenerationComplete(tool);

    log.endAction(actionKey, "processPrompt", "Generation complete", true);
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    log.endAction(actionKey, "processPrompt", "Error during processing", false, {
      error: errorMsg,
    });
    return { success: false, error: errorMsg };
  }
}

function setupMessageListener(): void {
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

function setupKeyboardShortcuts(): void {
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "g") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("nano-flow-toggle-sidebar"));
    }
  });
}

export const automationModule = {
  selectMode,
  processPrompt: processPromptThroughUI,
  init() {
    log.info("init", "Initializing automation module");
    initNetworkMonitor();

    chrome.runtime
      .sendMessage({ type: MessageType.CONTENT_SCRIPT_READY })
      .then(() => log.debug("init", "CONTENT_SCRIPT_READY sent"))
      .catch((e) => log.warn("init", "CONTENT_SCRIPT_READY failed", { error: e }));

    setupMessageListener();
    setupKeyboardShortcuts();
    log.info("init", "Automation module initialized");
  },
};
