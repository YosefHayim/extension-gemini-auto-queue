import type { ExtensionMessage, ExtensionResponse } from "@/types";
import { GeminiTool, MessageType } from "@/types";

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
} as const;

// Tool button selectors - maps GeminiTool to button identifiers
const TOOL_SELECTORS: Record<
  GeminiTool,
  { jfExtHebrew: string; jfExtEnglish: string; textPatterns: string[] }
> = {
  [GeminiTool.NONE]: { jfExtHebrew: "", jfExtEnglish: "", textPatterns: [] },
  [GeminiTool.IMAGE]: {
    jfExtHebrew: "יצירת תמונות",
    jfExtEnglish: "Image creation",
    textPatterns: ["יצירת תמונות", "Image creation", "Create image", "Generate image"],
  },
  [GeminiTool.VIDEO]: {
    jfExtHebrew: "יצירת סרטונים",
    jfExtEnglish: "Video creation",
    textPatterns: ["יצירת סרטונים", "Video creation", "Veo", "Create video"],
  },
  [GeminiTool.CANVAS]: {
    jfExtHebrew: "canvas",
    jfExtEnglish: "canvas",
    textPatterns: ["Canvas", "canvas"],
  },
  [GeminiTool.DEEP_RESEARCH]: {
    jfExtHebrew: "deep research",
    jfExtEnglish: "deep research",
    textPatterns: ["Deep Research", "deep research", "מחקר מעמיק"],
  },
  [GeminiTool.LEARNING]: {
    jfExtHebrew: "למידה מותאמת אישית",
    jfExtEnglish: "personalized learning",
    textPatterns: ["למידה מותאמת אישית", "Personalized learning", "Learning"],
  },
  [GeminiTool.VISUAL_LAYOUT]: {
    jfExtHebrew: "פריסה חזותית",
    jfExtEnglish: "visual layout",
    textPatterns: ["פריסה חזותית", "Visual layout", "Layout"],
  },
};

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

// Upload images to Gemini
async function uploadImages(images: string[]): Promise<boolean> {
  if (!images || images.length === 0) {
    return true; // No images to upload
  }

  // Find the upload button
  let uploadBtn = findElement(
    SELECTORS.uploadButton,
    SELECTORS.uploadButtonAlt,
    SELECTORS.uploadButtonAlt2,
    SELECTORS.uploadButtonAlt3
  );

  // Fallback: find by icon
  if (!uploadBtn) {
    const addIcons = document.querySelectorAll(
      'mat-icon[fonticon="add_2"], mat-icon[fonticon="add"], mat-icon[data-mat-icon-name="add"]'
    );
    for (const icon of addIcons) {
      const btn = icon.closest("button");
      if (btn) {
        uploadBtn = btn;
        break;
      }
    }
  }

  // Fallback: find by aria-label patterns
  if (!uploadBtn) {
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
      const ariaLabel = (btn.getAttribute("aria-label") ?? "").toLowerCase();
      if (
        ariaLabel.includes("upload") ||
        ariaLabel.includes("file") ||
        ariaLabel.includes("העלא") ||
        ariaLabel.includes("קובץ")
      ) {
        uploadBtn = btn;
        break;
      }
    }
  }

  if (!uploadBtn) {
    // Upload button not found, trying to find file input directly
  } else {
    // Click to open upload menu
    (uploadBtn as HTMLElement).click();
    await sleep(500);
  }

  // Find the file input
  let fileInput = document.querySelector(SELECTORS.fileInput)!;

  // Sometimes the input is hidden or in a different location
  if (!fileInput) {
    // Look for any file input that accepts images
    const inputs = document.querySelectorAll('input[type="file"]');
    for (const input of inputs) {
      const accept = input.getAttribute("accept") ?? "";
      if (accept.includes("image") || accept === "*/*" || !accept) {
        fileInput = input as HTMLInputElement;
        break;
      }
    }
  }

  if (!fileInput) {
    return false;
  }

  // Convert base64 images to File objects
  const files: File[] = images.map((img, index) => base64ToFile(img, `image_${index + 1}.png`));

  // Create a DataTransfer to set files
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));

  // Set the files on the input
  fileInput.files = dataTransfer.files;

  // Trigger change event
  const changeEvent = new Event("change", { bubbles: true });
  fileInput.dispatchEvent(changeEvent);

  // Also trigger input event
  const inputEvent = new Event("input", { bubbles: true });
  fileInput.dispatchEvent(inputEvent);

  // Wait for upload to process
  await sleep(1000);

  return true;
}

