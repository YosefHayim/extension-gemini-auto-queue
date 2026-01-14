import type { ExtensionMessage, ExtensionResponse } from "@/types";
import { GEMINI_MODE_INFO, GeminiMode, GeminiTool, MessageType } from "@/types";

// Network request monitoring state
interface NetworkMonitor {
  isGenerating: boolean;
  lastRequestStartTime: number;
  lastRequestEndTime: number;
  pendingRequests: Set<string>;
  completionCallbacks: Array<() => void>;
}

const networkMonitor: NetworkMonitor = {
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

let networkMonitorInitialized = false;

function initNetworkMonitor(): void {
  if (networkMonitorInitialized) return;
  networkMonitorInitialized = true;
  // Patch fetch
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
    const isGeminiRequest = GEMINI_API_PATTERNS.some((pattern) => pattern.test(url));

    if (isGeminiRequest) {
      const requestId = `fetch-${Date.now()}-${Math.random()}`;
      networkMonitor.pendingRequests.add(requestId);
      networkMonitor.isGenerating = true;
      networkMonitor.lastRequestStartTime = Date.now();

      const REQUEST_TIMEOUT = 120000;
      const timeoutId = setTimeout(() => {
        if (networkMonitor.pendingRequests.has(requestId)) {
          networkMonitor.pendingRequests.delete(requestId);
          if (networkMonitor.pendingRequests.size === 0) {
            networkMonitor.isGenerating = false;
            networkMonitor.lastRequestEndTime = Date.now();
            const callbacks = [...networkMonitor.completionCallbacks];
            networkMonitor.completionCallbacks = [];
            callbacks.forEach((cb) => cb());
          }
        }
      }, REQUEST_TIMEOUT);

      try {
        const response = await originalFetch.apply(this, args);

        if (response.body) {
          const reader = response.body.getReader();
          const originalReader = reader;

          const trackedStream = new ReadableStream({
            async start(controller) {
              try {
                while (true) {
                  const { done, value } = await originalReader.read();
                  if (done) {
                    clearTimeout(timeoutId);
                    networkMonitor.pendingRequests.delete(requestId);
                    if (networkMonitor.pendingRequests.size === 0) {
                      networkMonitor.isGenerating = false;
                      networkMonitor.lastRequestEndTime = Date.now();
                      const callbacks = [...networkMonitor.completionCallbacks];
                      networkMonitor.completionCallbacks = [];
                      callbacks.forEach((cb) => cb());
                    }
                    controller.close();
                    break;
                  }
                  controller.enqueue(value);
                }
              } catch (error) {
                clearTimeout(timeoutId);
                networkMonitor.pendingRequests.delete(requestId);
                if (networkMonitor.pendingRequests.size === 0) {
                  networkMonitor.isGenerating = false;
                  networkMonitor.lastRequestEndTime = Date.now();
                }
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

        clearTimeout(timeoutId);
        networkMonitor.pendingRequests.delete(requestId);
        if (networkMonitor.pendingRequests.size === 0) {
          networkMonitor.isGenerating = false;
          networkMonitor.lastRequestEndTime = Date.now();
        }
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        networkMonitor.pendingRequests.delete(requestId);
        if (networkMonitor.pendingRequests.size === 0) {
          networkMonitor.isGenerating = false;
          networkMonitor.lastRequestEndTime = Date.now();
        }
        throw error;
      }
    }

    return originalFetch.apply(this, args);
  };

  // Patch XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...rest: unknown[]) {
    (this as XMLHttpRequest & { _nanoFlowUrl: string })._nanoFlowUrl = url.toString();
    return originalXHROpen.apply(this, [method, url, ...rest] as Parameters<
      typeof originalXHROpen
    >);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    const xhr = this as XMLHttpRequest & { _nanoFlowUrl: string };
    const url = xhr._nanoFlowUrl || "";
    const isGeminiRequest = GEMINI_API_PATTERNS.some((pattern) => pattern.test(url));

    if (isGeminiRequest) {
      const requestId = `xhr-${Date.now()}-${Math.random()}`;
      networkMonitor.pendingRequests.add(requestId);
      networkMonitor.isGenerating = true;
      networkMonitor.lastRequestStartTime = Date.now();

      const REQUEST_TIMEOUT = 120000;
      const timeoutId = setTimeout(() => {
        if (networkMonitor.pendingRequests.has(requestId)) {
          networkMonitor.pendingRequests.delete(requestId);
          if (networkMonitor.pendingRequests.size === 0) {
            networkMonitor.isGenerating = false;
            networkMonitor.lastRequestEndTime = Date.now();
            const callbacks = [...networkMonitor.completionCallbacks];
            networkMonitor.completionCallbacks = [];
            callbacks.forEach((cb) => cb());
          }
        }
      }, REQUEST_TIMEOUT);

      const onComplete = () => {
        clearTimeout(timeoutId);
        networkMonitor.pendingRequests.delete(requestId);
        if (networkMonitor.pendingRequests.size === 0) {
          networkMonitor.isGenerating = false;
          networkMonitor.lastRequestEndTime = Date.now();
          const callbacks = [...networkMonitor.completionCallbacks];
          networkMonitor.completionCallbacks = [];
          callbacks.forEach((cb) => cb());
        }
      };

      xhr.addEventListener("load", onComplete);
      xhr.addEventListener("error", onComplete);
      xhr.addEventListener("abort", onComplete);
    }

    return originalXHRSend.apply(this, args);
  };

  // Also use PerformanceObserver for additional coverage
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "resource") {
          const resourceEntry = entry as PerformanceResourceTiming;
          const isGeminiRequest = GEMINI_API_PATTERNS.some((pattern) =>
            pattern.test(resourceEntry.name)
          );
          if (isGeminiRequest && resourceEntry.responseEnd > 0) {
            // Request completed
            networkMonitor.lastRequestEndTime = Math.max(
              networkMonitor.lastRequestEndTime,
              resourceEntry.responseEnd + performance.timeOrigin
            );
          }
        }
      }
    });
    observer.observe({ entryTypes: ["resource"] });
  } catch {
    // PerformanceObserver not supported, rely on fetch/XHR patching
  }
}

