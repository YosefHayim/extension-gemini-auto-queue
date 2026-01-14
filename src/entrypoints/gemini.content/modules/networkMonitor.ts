interface NetworkMonitorState {
  isGenerating: boolean;
  lastRequestStartTime: number;
  lastRequestEndTime: number;
  pendingRequests: Set<string>;
  completionCallbacks: Array<() => void>;
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

const REQUEST_TIMEOUT = 120000;

let initialized = false;

function handleRequestComplete(requestId: string, timeoutId: ReturnType<typeof setTimeout>): void {
  clearTimeout(timeoutId);
  state.pendingRequests.delete(requestId);
  if (state.pendingRequests.size === 0) {
    state.isGenerating = false;
    state.lastRequestEndTime = Date.now();
    const callbacks = [...state.completionCallbacks];
    state.completionCallbacks = [];
    callbacks.forEach((cb) => cb());
  }
}

function createRequestTimeout(requestId: string): ReturnType<typeof setTimeout> {
  return setTimeout(() => {
    if (state.pendingRequests.has(requestId)) {
      handleRequestComplete(requestId, 0 as unknown as ReturnType<typeof setTimeout>);
    }
  }, REQUEST_TIMEOUT);
}

function patchFetch(): void {
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
    const isGeminiRequest = GEMINI_API_PATTERNS.some((pattern) => pattern.test(url));

    if (!isGeminiRequest) {
      return originalFetch.apply(this, args);
    }

    const requestId = `fetch-${Date.now()}-${Math.random()}`;
    state.pendingRequests.add(requestId);
    state.isGenerating = true;
    state.lastRequestStartTime = Date.now();

    const timeoutId = createRequestTimeout(requestId);

    try {
      const response = await originalFetch.apply(this, args);

      if (response.body) {
        const reader = response.body.getReader();
        const trackedStream = new ReadableStream({
          async start(controller) {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  handleRequestComplete(requestId, timeoutId);
                  controller.close();
                  break;
                }
                controller.enqueue(value);
              }
            } catch (error) {
              handleRequestComplete(requestId, timeoutId);
              controller.error(error);
            }
          },
        });

        return new Response(trackedStream, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        });
      }

      handleRequestComplete(requestId, timeoutId);
      return response;
    } catch (error) {
      handleRequestComplete(requestId, timeoutId);
      throw error;
    }
  };
}

function patchXHR(): void {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...rest: unknown[]) {
    (this as XMLHttpRequest & { _nanoFlowUrl: string })._nanoFlowUrl = url.toString();
    return originalOpen.apply(this, [method, url, ...rest] as Parameters<typeof originalOpen>);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    const xhr = this as XMLHttpRequest & { _nanoFlowUrl: string };
    const url = xhr._nanoFlowUrl || "";
    const isGeminiRequest = GEMINI_API_PATTERNS.some((pattern) => pattern.test(url));

    if (isGeminiRequest) {
      const requestId = `xhr-${Date.now()}-${Math.random()}`;
      state.pendingRequests.add(requestId);
      state.isGenerating = true;
      state.lastRequestStartTime = Date.now();

      const timeoutId = createRequestTimeout(requestId);

      const onComplete = () => handleRequestComplete(requestId, timeoutId);
      xhr.addEventListener("load", onComplete);
      xhr.addEventListener("error", onComplete);
      xhr.addEventListener("abort", onComplete);
    }

    return originalSend.apply(this, args);
  };
}

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

  patchFetch();
  patchXHR();
  setupPerformanceObserver();
}

export function isNetworkGenerating(): boolean {
  return state.isGenerating || state.pendingRequests.size > 0;
}

export function waitForNetworkComplete(timeout = 180000): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let resolved = false;
    const POLL_INTERVAL = 500;
    const IDLE_BUFFER = 2000;

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
