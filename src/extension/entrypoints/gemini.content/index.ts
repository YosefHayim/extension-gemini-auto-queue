import { initSentry } from "@/backend/utils/sentry";
import { automationModule } from "@/extension/entrypoints/gemini.content/automation/index";

export default defineContentScript({
  matches: ["*://gemini.google.com/*", "*://aistudio.google.com/*"],
  runAt: "document_idle",

  main() {
    initSentry({ context: "content" });
    automationModule.init();
  },
});
