import { MessageType } from "@/types";

export default defineContentScript({
  matches: ["https://gemini.google.com/*"],
  runAt: "document_idle",

  main() {
    console.log("Gemini Nano Flow: Content script loaded on gemini.google.com");

    // Notify background that we're on a Gemini page
    chrome.runtime
      .sendMessage({
        type: MessageType.OPEN_SIDE_PANEL,
      })
      .catch(() => {
        // Ignore errors - side panel might already be open
      });

    // Add keyboard shortcut to open side panel
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + Shift + G to toggle side panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "g") {
        e.preventDefault();
        chrome.runtime
          .sendMessage({
            type: MessageType.OPEN_SIDE_PANEL,
          })
          .catch(console.error);
      }
    });

    // Observe for prompt input to potentially extract prompts
    const observer = new MutationObserver((_mutations) => {
      // Future: Could auto-detect prompts from the page
      // For now, just ensure side panel knows we're on the right page
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup on navigation
    return () => {
      observer.disconnect();
    };
  },
});