function waitForNetworkComplete(timeout = 180000): Promise<boolean> {
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

      const isIdle = !networkMonitor.isGenerating && networkMonitor.pendingRequests.size === 0;
      const hasCompletedRequest = networkMonitor.lastRequestEndTime > 0;
      const timeSinceLastRequest = Date.now() - networkMonitor.lastRequestEndTime;

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

// Check if network indicates generation is in progress
function isNetworkGenerating(): boolean {
  return networkMonitor.isGenerating || networkMonitor.pendingRequests.size > 0;
}

// Selectors for Gemini UI elements (based on actual Gemini web interface)
const SELECTORS = {
  // Text input area - the Quill editor contenteditable div
  textInput: '.ql-editor[contenteditable="true"]',
  textInputAlt: 'rich-textarea .ql-editor[contenteditable="true"]',
  textInputAlt2: 'div[role="textbox"][contenteditable="true"]',
  textInputAlt3: '.textarea[contenteditable="true"]',
  // Toolbox button (כלים / Tools)
  toolboxButton: 'button[aria-label="כלים"]',
  toolboxButtonAlt: "button.toolbox-drawer-button",
  toolboxButtonAlt2: ".toolbox-drawer-button-with-label",
  toolboxButtonAlt3: 'button[aria-label="Tools"]',
  // Submit button (שליחת הנחיה / Send prompt)
  submitButton: 'button[aria-label="שליחת הנחיה"]',
  submitButtonAlt: 'button[aria-label="Submit prompt"]',
  submitButtonAlt2: 'button[aria-label="Send message"]',
  submitButtonAlt3: 'button[data-test-id="send-button"]',
  submitButtonAlt4: ".send-button",
  // File upload button (העלאת קבצים / Upload files)
  uploadButton: 'button[aria-label="פתיחת תפריט העלאת קבצים"]',
  uploadButtonAlt: 'button[aria-label="Open upload file menu"]',
  uploadButtonAlt2: ".upload-button",
  uploadButtonAlt3: 'button[data-test-id="upload-button"]',
  // File input for uploads
  fileInput: 'input[type="file"]',
  // Response/generation indicators
  responseContainer: ".response-container",
  loadingIndicator: '.loading-indicator, [aria-busy="true"]',
  modelResponse: ".model-response-text",
  // Thinking/Processing indicators (when Gemini is working)
  thinkingAvatar: ".bard-avatar.thinking",
  processingState: ".processing-state_container--processing",
  processingButton: ".processing-state_button--processing",
  // Additional thinking/loading indicators
  spinnerAnimation: "lottie-animation",
  matSpinner: "mat-spinner",
  loadingDots: ".loading-dots",
  streamingIndicator: ".streaming-indicator",
  typingIndicator: ".typing-indicator",
} as const;

// Tool button selectors - maps GeminiTool to button identifiers
const TOOL_SELECTORS: Record<
  GeminiTool,
  { jfExtHebrew: string; jfExtEnglish: string; textPatterns: string[]; fontIcons: string[] }
> = {
  [GeminiTool.NONE]: { jfExtHebrew: "", jfExtEnglish: "", textPatterns: [], fontIcons: [] },
  [GeminiTool.IMAGE]: {
    jfExtHebrew: "יצירת תמונות",
    jfExtEnglish: "Image creation",
    textPatterns: ["יצירת תמונות", "Image creation", "Create image", "Generate image", "Imagen"],
    fontIcons: ["image", "photo_camera", "add_photo_alternate"],
  },
  [GeminiTool.VIDEO]: {
    jfExtHebrew: "יצירת סרטונים",
    jfExtEnglish: "Video creation",
    textPatterns: ["יצירת סרטונים", "Video creation", "Veo", "Create video", "Create videos"],
    fontIcons: ["movie", "videocam", "video_camera_back"],
  },
  [GeminiTool.CANVAS]: {
    jfExtHebrew: "canvas",
    jfExtEnglish: "canvas",
    textPatterns: ["Canvas", "canvas", "Note stack", "note_stack"],
    fontIcons: ["note_stack_add", "note_stack", "edit_note"],
  },
  [GeminiTool.DEEP_RESEARCH]: {
    jfExtHebrew: "deep research",
    jfExtEnglish: "deep research",
    textPatterns: ["Deep Research", "deep research", "מחקר מעמיק"],
    fontIcons: ["travel_explore", "explore", "search"],
  },
  [GeminiTool.LEARNING]: {
    jfExtHebrew: "למידה מותאמת אישית",
    jfExtEnglish: "personalized learning",
    textPatterns: ["למידה מותאמת אישית", "Personalized learning", "Learning", "Guided Learning"],
    fontIcons: ["auto_stories", "school", "menu_book"],
  },
  [GeminiTool.VISUAL_LAYOUT]: {
    jfExtHebrew: "פריסה חזותית",
    jfExtEnglish: "visual layout",
    textPatterns: ["פריסה חזותית", "Visual layout", "Layout", "Dynamic view"],
    fontIcons: ["team_dashboard", "dashboard", "view_quilt", "drive_drawing"],
  },
};

// State tracking to avoid redundant selections
let currentActiveMode: GeminiMode | null = null;
let currentActiveTool: GeminiTool | null = null;

// Helper to find element with multiple selectors
function findElement(...selectors: string[]): Element | null {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
    } catch {
      // Invalid selector, skip
    }
  }
  return null;
}

// Helper to wait a bit
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Convert base64 data URL to File object
function base64ToFile(base64: string, filename: string): File {
  // Handle data URL format
  const parts = base64.split(",");
  const mimeMatch = /:(.*?);/.exec(parts[0]);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const data = parts.length > 1 ? parts[1] : parts[0];

  const byteString = atob(data);
  const byteArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }

  return new File([byteArray], filename, { type: mime });
}

