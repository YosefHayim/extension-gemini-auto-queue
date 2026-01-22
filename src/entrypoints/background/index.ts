import { initializeQueueStorage } from "@/services/storageService";

import { setupAlarmListener } from "./alarms";
import { handleMessage } from "./messageHandlers";
import { startProcessing, restoreProcessingStateOnStartup } from "./processing";
import { setupTabListeners } from "./tabListeners";

import type { ExtensionMessage, ExtensionResponse } from "@/types";

export default defineBackground(() => {
  initializeQueueStorage();

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
