import { type GeminiMode, GeminiTool } from "@/backend/types";
import { sleep, logger } from "@/backend/utils";
import {
  selectTool,
  selectMode,
  uploadImages,
  pastePromptToInput,
  submitPrompt,
  waitForGenerationComplete,
} from "@/extension/entrypoints/gemini.content/modules";

const log = logger.module("Automation");

export async function processPromptThroughUI(
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
    const generationResult = await waitForGenerationComplete(tool);

    if (generationResult.error) {
      log.endAction(actionKey, "processPrompt", "Generation error detected", false, {
        error: generationResult.error,
      });
      return { success: false, error: generationResult.error };
    }

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