async function uploadImages(images: string[]): Promise<boolean> {
  if (!images || images.length === 0) {
    return true;
  }

  console.log("[NanoFlow] uploadImages: Starting paste approach for", images.length, "files");

  const editor = findElement(
    SELECTORS.textInput,
    SELECTORS.textInputAlt,
    SELECTORS.textInputAlt2,
    SELECTORS.textInputAlt3
  );

  if (!editor) {
    console.error("[NanoFlow] uploadImages: Could not find text input editor");
    return false;
  }

  const editorEl = editor as HTMLElement;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];

    try {
      const mimeMatch = /data:(.*?);/.exec(img);
      const mime = mimeMatch ? mimeMatch[1] : "image/png";
      const ext = mime.split("/")[1] || "png";
      const file = base64ToFile(img, `file_${i + 1}.${ext}`);

      console.log("[NanoFlow] uploadImages: Processing file", i + 1, "type:", mime);

      editorEl.focus();
      await sleep(100);

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      // Simulate paste by creating custom event and overriding clipboardData getter
      const pasteEvent = new Event("paste", { bubbles: true, cancelable: true }) as ClipboardEvent;
      Object.defineProperty(pasteEvent, "clipboardData", {
        value: dataTransfer,
        writable: false,
      });

      const dispatched = editorEl.dispatchEvent(pasteEvent);
      console.log("[NanoFlow] uploadImages: Paste event dispatched, result:", dispatched);

      await sleep(300);

      // Also try on the rich-textarea container
      const richTextarea = editorEl.closest("rich-textarea");
      if (richTextarea) {
        const pasteEvent2 = new Event("paste", {
          bubbles: true,
          cancelable: true,
        }) as ClipboardEvent;
        Object.defineProperty(pasteEvent2, "clipboardData", {
          value: dataTransfer,
          writable: false,
        });
        richTextarea.dispatchEvent(pasteEvent2);
        console.log("[NanoFlow] uploadImages: Paste event dispatched on rich-textarea");
      }

      await sleep(300);

      try {
        const clipboardItem = new ClipboardItem({ [mime]: file });
        await navigator.clipboard.write([clipboardItem]);
        console.log("[NanoFlow] uploadImages: Wrote to clipboard, simulating Ctrl+V");

        editorEl.focus();
        const keyDown = new KeyboardEvent("keydown", {
          key: "v",
          code: "KeyV",
          keyCode: 86,
          ctrlKey: true,
          metaKey: true,
          bubbles: true,
        });
        editorEl.dispatchEvent(keyDown);
        document.dispatchEvent(keyDown);
        await sleep(300);
      } catch (clipErr) {
        console.log("[NanoFlow] uploadImages: Clipboard approach failed:", clipErr);
      }

      const dropTarget = richTextarea || editorEl;

      const dragEnter = new DragEvent("dragenter", {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer,
      });
      dropTarget.dispatchEvent(dragEnter);

      const dragOver = new DragEvent("dragover", {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer,
      });
      dropTarget.dispatchEvent(dragOver);

      await sleep(100);

      const dropEvent = new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer,
      });
      dropTarget.dispatchEvent(dropEvent);
      console.log("[NanoFlow] uploadImages: Full drag sequence dispatched");

      await sleep(500);
    } catch (err) {
      console.error("[NanoFlow] uploadImages: Error processing file", i, err);
    }
  }

  await sleep(1000);
  return true;
}

async function pastePromptToInput(prompt: string): Promise<boolean> {
  const editor = findElement(
    SELECTORS.textInput,
    SELECTORS.textInputAlt,
    SELECTORS.textInputAlt2,
    SELECTORS.textInputAlt3
  );

  if (!editor) {
    return false;
  }

  const editorEl = editor as HTMLElement;

  // Focus the editor first
  editorEl.focus();
  await sleep(100);

  // Clear existing content - Quill uses <p> tags
  editorEl.innerHTML = "";
  await sleep(50);

  // Method 1: Set innerHTML with proper Quill structure
  const paragraph = document.createElement("p");
  paragraph.textContent = prompt;
  editorEl.appendChild(paragraph);

  // Trigger multiple events to notify Quill/Angular
  const inputEvent = new InputEvent("input", {
    bubbles: true,
    cancelable: true,
    inputType: "insertText",
    data: prompt,
  });
  editorEl.dispatchEvent(inputEvent);

  // Also dispatch a generic input event
  editorEl.dispatchEvent(new Event("input", { bubbles: true }));
  editorEl.dispatchEvent(new Event("change", { bubbles: true }));

  // Method 2: Try clipboard paste as fallback
  try {
    // Clear and paste via selection
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editorEl);
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Use insertText command
    document.execCommand("insertText", false, prompt);
  } catch {
    // execCommand fallback failed
  }

  await sleep(200);

  // Remove the "blank" class if present (Quill uses this for empty state)
  editorEl.classList.remove("ql-blank");

  return true;
}

// Click the toolbox button to open the menu
async function openToolbox(): Promise<boolean> {
  // Try multiple selectors
  let toolboxBtn = findElement(
    SELECTORS.toolboxButton,
    SELECTORS.toolboxButtonAlt,
    SELECTORS.toolboxButtonAlt2,
    SELECTORS.toolboxButtonAlt3
  );

  // Fallback: find by aria-label containing "כלים" or "Tools"
  if (!toolboxBtn) {
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
      const ariaLabel = btn.getAttribute("aria-label") ?? "";
      const className = btn.className ?? "";
      if (
        ariaLabel.includes("כלים") ||
        ariaLabel.includes("Tools") ||
        className.includes("toolbox-drawer-button")
      ) {
        toolboxBtn = btn;
        break;
      }
    }
  }

  // Fallback: find button with page_info icon
  if (!toolboxBtn) {
    const icons = document.querySelectorAll('mat-icon[fonticon="page_info"]');
    for (const icon of icons) {
      const btn = icon.closest("button");
      if (btn) {
        toolboxBtn = btn;
        break;
      }
    }
  }

  if (!toolboxBtn) {
    return false;
  }

  (toolboxBtn as HTMLElement).click();
  await sleep(600); // Wait for menu animation

  return true;
}

// Check if a specific tool is currently active/selected
function isToolCurrentlyActive(tool: GeminiTool): boolean {
  if (tool === GeminiTool.NONE) {
    return true; // NONE is always "selected"
  }

  const toolConfig = TOOL_SELECTORS[tool];

  // Method 1: Check for active tool indicator in the input area
  // Gemini shows the active tool as a chip/badge near the input
  const activeToolChips = document.querySelectorAll(
    "chip-button-input, .tool-chip, .active-tool-indicator"
  );
  for (const chip of activeToolChips) {
    const text = chip.textContent?.toLowerCase() ?? "";
    for (const pattern of toolConfig.textPatterns) {
      if (text.includes(pattern.toLowerCase())) {
        return true;
      }
    }
    // Check for icon inside chip
    for (const iconName of toolConfig.fontIcons) {
      const icon = chip.querySelector(
        `mat-icon[fonticon="${iconName}"], mat-icon[data-mat-icon-name="${iconName}"]`
      );
      if (icon) {
        return true;
      }
    }
  }

  // Method 2: Check for tool selection indicators in the UI
  // Some tools show as "selected" with specific classes or attributes
  const selectedToolIndicators = document.querySelectorAll(
    '[aria-pressed="true"], [aria-selected="true"], .selected-tool, .active-mode'
  );
  for (const indicator of selectedToolIndicators) {
    const text = indicator.textContent?.toLowerCase() ?? "";
    for (const pattern of toolConfig.textPatterns) {
      if (text.includes(pattern.toLowerCase())) {
        return true;
      }
    }
  }

  // Method 3: Check for tool-specific input mode (e.g., image mode shows an image icon)
  const inputArea = document.querySelector("rich-textarea, .input-area, .prompt-input");
  if (inputArea) {
    for (const iconName of toolConfig.fontIcons) {
      const icon = inputArea.querySelector(
        `mat-icon[fonticon="${iconName}"], mat-icon[data-mat-icon-name="${iconName}"]`
      );
      if (icon) {
        return true;
      }
    }
  }

  return false;
}

