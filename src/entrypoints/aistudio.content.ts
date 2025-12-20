import { MessageType } from '@/types';

export default defineContentScript({
  matches: ['https://aistudio.google.com/*'],
  runAt: 'document_idle',

  main() {
    console.log('Gemini Nano Flow: Content script loaded on aistudio.google.com');

    // Notify background that we're on AI Studio
    chrome.runtime.sendMessage({
      type: MessageType.OPEN_SIDE_PANEL
    }).catch(() => {
      // Ignore errors - side panel might already be open
    });

    // Add keyboard shortcut to open side panel
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + G to toggle side panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'g') {
        e.preventDefault();
        chrome.runtime.sendMessage({
          type: MessageType.OPEN_SIDE_PANEL
        }).catch(console.error);
      }
    });

    // Watch for API key availability (AI Studio specific)
    const checkForApiKey = () => {
      // AI Studio may expose API key UI elements we could detect
      const apiKeyElements = document.querySelectorAll('[data-apikey], [aria-label*="API"]');
      if (apiKeyElements.length > 0) {
        console.log('Gemini Nano Flow: AI Studio API key UI detected');
      }
    };

    // Initial check
    checkForApiKey();

    // Observe for changes
    const observer = new MutationObserver((_mutations) => {
      checkForApiKey();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup on navigation
    return () => {
      observer.disconnect();
    };
  }
});

