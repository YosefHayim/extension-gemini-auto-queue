import { setProcessingState } from "./state";
import { isPermittedHost } from "./types";

export function setupTabListeners(): void {
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
      const isPermitted = isPermittedHost(tab.url);

      if (isPermitted) {
        await chrome.sidePanel.setOptions({
          tabId,
          path: "sidepanel.html",
          enabled: true,
        });
        await setProcessingState({ activeGeminiTabId: tabId });
      } else {
        await chrome.sidePanel.setOptions({
          tabId,
          enabled: false,
        });
      }
    }
  });

  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab.url) {
        const isPermitted = isPermittedHost(tab.url);
        if (isPermitted) {
          await setProcessingState({ activeGeminiTabId: activeInfo.tabId });
          await chrome.sidePanel.setOptions({
            tabId: activeInfo.tabId,
            path: "sidepanel.html",
            enabled: true,
          });
        } else {
          await chrome.sidePanel.setOptions({
            tabId: activeInfo.tabId,
            enabled: false,
          });
        }
      }
    } catch {
      // Tab might not exist
    }
  });
}
