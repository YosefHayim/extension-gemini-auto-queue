import type { ExtensionMessage, ExtensionResponse } from "@/types";
import { GeminiMode, GeminiTool, MessageType } from "@/types";
import { sleep } from "@/utils";
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
  try {
    console.log("[NanoFlow Content] processPromptThroughUI starting", {
      tool,
      mode,
      hasImages: !!images?.length,
    });

    if (mode) {
      console.log("[NanoFlow Content] Selecting mode:", mode);
      await selectMode(mode);
    }

    if (tool !== GeminiTool.NONE) {
      console.log("[NanoFlow Content] Selecting tool:", tool);
      const toolSelected = await selectTool(tool);
      if (!toolSelected) {
        return { success: false, error: `Failed to select tool: ${tool}` };
      }
    }

    if (images && images.length > 0) {
      console.log("[NanoFlow Content] Uploading", images.length, "images");
      const uploaded = await uploadImages(images);
      if (!uploaded) {
        console.log("[NanoFlow Content] Image upload failed, continuing with text only");
      }
      await sleep(500);
    }

    console.log("[NanoFlow Content] Pasting prompt...");
    const pasted = await pastePromptToInput(prompt);
    if (!pasted) {
      return { success: false, error: "Failed to paste prompt - input field not found" };
    }

    console.log("[NanoFlow Content] Submitting prompt...");
    const submitted = await submitPrompt();
    if (!submitted) {
      return { success: false, error: "Failed to submit - send button not found or disabled" };
    }

    console.log("[NanoFlow Content] Waiting for generation to complete...");
    await waitForGenerationComplete(tool);

    console.log("[NanoFlow Content] Generation complete!");
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[NanoFlow Content] processPromptThroughUI error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

function setupMessageListener(): void {
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, _sender, sendResponse: (response: ExtensionResponse) => void) => {
      console.log("[NanoFlow Content] Received message:", message.type);

      const handleAsync = async () => {
        switch (message.type) {
          case MessageType.PING: {
            return { success: true };
          }

          case MessageType.PASTE_PROMPT: {
            const payload = message.payload as {
              prompt: string;
              tool?: GeminiTool;
              images?: string[];
              mode?: GeminiMode;
            };
            const result = await processPromptThroughUI(
              payload.prompt,
              payload.tool || GeminiTool.IMAGE,
              payload.images,
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
    console.log("[NanoFlow Content] automationModule.init() called");
    initNetworkMonitor();

    chrome.runtime
      .sendMessage({ type: MessageType.CONTENT_SCRIPT_READY })
      .then(() => console.log("[NanoFlow Content] CONTENT_SCRIPT_READY sent"))
      .catch((e) => console.log("[NanoFlow Content] CONTENT_SCRIPT_READY failed:", e));

    setupMessageListener();
    setupKeyboardShortcuts();
  },
};