// Paste text into the Quill editor
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

// Select a specific Gemini tool
async function selectTool(tool: GeminiTool): Promise<boolean> {
  // If NONE, skip tool selection
  if (tool === GeminiTool.NONE) {
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

  // Method 1: Find by jf-ext-button-ct attribute (Hebrew)
  toolBtn = document.querySelector(`button[jf-ext-button-ct*="${toolConfig.jfExtHebrew}" i]`)!;

  // Method 2: Find by jf-ext-button-ct attribute (English)
  if (!toolBtn && toolConfig.jfExtEnglish) {
    toolBtn = document.querySelector(`button[jf-ext-button-ct*="${toolConfig.jfExtEnglish}" i]`)!;
  }

  // Method 3: Find by text content in buttons
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

  // Method 4: Find by class in toolbox drawer
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

  // Special case for image: find by image icon src
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

  return true;
}

// Legacy function for backwards compatibility
async function enableImageCreation(): Promise<boolean> {
  return selectTool(GeminiTool.IMAGE);
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

  return false;
}

// Wait for generation to complete
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

  // Wait for initial response to start appearing
  await sleep(2000);

  const startTime = Date.now();
  let lastLogTime = 0;
  let wasVideoGenerating = false;
  let wasCanvasGenerating = false;

  // Wait until Gemini stops thinking
  while (Date.now() - startTime < effectiveTimeout) {
    const isThinking = isGeminiThinking();
    const isVideoGen = isVideoGenerating();
    const isCanvasGen = isCanvasGenerating();

    // Track if we detected video generation
    if (isVideoGen && !wasVideoGenerating) {
      wasVideoGenerating = true;
    }

    // Track if we detected canvas generation
    if (isCanvasGen && !wasCanvasGenerating) {
      wasCanvasGenerating = true;
    }

    // Log progress every 5 seconds (or 10 seconds for video/canvas)
    const logInterval =
      tool === GeminiTool.VIDEO ||
      wasVideoGenerating ||
      tool === GeminiTool.CANVAS ||
      wasCanvasGenerating
        ? 10000
        : 5000;
    if (Date.now() - lastLogTime > logInterval) {
      lastLogTime = Date.now();
    }

    // For video generation, check specifically for video completion
    if (tool === GeminiTool.VIDEO || wasVideoGenerating) {
      if (isVideoGenerationComplete()) {
        // Wait a bit more to ensure video is fully loaded
        await sleep(3000);
        return true;
      }

      // If video is still generating, continue waiting
      if (isVideoGen) {
        await sleep(3000); // Check less frequently for video (it takes longer)
        continue;
      }

      // If we were generating video but now it's not generating, check if it completed
      if (wasVideoGenerating && !isVideoGen) {
        await sleep(5000); // Give it more time for the video to appear
        if (isVideoGenerationComplete()) {
          await sleep(3000);
          return true;
        }
        // If still not complete, continue waiting (might be transitioning)
      }
    }

    // For canvas generation, check specifically for canvas completion
    if (tool === GeminiTool.CANVAS || wasCanvasGenerating) {
      if (isCanvasGenerationComplete()) {
        // Wait a bit more to ensure canvas is fully loaded
        await sleep(2000);
        return true;
      }

      // If canvas is still generating, continue waiting
      if (isCanvasGen) {
        await sleep(2000); // Check less frequently for canvas
        continue;
      }

      // If we were generating canvas but now it's not generating, check if it completed
      if (wasCanvasGenerating && !isCanvasGen) {
        await sleep(3000); // Give it time for the canvas chip to appear
        if (isCanvasGenerationComplete()) {
          await sleep(2000);
          return true;
        }
        // If still not complete, continue waiting (might be transitioning)
      }
    }

    if (!isThinking && !isVideoGen && !isCanvasGen) {
      // Double-check by waiting a moment and checking again
      await sleep(1000);

      if (!isGeminiThinking() && !isVideoGenerating() && !isCanvasGenerating()) {
        // Check if images appeared in the response
        const responseImages = document.querySelectorAll(
          ".response-container img, .generated-image, img[alt*='Generated'], img[src*='blob:']"
        );
        if (responseImages.length > 0) {
          return true;
        }

        // Check if video appeared (for non-video tools that might return video)
        if (isVideoGenerationComplete()) {
          await sleep(3000);
          return true;
        }

        // Check if canvas appeared (for non-canvas tools that might return canvas)
        if (isCanvasGenerationComplete()) {
          await sleep(2000);
          return true;
        }

        // Check if text response appeared
        const textResponse = document.querySelector(
          ".model-response-text, .response-text, .response-content"
        );
        if (textResponse && textResponse.textContent && textResponse.textContent.length > 20) {
          return true;
        }

        // If no thinking indicators and we've waited at least 5 seconds, consider it done
        // But for video/canvas, wait longer (at least 15 seconds to account for processing time)
        const minWaitTime =
          tool === GeminiTool.VIDEO ||
          wasVideoGenerating ||
          tool === GeminiTool.CANVAS ||
          wasCanvasGenerating
            ? 15000
            : 5000;
        if (Date.now() - startTime > minWaitTime) {
          return true;
        }
      }
    }

    await sleep(1000);
  }

  return true; // Return true anyway to continue with next item
}