async function selectTool(tool: GeminiTool): Promise<boolean> {
  if (tool === GeminiTool.NONE) {
    return true;
  }

  if (currentActiveTool === tool) {
    return true;
  }

  if (isToolCurrentlyActive(tool)) {
    currentActiveTool = tool;
    return true;
  }

  // First open the toolbox
  const toolboxOpened = await openToolbox();
  if (!toolboxOpened) {
    // Failed to open toolbox, trying to find tool button directly
  }

  await sleep(500); // Wait longer for drawer animation

  const toolConfig = TOOL_SELECTORS[tool];
  let toolBtn: HTMLElement | null = null;

  // Method 1: Find by fonticon attribute (most reliable for Angular Material icons)
  if (!toolBtn && toolConfig.fontIcons.length > 0) {
    for (const iconName of toolConfig.fontIcons) {
      // Try multiple selector patterns for mat-icon
      const iconSelectors = [
        `mat-icon[fonticon="${iconName}"]`,
        `mat-icon[data-mat-icon-name="${iconName}"]`,
        `mat-icon[ng-reflect-fonticon="${iconName}"]`,
      ];

      for (const selector of iconSelectors) {
        const icons = document.querySelectorAll(selector);
        for (const icon of icons) {
          const btn = icon.closest("button");
          if (btn && !btn.disabled && btn.offsetParent !== null) {
            // Check if button is in the toolbox drawer
            const isInDrawer =
              btn.classList.contains("toolbox-drawer-item-list-button") ||
              btn.closest("toolbox-drawer-item") ||
              btn.closest("mat-action-list");
            if (isInDrawer) {
              toolBtn = btn as HTMLElement;
              break;
            }
          }
        }
        if (toolBtn) break;
      }
      if (toolBtn) break;
    }
  }

  // Method 2: Find by jf-ext-button-ct attribute (Hebrew)
  if (!toolBtn) {
    toolBtn = document.querySelector(`button[jf-ext-button-ct*="${toolConfig.jfExtHebrew}" i]`)!;
  }

  // Method 3: Find by jf-ext-button-ct attribute (English)
  if (!toolBtn && toolConfig.jfExtEnglish) {
    toolBtn = document.querySelector(`button[jf-ext-button-ct*="${toolConfig.jfExtEnglish}" i]`)!;
  }

  // Method 4: Find by text content in toolbox drawer buttons (prioritize drawer items)
  if (!toolBtn) {
    const listButtons = document.querySelectorAll(".toolbox-drawer-item-list-button");
    for (const btn of listButtons) {
      const text = btn.textContent?.trim().toLowerCase() ?? "";
      for (const pattern of toolConfig.textPatterns) {
        if (text.includes(pattern.toLowerCase())) {
          toolBtn = btn as HTMLElement;
          break;
        }
      }
      if (toolBtn) break;
    }
  }

  // Method 5: Find by text content in any button (fallback)
  if (!toolBtn) {
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
      const text = btn.textContent?.trim().toLowerCase() ?? "";
      for (const pattern of toolConfig.textPatterns) {
        if (text.includes(pattern.toLowerCase())) {
          toolBtn = btn as HTMLElement;
          break;
        }
      }
      if (toolBtn) break;
    }
  }

  // Method 6: Special case for image - find by image icon src
  if (!toolBtn && tool === GeminiTool.IMAGE) {
    const imgs = document.querySelectorAll('img[src*="image"], img[src*="boq-bard"]');
    for (const img of imgs) {
      const btn = img.closest("button");
      if (btn) {
        toolBtn = btn as HTMLElement;
        break;
      }
    }
  }

  if (!toolBtn) {
    return false;
  }

  toolBtn.click();
  await sleep(400);

  currentActiveTool = tool;
  return true;
}

function isModeCurrentlyActive(mode: GeminiMode): boolean {
  const modeInfo = GEMINI_MODE_INFO[mode];

  const modeButton = document.querySelector(`[data-test-id="${modeInfo.dataTestId}"]`);
  if (modeButton) {
    const hasCheckIcon = modeButton.querySelector(
      'mat-icon[fonticon="check_circle"], mat-icon[data-mat-icon-name="check_circle"]'
    );
    if (hasCheckIcon) {
      return true;
    }

    const isPressed = modeButton.getAttribute("aria-pressed") === "true";
    const isSelected = modeButton.getAttribute("aria-selected") === "true";
    const hasActiveClass =
      modeButton.classList.contains("active") ||
      modeButton.classList.contains("selected") ||
      modeButton.classList.contains("mdc-tab--active");
    if (isPressed || isSelected || hasActiveClass) {
      return true;
    }
  }

  const activeIndicators = document.querySelectorAll(
    '[aria-pressed="true"], [aria-selected="true"], .selected, .active, .mdc-tab--active'
  );
  for (const indicator of activeIndicators) {
    const text = indicator.textContent?.toLowerCase() ?? "";
    if (
      text.includes(modeInfo.labelHebrew.toLowerCase()) ||
      text.includes(modeInfo.label.toLowerCase())
    ) {
      return true;
    }
  }

  const url = window.location.href.toLowerCase();
  if (mode === GeminiMode.Pro && url.includes("pro")) {
    return true;
  }

  return false;
}

