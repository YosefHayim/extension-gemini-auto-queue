import { initAnalytics } from "@/backend/services/analyticsService";
import { getSettings, initializeQueueStorage } from "@/backend/services/storageService";
import { logger } from "@/backend/utils/logger";
import { initSentry } from "@/backend/utils/sentry";
import { setupAlarmListener } from "@/extension/entrypoints/background/alarms";
import { handleMessage } from "@/extension/entrypoints/background/messageHandlers";
import {
  startProcessing,
  restoreProcessingStateOnStartup,
} from "@/extension/entrypoints/background/processing";
import { setupTabListeners } from "@/extension/entrypoints/background/tabListeners";

import type { ExtensionMessage, ExtensionResponse } from "@/backend/types";

const log = logger.module("Background");

async function initializeAnalytics(): Promise<void> {
  const settings = await getSettings();
  initAnalytics(settings.analyticsEnabled);
}

export default defineBackground(() => {
  initSentry({ context: "background" });

  logger.clearLogs();
  log.info("init", "Service worker started");

  initializeQueueStorage();
  initializeAnalytics();

  restoreProcessingStateOnStartup();

  setupAlarmListener(startProcessing);

  setupTabListeners();

  chrome.runtime.onMessage.addListener(
    (
      message: ExtensionMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: ExtensionResponse) => void
    ) => {
      handleMessage(message, sender)
        .then((response) => {
          sendResponse(response);
        })
        .catch((error) => {
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        });

      return true;
    }
  );
});
