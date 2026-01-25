interface NetworkMonitorState {
  isGenerating: boolean;
  lastRequestStartTime: number;
  lastRequestEndTime: number;
  pendingRequests: Set<string>;
  completionCallbacks: (() => void)[];
}

const state: NetworkMonitorState = {
  isGenerating: false,
  lastRequestStartTime: 0,
  lastRequestEndTime: 0,
  pendingRequests: new Set(),
  completionCallbacks: [],
};

const GEMINI_API_PATTERNS = [
  /StreamGenerate/i,
  /BardChatUi/i,
  /generate/i,
  /batchexecute/i,
  /_\/BardChatUi/i,
];

let initialized = false;

function setupPerformanceObserver(): void {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "resource") {
          const resourceEntry = entry as PerformanceResourceTiming;
          const isGeminiRequest = GEMINI_API_PATTERNS.some((pattern) =>
            pattern.test(resourceEntry.name)
          );
          if (isGeminiRequest && resourceEntry.responseEnd > 0) {
            state.lastRequestEndTime = Math.max(
              state.lastRequestEndTime,
              resourceEntry.responseEnd + performance.timeOrigin
            );
          }
        }
      }
    });
    observer.observe({ entryTypes: ["resource"] });
  } catch {
    // PerformanceObserver not supported
  }
}

export function initNetworkMonitor(): void {
  if (initialized) return;
  initialized = true;
  setupPerformanceObserver();
}

export function isNetworkGenerating(): boolean {
  return state.isGenerating || state.pendingRequests.size > 0;
}

export function waitForNetworkComplete(timeout = 180000): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let resolved = false;
    const POLL_INTERVAL = 200;
    const IDLE_BUFFER = 500;

    const poll = () => {
      if (resolved) return;

      if (Date.now() - startTime > timeout) {
        resolved = true;
        resolve(true);
        return;
      }

      const isIdle = !state.isGenerating && state.pendingRequests.size === 0;
      const hasCompletedRequest = state.lastRequestEndTime > 0;
      const timeSinceLastRequest = Date.now() - state.lastRequestEndTime;

      if (isIdle && hasCompletedRequest && timeSinceLastRequest > IDLE_BUFFER) {
        resolved = true;
        resolve(true);
        return;
      }

      setTimeout(poll, POLL_INTERVAL);
    };

    poll();
  });
}