async function openModeMenu(): Promise<boolean> {
  const modeMenuTriggers = [
    '[data-test-id="bard-mode-menu-trigger"]',
    '[data-test-id="mobile-nested-mode-menu-trigger"]',
    'button[aria-haspopup="menu"][aria-expanded]',
    ".gds-mode-switch-menu-list",
  ];

  for (const selector of modeMenuTriggers) {
    const trigger = document.querySelector(selector) as HTMLElement | null;
    if (trigger) {
      trigger.click();
      await sleep(400);
      return true;
    }
  }

  const buttons = document.querySelectorAll("button");
  for (const btn of buttons) {
    const text = btn.textContent?.toLowerCase() ?? "";
    const ariaLabel = btn.getAttribute("aria-label")?.toLowerCase() ?? "";
    if (
      text.includes("gemini") ||
      text.includes("fast") ||
      text.includes("thinking") ||
      text.includes("pro") ||
      ariaLabel.includes("mode") ||
      ariaLabel.includes("model")
    ) {
      const hasPopup = btn.getAttribute("aria-haspopup");
      if (hasPopup) {
        btn.click();
        await sleep(400);
        return true;
      }
    }
  }

  return false;
}

async function selectMode(mode: GeminiMode): Promise<boolean> {
  if (isModeCurrentlyActive(mode)) {
    currentActiveMode = mode;
    return true;
  }

  const modeInfo = GEMINI_MODE_INFO[mode];

  let modeBtn = document.querySelector(
    `[data-test-id="${modeInfo.dataTestId}"]`
  ) as HTMLElement | null;

  if (!modeBtn) {
    await openModeMenu();
    await sleep(300);

    modeBtn = document.querySelector(
      `[data-test-id="${modeInfo.dataTestId}"]`
    ) as HTMLElement | null;
  }

  if (!modeBtn) {
    const buttons = document.querySelectorAll("button, [role='menuitem'], [role='option']");
    for (const btn of buttons) {
      const text = btn.textContent?.trim().toLowerCase() ?? "";
      if (text.includes(modeInfo.label.toLowerCase())) {
        modeBtn = btn as HTMLElement;
        break;
      }
    }
  }

  if (!modeBtn) {
    const tabs = document.querySelectorAll("[role='tablist'] [role='tab']");
    for (const tab of tabs) {
      const text = tab.textContent?.trim() ?? "";
      if (
        text.includes(modeInfo.labelHebrew) ||
        text.toLowerCase().includes(modeInfo.label.toLowerCase())
      ) {
        modeBtn = tab as HTMLElement;
        break;
      }
    }
  }

  if (!modeBtn) {
    return false;
  }

  modeBtn.click();
  await sleep(300);

  if (isModeCurrentlyActive(mode)) {
    currentActiveMode = mode;
    return true;
  }

  currentActiveMode = mode;
  return true;
}

// Submit the prompt
async function submitPrompt(): Promise<boolean> {
  // Try to find submit button with various selectors
  let submitBtn = findElement(
    SELECTORS.submitButton,
    SELECTORS.submitButtonAlt,
    SELECTORS.submitButtonAlt2,
    SELECTORS.submitButtonAlt3,
    SELECTORS.submitButtonAlt4
  );

  // Method 1: Find by mat-icon with send icon
  if (!submitBtn) {
    const icons = document.querySelectorAll(
      'mat-icon[fonticon="send"], mat-icon[data-mat-icon-name="send"]'
    );
    for (const icon of icons) {
      const btn = icon.closest("button");
      if (btn && !btn.disabled) {
        submitBtn = btn;
        break;
      }
    }
  }

  // Method 2: Find by aria-label containing send/submit keywords
  if (!submitBtn) {
    const buttons = document.querySelectorAll("button:not([disabled])");
    for (const btn of buttons) {
      const ariaLabel = (btn.getAttribute("aria-label") ?? "").toLowerCase();
      if (
        ariaLabel.includes("send") ||
        ariaLabel.includes("submit") ||
        ariaLabel.includes("שליחה") ||
        ariaLabel.includes("הנחיה")
      ) {
        submitBtn = btn;
        break;
      }
    }
  }

  // Method 3: Find by text content "send"
  if (!submitBtn) {
    const buttons = document.querySelectorAll("button:not([disabled])");
    for (const btn of buttons) {
      const text = btn.textContent?.toLowerCase() ?? "";
      if (text === "send" || text.includes("שליחה")) {
        submitBtn = btn;
        break;
      }
    }
  }

  // Method 4: Press Enter key as fallback
  if (!submitBtn) {
    const editor = findElement(
      SELECTORS.textInput,
      SELECTORS.textInputAlt,
      SELECTORS.textInputAlt2,
      SELECTORS.textInputAlt3
    );
    if (editor) {
      (editor as HTMLElement).focus();

      // Dispatch Enter keydown event
      const enterDown = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
      });
      editor.dispatchEvent(enterDown);

      // Also dispatch keypress and keyup for completeness
      const enterPress = new KeyboardEvent("keypress", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
      });
      editor.dispatchEvent(enterPress);

      const enterUp = new KeyboardEvent("keyup", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
      });
      editor.dispatchEvent(enterUp);

      await sleep(500);
      return true;
    }
    return false;
  }

  (submitBtn as HTMLElement).click();
  await sleep(300);

  return true;
}

// Check if video is currently being generated
function isVideoGenerating(): boolean {
  // Check for async-processing-chip with video-related text
  const asyncChips = document.querySelectorAll("async-processing-chip");
  for (const chip of asyncChips) {
    const text = chip.textContent?.toLowerCase() ?? "";
    // Check for Hebrew text "יוצר את הסרטון" or English "creating video" or "generating video"
    const hasVideoText =
      text.includes("יוצר את הסרטון") ||
      text.includes("creating video") ||
      text.includes("generating video") ||
      text.includes("generating your video") ||
      text.includes("creating your video") ||
      (text.includes("video") && (text.includes("creating") || text.includes("generating"))) ||
      (text.includes("סרטון") && text.includes("יוצר"));

    if (hasVideoText) {
      // Check if there's a spinner/loading indicator inside
      const spinner = chip.querySelector(
        ".spinner, lottie-animation, [class*='spinner'], svg[viewBox*='32']"
      );
      // Also check for movie icon (video generation indicator)
      const movieIcon = chip.querySelector(
        'mat-icon[fonticon="movie"], mat-icon[data-mat-icon-name="movie"]'
      );
      if (spinner || movieIcon) {
        return true;
      }
    }
  }

  // Check for video generation messages in response elements
  const responseElements = document.querySelectorAll("response-element");
  for (const element of responseElements) {
    const text = element.textContent?.toLowerCase() ?? "";
    if (
      text.includes("generating your video") ||
      text.includes("creating your video") ||
      text.includes("this could take a few minutes") ||
      text.includes("יוצר את הסרטון") ||
      text.includes("זה יכול לקחת כמה דקות")
    ) {
      // Check if there's still a processing indicator
      const processingChip = element.querySelector("async-processing-chip");
      if (processingChip) {
        return true;
      }
    }
  }

  // Check for video generation message in markdown content
  const markdownElements = document.querySelectorAll(
    '.markdown, [class*="markdown"], [id*="model-response-message-content"]'
  );
  for (const element of markdownElements) {
    const text = element.textContent?.toLowerCase() ?? "";
    if (
      text.includes("generating your video") ||
      text.includes("this could take a few minutes") ||
      text.includes("check back to see when your video is ready")
    ) {
      // Check if there's an async-processing-chip nearby
      const processingChip = element.querySelector("async-processing-chip");
      if (processingChip) {
        return true;
      }
    }
  }

  return false;
}