// Process a single prompt through the UI
async function processPromptThroughUI(
  prompt: string,
  tool: GeminiTool = GeminiTool.IMAGE,
  images?: string[]
): Promise<boolean> {
  try {
    // Step 1: Select the appropriate tool
    if (tool !== GeminiTool.NONE) {
      const toolSelected = await selectTool(tool);
      if (!toolSelected) {
        // Could not select tool, continuing anyway
      }
    }

    // Step 2: Upload reference images if provided (mainly for image tool)
    if (images && images.length > 0) {
      const uploaded = await uploadImages(images);
      if (!uploaded) {
        // Could not upload images, continuing with text only
      }
      await sleep(500); // Wait for images to be processed
    }

    // Step 3: Paste the prompt
    const pasted = await pastePromptToInput(prompt);
    if (!pasted) {
      throw new Error("Failed to paste prompt");
    }

    // Step 4: Submit the prompt
    const submitted = await submitPrompt();
    if (!submitted) {
      throw new Error("Failed to submit prompt");
    }

    // Step 5: Wait for completion (pass tool type for proper detection)
    await waitForGenerationComplete(tool);

    return true;
  } catch {
    return false;
  }
}

// Automation module that handles message passing
export const automationModule = {
  init() {
    // Notify background that we're on a Gemini page and ready
    chrome.runtime
      .sendMessage({
        type: MessageType.CONTENT_SCRIPT_READY,
      })
      .catch(() => {
        // Ignore errors - background might not be listening yet
      });

    // Handle messages from background script
    chrome.runtime.onMessage.addListener(
      (message: ExtensionMessage, _sender, sendResponse: (response: ExtensionResponse) => void) => {
        const handleAsync = async () => {
          switch (message.type) {
            case MessageType.PASTE_PROMPT: {
              const payload = message.payload as {
                prompt: string;
                tool?: GeminiTool;
                images?: string[];
              };
              const success = await processPromptThroughUI(
                payload.prompt,
                payload.tool || GeminiTool.IMAGE,
                payload.images
              );
              return { success };
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
