import { automationModule } from "./automation/index";

export default defineContentScript({
  matches: ["*://gemini.google.com/*", "*://aistudio.google.com/*"],
  runAt: "document_idle",

  async main() {
    automationModule.init();
  },
});
