import { MessageType } from "@/types";
import { logger } from "@/utils/logger";

import { getProcessingState, setProcessingState } from "./state";

import type { ExtensionMessage } from "@/types";

const log = logger.module("TabManagement");

export async function findGeminiTab(): Promise<number | null> {
  const state = await getProcessingState();

  if (state.activeGeminiTabId) {
    try {
      const tab = await chrome.tabs.get(state.activeGeminiTabId);
      if (tab.url?.includes("gemini.google.com")) {
        return state.activeGeminiTabId;
      }
    } catch {
      await setProcessingState({ activeGeminiTabId: null });
    }
  }

  const tabs = await chrome.tabs.query({ url: "https://gemini.google.com/*" });
  if (tabs.length > 0 && tabs[0].id) {
    await setProcessingState({ activeGeminiTabId: tabs[0].id });
    return tabs[0].id;
  }

  return null;
}

export async function ensureContentScriptReady(tabId: number): Promise<boolean> {
  try {
    await chrome.tabs.sendMessage(tabId, { type: MessageType.PING });
    return true;
  } catch {
    log.debug("ensureReady", "Content script not ready, injecting...", { tabId });
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content-scripts/gemini.js"],
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await chrome.tabs.sendMessage(tabId, { type: MessageType.PING });
      return true;
    } catch (injectError) {
      log.error("ensureReady", "Failed to inject content script", injectError);
      return false;
    }
  }
}

export function sendMessageWithTimeout<T>(
  tabId: number,
  message: ExtensionMessage,
  timeout = 300000
): Promise<import("@/types").ExtensionResponse<T>> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Message timeout after ${timeout / 1000}s`));
    }, timeout);

    chrome.tabs
      .sendMessage(tabId, message)
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}