// Check if video generation is complete
function isVideoGenerationComplete(): boolean {
  // Check if video element exists in the response
  const videoElements = document.querySelectorAll(
    "video, iframe[src*='video'], video[src], video[controls], video[preload]"
  );
  if (videoElements.length > 0) {
    // Verify the video element has a valid source
    for (const video of videoElements) {
      if (video.tagName === "VIDEO") {
        const videoEl = video as HTMLVideoElement;
        if (videoEl.src || videoEl.currentSrc) {
          return true;
        }
      } else if (video.tagName === "IFRAME") {
        const iframeEl = video as HTMLIFrameElement;
        if (iframeEl.src) {
          return true;
        }
      }
    }
  }

  // Check if async-processing-chip for video has disappeared (video is ready)
  const asyncChips = document.querySelectorAll("async-processing-chip");
  let hasVideoProcessing = false;
  for (const chip of asyncChips) {
    const text = chip.textContent?.toLowerCase() ?? "";
    const hasVideoText =
      text.includes("יוצר את הסרטון") ||
      text.includes("creating video") ||
      text.includes("generating video") ||
      text.includes("generating your video") ||
      (text.includes("video") && (text.includes("creating") || text.includes("generating")));
    if (hasVideoText) {
      // Check if spinner is still present
      const spinner = chip.querySelector(
        ".spinner, lottie-animation, [class*='spinner'], svg[viewBox*='32']"
      );
      if (spinner) {
        hasVideoProcessing = true;
        break;
      }
    }
  }

  // If we previously detected video generation but now the chip is gone or spinner stopped, check for completion
  if (!hasVideoProcessing) {
    // Check for video element that might have appeared
    const videoElements = document.querySelectorAll("video, iframe[src*='video']");
    if (videoElements.length > 0) {
      return true;
    }

    // Check for completion messages in response elements
    const responseElements = document.querySelectorAll("response-element");
    for (const element of responseElements) {
      const text = element.textContent?.toLowerCase() ?? "";
      // Check for completion messages
      if (
        text.includes("video is ready") ||
        text.includes("your video is ready") ||
        text.includes("הסרטון מוכן") ||
        text.includes("הסרטון שלך מוכן") ||
        (text.includes("video") && !text.includes("generating") && !text.includes("creating"))
      ) {
        // Make sure there's no active processing chip
        const processingChip = element.querySelector("async-processing-chip");
        if (!processingChip) {
          return true;
        }
      }
    }

    // Check markdown content for completion
    const markdownElements = document.querySelectorAll(
      '.markdown, [class*="markdown"], [id*="model-response-message-content"]'
    );
    for (const element of markdownElements) {
      const text = element.textContent?.toLowerCase() ?? "";
      // If text mentions video but NOT generating/creating, and no processing chip, it's likely done
      if (
        (text.includes("video") || text.includes("סרטון")) &&
        !text.includes("generating") &&
        !text.includes("creating") &&
        !text.includes("יוצר")
      ) {
        const processingChip = element.querySelector("async-processing-chip");
        if (!processingChip) {
          return true;
        }
      }
    }
  }

  return false;
}

// Check if canvas is currently being generated
function isCanvasGenerating(): boolean {
  // Check for thinking avatar with class "thinking" (indicates canvas generation)
  const thinkingAvatars = document.querySelectorAll("bard-avatar.thinking, .bard-avatar.thinking");
  if (thinkingAvatars.length > 0) {
    // Check if there's a lottie-animation spinner inside
    for (const avatar of thinkingAvatars) {
      const spinner = avatar.querySelector("lottie-animation, .avatar_spinner_animation");
      if (spinner) {
        return true;
      }
    }
  }

  // Check for aria-busy="true" on markdown elements (indicates active generation)
  const busyElements = document.querySelectorAll('[aria-busy="true"]');
  for (const element of busyElements) {
    // Check if it's a markdown/content element
    if (
      element.classList.contains("markdown") ||
      element.id?.includes("model-response-message-content") ||
      element.closest(".model-response-text")
    ) {
      // Check if there's no immersive-entry-chip yet (canvas not ready)
      const canvasChip = element
        .closest(".response-container")
        ?.querySelector("immersive-entry-chip");
      if (!canvasChip) {
        return true;
      }
    }
  }

  // Check for canvas-related text with processing indicators
  const responseElements = document.querySelectorAll("response-element, .response-container");
  for (const element of responseElements) {
    const text = element.textContent?.toLowerCase() ?? "";
    if (
      text.includes("canvas") ||
      text.includes("drawing") ||
      text.includes("scribble") ||
      text.includes("interactive")
    ) {
      // Check if there's a thinking avatar but no canvas chip yet
      const thinkingAvatar = element.querySelector("bard-avatar.thinking, .bard-avatar.thinking");
      const canvasChip = element.querySelector("immersive-entry-chip");
      if (thinkingAvatar && !canvasChip) {
        return true;
      }
    }
  }

  return false;
}

