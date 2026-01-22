import type { ProcessingState } from "./types";
import { DEFAULT_PROCESSING_STATE } from "./types";

export async function getProcessingState(): Promise<ProcessingState> {
  try {
    const result = await chrome.storage.session.get([
      "isProcessing",
      "isPaused",
      "activeGeminiTabId",
    ]);
    return {
      isProcessing: result.isProcessing ?? false,
      isPaused: result.isPaused ?? false,
      activeGeminiTabId: result.activeGeminiTabId ?? null,
    };
  } catch {
    return DEFAULT_PROCESSING_STATE;
  }
}

export async function setProcessingState(state: Partial<ProcessingState>): Promise<void> {
  try {
    await chrome.storage.session.set(state);
  } catch {
    console.error("[NanoFlow] Failed to persist processing state");
  }
}
