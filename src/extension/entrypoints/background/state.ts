import { logger } from "@/backend/utils/logger";

import { DEFAULT_PROCESSING_STATE } from "@/extension/entrypoints/background/types";

import type { ProcessingState } from "@/extension/entrypoints/background/types";

const log = logger.module("State");

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
    log.error("setProcessingState", "Failed to persist processing state");
  }
}
