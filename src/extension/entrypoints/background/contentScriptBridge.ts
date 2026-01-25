import { logger } from "@/backend/utils/logger";

import { findGeminiTab, ensureContentScriptReady, sendMessageWithTimeout } from "./tabManagement";

import type { ExtensionMessage, ExtensionResponse } from "@/backend/types";

const log = logger.module("ContentScriptBridge");

export async function sendToContentScript<T>(
  message: ExtensionMessage
): Promise<ExtensionResponse<T>> {
  const tabId = await findGeminiTab();
  log.debug("send", "Sending message", { tabId, type: message.type });
  if (!tabId) {
    throw new Error("No Gemini tab found. Please open gemini.google.com");
  }

  const isReady = await ensureContentScriptReady(tabId);
  if (!isReady) {
    throw new Error("Content script not available. Please refresh the Gemini page.");
  }

  try {
    const response = await sendMessageWithTimeout<T>(tabId, message);
    log.debug("response", "Content script response", response);
    return response;
  } catch (error) {
    log.error("send", "sendToContentScript error", error);
    throw error;
  }
}

export function broadcastMessage(message: ExtensionMessage): void {
  chrome.runtime.sendMessage(message).catch(() => {
    // Ignore errors when no listeners are available
  });
}