// Check if canvas generation is complete
function isCanvasGenerationComplete(): boolean {
  // Check if immersive-entry-chip exists (this is the canvas artifact)
  const canvasChips = document.querySelectorAll("immersive-entry-chip");
  if (canvasChips.length > 0) {
    // Verify the chip is visible and has content
    for (const chip of canvasChips) {
      const htmlChip = chip as HTMLElement;
      const isVisible = htmlChip.offsetParent !== null; // Check if element is visible
      const hasContent = chip.textContent && chip.textContent.trim().length > 0;
      if (isVisible && hasContent) {
        return true;
      }
    }
  }

  // Check if thinking avatar has disappeared (generation complete)
  const thinkingAvatars = document.querySelectorAll("bard-avatar.thinking, .bard-avatar.thinking");
  let hasActiveThinking = false;
  for (const avatar of thinkingAvatars) {
    const spinner = avatar.querySelector("lottie-animation, .avatar_spinner_animation");
    if (spinner) {
      hasActiveThinking = true;
      break;
    }
  }

  // If no active thinking and aria-busy is false, check for canvas chip
  if (!hasActiveThinking) {
    const busyElements = document.querySelectorAll('[aria-busy="true"]');
    const hasActiveBusy = Array.from(busyElements).some((el) => {
      return (
        el.classList.contains("markdown") ||
        el.id?.includes("model-response-message-content") ||
        el.closest(".model-response-text")
      );
    });

    if (!hasActiveBusy) {
      // Check for canvas chip that might have appeared
      const canvasChips = document.querySelectorAll("immersive-entry-chip");
      if (canvasChips.length > 0) {
        return true;
      }
    }
  }

  return false;
}

// Check if Gemini is currently thinking/processing
function isGeminiThinking(): boolean {
  // Check for thinking avatar (animated star)
  const thinkingAvatar = document.querySelector(SELECTORS.thinkingAvatar);
  if (thinkingAvatar) {
    return true;
  }

  // Check for processing state container
  const processingState = document.querySelector(SELECTORS.processingState);
  if (processingState) {
    return true;
  }

  // Check for processing button
  const processingButton = document.querySelector(SELECTORS.processingButton);
  if (processingButton) {
    return true;
  }

  // Check for generic loading indicators (but exclude canvas-specific busy states)
  const loading = document.querySelector('[data-loading="true"]');
  if (loading) {
    return true;
  }

  // Check for lottie-animation spinners (common in Gemini UI)
  const lottieSpinners = document.querySelectorAll("lottie-animation");
  for (const spinner of lottieSpinners) {
    // Check if it's in a response container or avatar (active generation)
    const inResponse = spinner.closest(".response-container, .bard-avatar, model-response");
    if (inResponse) {
      return true;
    }
  }

  // Check for mat-spinner elements
  const matSpinners = document.querySelectorAll("mat-spinner, .mat-mdc-progress-spinner");
  if (matSpinners.length > 0) {
    return true;
  }

  // Check for stop button (appears when generating)
  const stopButtons = document.querySelectorAll(
    'button[aria-label*="Stop"], button[aria-label*="עצור"], button[aria-label*="Cancel"]'
  );
  for (const btn of stopButtons) {
    const htmlBtn = btn as HTMLElement;
    // Check if button is visible and not disabled
    if (htmlBtn.offsetParent !== null && !htmlBtn.hasAttribute("disabled")) {
      return true;
    }
  }

  // Check for streaming/typing indicators
  const streamingIndicators = document.querySelectorAll(
    ".streaming, .typing, [class*='streaming'], [class*='typing'], .cursor-blink"
  );
  if (streamingIndicators.length > 0) {
    return true;
  }

  // Check for aria-busy but only if it's not canvas (canvas has its own detection)
  const busyElements = document.querySelectorAll('[aria-busy="true"]');
  for (const element of busyElements) {
    // Skip if it's canvas-related (we handle that separately)
    const isCanvasRelated =
      element.closest(".response-container")?.querySelector("immersive-entry-chip") !== null;
    if (!isCanvasRelated) {
      return true;
    }
  }

  // Check for response elements that are still being populated
  const responseElements = document.querySelectorAll("model-response, response-element");
  for (const response of responseElements) {
    // Check if there's an active animation or loading state
    const hasActiveSpinner = response.querySelector(
      "lottie-animation, mat-spinner, .loading, [class*='loading']"
    );
    if (hasActiveSpinner) {
      return true;
    }
  }

  return false;
}

// Count the number of response elements to detect new responses
function countResponses(): number {
  const responses = document.querySelectorAll(
    "model-response, response-element, .response-container, [data-message-id]"
  );
  return responses.length;
}

// Check if a new response has content (text, images, etc.)
function hasResponseContent(): boolean {
  // Check for generated images
  const images = document.querySelectorAll(
    ".response-container img:not([src*='avatar']), .generated-image, img[alt*='Generated'], img[src*='blob:'], img[src*='data:']"
  );
  if (images.length > 0) {
    // Make sure at least one image is visible
    for (const img of images) {
      const htmlImg = img as HTMLImageElement;
      if (htmlImg.offsetParent !== null && htmlImg.complete && htmlImg.naturalWidth > 0) {
        return true;
      }
    }
  }

  // Check for markdown/text content
  const textElements = document.querySelectorAll(
    ".markdown, .model-response-text, .response-text, [class*='message-content']"
  );
  for (const el of textElements) {
    const text = el.textContent?.trim() ?? "";
    // Must have substantial content (not just loading text)
    if (text.length > 50 && !text.includes("Generating") && !text.includes("יוצר")) {
      return true;
    }
  }

  return false;
}

// Wait for generation to complete - uses network monitoring as primary detection
async function waitForGenerationComplete(
  tool: GeminiTool = GeminiTool.IMAGE,
  timeout = 180000
): Promise<boolean> {
  // Use longer timeout for video/canvas generation (they can take 2-5 minutes)
  const effectiveTimeout =
    tool === GeminiTool.VIDEO
      ? Math.max(timeout, 300000) // 5 minutes for video
      : tool === GeminiTool.CANVAS
        ? Math.max(timeout, 300000) // 5 minutes for canvas
        : timeout;

  // Count initial responses to detect when new one appears
  const initialResponseCount = countResponses();

  // Wait a moment for the request to start
  await sleep(500);

  const startTime = Date.now();

  // Primary method: Wait for network requests to complete
  // This is more reliable than DOM polling
  const networkCompletePromise = waitForNetworkComplete(effectiveTimeout);

  // Also run DOM-based detection in parallel as fallback
  const domCompletePromise = waitForDOMGenerationComplete(
    tool,
    effectiveTimeout,
    initialResponseCount,
    startTime
  );

  await Promise.all([networkCompletePromise, domCompletePromise]);

  // After network/DOM completion, give extra time for specific content types
  if (tool === GeminiTool.VIDEO || isVideoGenerating()) {
    // Wait for video element to appear
    for (let i = 0; i < 10; i++) {
      if (isVideoGenerationComplete()) {
        await sleep(2000);
        return true;
      }
      await sleep(1000);
    }
  }

  if (tool === GeminiTool.CANVAS || isCanvasGenerating()) {
    // Wait for canvas chip to appear
    for (let i = 0; i < 10; i++) {
      if (isCanvasGenerationComplete()) {
        await sleep(1500);
        return true;
      }
      await sleep(500);
    }
  }

  // For images, verify images are loaded
  if (tool === GeminiTool.IMAGE) {
    await sleep(1500);
    const responseImages = document.querySelectorAll(
      ".response-container img:not([src*='avatar']), .generated-image, img[alt*='Generated'], img[src*='blob:'], img[src*='data:']"
    );
    if (responseImages.length > 0) {
      // Wait for images to fully load
      await Promise.all(
        Array.from(responseImages).map((img) => {
          const htmlImg = img as HTMLImageElement;
          if (htmlImg.complete) return Promise.resolve();
          return new Promise((resolve) => {
            htmlImg.onload = resolve;
            htmlImg.onerror = resolve;
            setTimeout(resolve, 5000); // Timeout after 5s
          });
        })
      );
    }
  }

  // Final buffer to ensure DOM is fully updated
  await sleep(500);

  return true;
}

