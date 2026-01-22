import type { ExtensionMessage, ExtensionResponse } from "@/types";
import { initializeQueueStorage } from "@/services/storageService";
import { handleMessage } from "./messageHandlers";
import { setupAlarmListener } from "./alarms";
import { setupTabListeners } from "./tabListeners";
import { startProcessing, restoreProcessingStateOnStartup } from "./processing";

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
