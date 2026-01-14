/**
 * Content script for Gemini page automation.
 *
 * This is a minimal content script that only initializes the automation module
 * for DOM manipulation. All UI is handled by Chrome's native side panel.
 */
import { automationModule } from "./automation";

export default defineContentScript({
  matches: ["*://gemini.google.com/*", "*://aistudio.google.com/*"],
  runAt: "document_idle",

  async main() {
    automationModule.init();
  },
});