// DOM-based fallback for generation detection
async function waitForDOMGenerationComplete(
  tool: GeminiTool,
  timeout: number,
  initialResponseCount: number,
  startTime: number
): Promise<boolean> {
  let wasVideoGenerating = false;
  let wasCanvasGenerating = false;
  let consecutiveIdleChecks = 0;
  const requiredIdleChecks = 4;

  while (Date.now() - startTime < timeout) {
    const isThinking = isGeminiThinking();
    const isVideoGen = isVideoGenerating();
    const isCanvasGen = isCanvasGenerating();
    const isNetworkActive = isNetworkGenerating();

    // Track if we detected video/canvas generation
    if (isVideoGen && !wasVideoGenerating) wasVideoGenerating = true;
    if (isCanvasGen && !wasCanvasGenerating) wasCanvasGenerating = true;

    // Check for specific completion states
    if (tool === GeminiTool.VIDEO || wasVideoGenerating) {
      if (isVideoGenerationComplete()) return true;
    }

    if (tool === GeminiTool.CANVAS || wasCanvasGenerating) {
      if (isCanvasGenerationComplete()) return true;
    }

    // If nothing is active (DOM + network), check for completion
    if (!isThinking && !isVideoGen && !isCanvasGen && !isNetworkActive) {
      consecutiveIdleChecks++;

      const hasContent = hasResponseContent();
      const newResponseCount = countResponses();
      const hasNewResponse = newResponseCount > initialResponseCount;

      if ((hasContent || hasNewResponse) && consecutiveIdleChecks >= requiredIdleChecks) {
        return true;
      }
    } else {
      consecutiveIdleChecks = 0;
    }

    await sleep(500); // Faster polling since network is primary
  }

  return true;
}

async function processPromptThroughUI(
  prompt: string,
  tool: GeminiTool = GeminiTool.IMAGE,
  images?: string[],
  mode?: GeminiMode
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[NanoFlow Content] processPromptThroughUI starting", {
      tool,
      mode,
      hasImages: !!images?.length,
    });

    if (mode) {
      console.log("[NanoFlow Content] Selecting mode:", mode);
      await selectMode(mode);
    }

    if (tool !== GeminiTool.NONE) {
      console.log("[NanoFlow Content] Selecting tool:", tool);
      const toolSelected = await selectTool(tool);
      if (!toolSelected) {
        return { success: false, error: `Failed to select tool: ${tool}` };
      }
    }

    if (images && images.length > 0) {
      console.log("[NanoFlow Content] Uploading", images.length, "images");
      const uploaded = await uploadImages(images);
      if (!uploaded) {
        console.log("[NanoFlow Content] Image upload failed, continuing with text only");
      }
      await sleep(500);
    }

    console.log("[NanoFlow Content] Pasting prompt...");
    const pasted = await pastePromptToInput(prompt);
    if (!pasted) {
      return { success: false, error: "Failed to paste prompt - input field not found" };
    }

    console.log("[NanoFlow Content] Submitting prompt...");
    const submitted = await submitPrompt();
    if (!submitted) {
      return { success: false, error: "Failed to submit - send button not found or disabled" };
    }

    console.log("[NanoFlow Content] Waiting for generation to complete...");
    await waitForGenerationComplete(tool);

    console.log("[NanoFlow Content] Generation complete!");
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[NanoFlow Content] processPromptThroughUI error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

export const automationModule = {
  selectMode,
  processPrompt: processPromptThroughUI,
  init() {
    console.log("[NanoFlow Content] automationModule.init() called");
    initNetworkMonitor();

    chrome.runtime
      .sendMessage({
        type: MessageType.CONTENT_SCRIPT_READY,
      })
      .then(() => console.log("[NanoFlow Content] CONTENT_SCRIPT_READY sent"))
      .catch((e) => console.log("[NanoFlow Content] CONTENT_SCRIPT_READY failed:", e));

    chrome.runtime.onMessage.addListener(
      (message: ExtensionMessage, _sender, sendResponse: (response: ExtensionResponse) => void) => {
        console.log("[NanoFlow Content] Received message:", message.type);
        const handleAsync = async () => {
          switch (message.type) {
            case MessageType.PING: {
              return { success: true };
            }

            case MessageType.PASTE_PROMPT: {
              const payload = message.payload as {
                prompt: string;
                tool?: GeminiTool;
                images?: string[];
                mode?: GeminiMode;
              };
              const result = await processPromptThroughUI(
                payload.prompt,
                payload.tool || GeminiTool.IMAGE,
                payload.images,
                payload.mode
              );
              return { success: result.success, error: result.error };
            }

            case MessageType.ENABLE_IMAGE_CREATION: {
              const success = await selectTool(GeminiTool.IMAGE);
              return { success };
            }

            case MessageType.SUBMIT_PROMPT: {
              const success = await submitPrompt();
              return { success };
            }

            default:
              return { success: false, error: "Unknown message type" };
          }
        };

        handleAsync()
          .then(sendResponse)
          .catch((error) => {
            sendResponse({
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          });

        return true; // Indicates async response
      }
    );

    // Add keyboard shortcut to toggle sidebar
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + Shift + G to toggle sidebar visibility
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "g") {
        e.preventDefault();
        // Dispatch custom event for sidebar toggle
        window.dispatchEvent(new CustomEvent("nano-flow-toggle-sidebar"));
      }
    });
  },
};
