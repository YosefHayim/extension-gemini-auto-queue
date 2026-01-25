import { MessageType } from "@/backend/types";
import { logger } from "@/backend/utils";

import { initNetworkMonitor, selectMode } from "@/extension/entrypoints/gemini.content/modules";

import { setupMessageListener, setupKeyboardShortcuts } from "@/extension/entrypoints/gemini.content/automation/messageHandler";
import { processPromptThroughUI } from "@/extension/entrypoints/gemini.content/automation/processPrompt";

const log = logger.module("Automation");

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
