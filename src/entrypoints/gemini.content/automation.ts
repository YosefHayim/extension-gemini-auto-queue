import type { ExtensionMessage, ExtensionResponse } from "@/types";

import { MessageType } from "@/types";

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
  // Image creation button (יצירת תמונות / Image creation)
  imageCreationButton: 'button[jf-ext-button-ct="יצירת תמונות"]',
  imageCreationButtonAlt: ".toolbox-drawer-item-list-button",
  imageCreationButtonAlt2: 'button[jf-ext-button-ct="Image creation"]',
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

// Helper to find element with multiple selectors
function findElement(...selectors: string[]): Element | null {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        console.log("[Nano Flow] Found element with selector:", selector);
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
  const mimeMatch = parts[0].match(/:(.*?);/);
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

  console.log("[Nano Flow] Uploading", images.length, "image(s)...");

  // Find the upload button
  let uploadBtn = findElement(SELECTORS.uploadButton, SELECTORS.uploadButtonAlt, SELECTORS.uploadButtonAlt2, SELECTORS.uploadButtonAlt3);

  // Fallback: find by icon
  if (!uploadBtn) {
    const addIcons = document.querySelectorAll('mat-icon[fonticon="add_2"], mat-icon[fonticon="add"], mat-icon[data-mat-icon-name="add"]');
    for (const icon of addIcons) {
      const btn = icon.closest("button");
      if (btn) {
        uploadBtn = btn;
        console.log("[Nano Flow] Found upload button by add icon");
        break;
      }
    }
  }

  // Fallback: find by aria-label patterns
  if (!uploadBtn) {
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
      const ariaLabel = (btn.getAttribute("aria-label") || "").toLowerCase();
      if (ariaLabel.includes("upload") || ariaLabel.includes("file") || ariaLabel.includes("העלא") || ariaLabel.includes("קובץ")) {
        uploadBtn = btn;
        console.log("[Nano Flow] Found upload button by aria-label:", ariaLabel);
        break;
      }
    }
  }

  if (!uploadBtn) {
    console.error("[Nano Flow] Upload button not found, trying to find file input directly");
  } else {
    // Click to open upload menu
    (uploadBtn as HTMLElement).click();
    await sleep(500);
  }

  // Find the file input
  let fileInput = document.querySelector(SELECTORS.fileInput) as HTMLInputElement;

  // Sometimes the input is hidden or in a different location
  if (!fileInput) {
    // Look for any file input that accepts images
    const inputs = document.querySelectorAll('input[type="file"]');
    for (const input of inputs) {
      const accept = input.getAttribute("accept") || "";
      if (accept.includes("image") || accept === "*/*" || !accept) {
        fileInput = input as HTMLInputElement;
        console.log("[Nano Flow] Found file input with accept:", accept);
        break;
      }
    }
  }

  if (!fileInput) {
    console.error("[Nano Flow] File input not found");
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

  console.log("[Nano Flow] Images uploaded successfully");
  return true;
}

// Paste text into the Quill editor
async function pastePromptToInput(prompt: string): Promise<boolean> {
  console.log("[Nano Flow] Pasting prompt:", prompt.substring(0, 50) + "...");

  const editor = findElement(SELECTORS.textInput, SELECTORS.textInputAlt, SELECTORS.textInputAlt2, SELECTORS.textInputAlt3);

  if (!editor) {
    console.error("[Nano Flow] Text input not found. Available elements:");
    console.log("[Nano Flow] contenteditable elements:", document.querySelectorAll('[contenteditable="true"]'));
    console.log("[Nano Flow] textbox elements:", document.querySelectorAll('[role="textbox"]'));
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
  } catch (e) {
    console.log("[Nano Flow] execCommand fallback failed:", e);
  }

  await sleep(200);

  // Remove the "blank" class if present (Quill uses this for empty state)
  editorEl.classList.remove("ql-blank");

  console.log("[Nano Flow] Prompt pasted successfully. Editor content:", editorEl.textContent?.substring(0, 50));
  return true;
}

// Click the toolbox button to open the menu
async function openToolbox(): Promise<boolean> {
  console.log("[Nano Flow] Opening toolbox...");

  // Try multiple selectors
  let toolboxBtn = findElement(SELECTORS.toolboxButton, SELECTORS.toolboxButtonAlt, SELECTORS.toolboxButtonAlt2, SELECTORS.toolboxButtonAlt3);

  // Fallback: find by aria-label containing "כלים" or "Tools"
  if (!toolboxBtn) {
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
      const ariaLabel = btn.getAttribute("aria-label") || "";
      const className = btn.className || "";
      if (ariaLabel.includes("כלים") || ariaLabel.includes("Tools") || className.includes("toolbox-drawer-button")) {
        toolboxBtn = btn;
        console.log("[Nano Flow] Found toolbox by fallback search");
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
        console.log("[Nano Flow] Found toolbox by icon");
        break;
      }
    }
  }

  if (!toolboxBtn) {
    console.error("[Nano Flow] Toolbox button not found");
    return false;
  }

  (toolboxBtn as HTMLElement).click();
  await sleep(600); // Wait for menu animation

  console.log("[Nano Flow] Toolbox opened");
  return true;
}

// Click the image creation option
async function enableImageCreation(): Promise<boolean> {
  console.log("[Nano Flow] Enabling image creation...");

  // First open the toolbox
  const toolboxOpened = await openToolbox();
  if (!toolboxOpened) {
    console.warn("[Nano Flow] Failed to open toolbox, trying to find image button directly");
  }

  await sleep(500); // Wait longer for drawer animation

  // Try multiple methods to find the image creation button
  let imageBtn: HTMLElement | null = null;

  // Method 1: Find by jf-ext-button-ct attribute
  imageBtn = document.querySelector('button[jf-ext-button-ct="יצירת תמונות"]') as HTMLElement;
  if (!imageBtn) {
    imageBtn = document.querySelector('button[jf-ext-button-ct="Image creation"]') as HTMLElement;
  }

  // Method 2: Find by text content in buttons
  if (!imageBtn) {
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
      const text = btn.textContent?.trim() || "";
      if (text.includes("יצירת תמונות") || text.includes("Image creation") || text.includes("Create image") || text.includes("Generate image")) {
        imageBtn = btn as HTMLElement;
        console.log("[Nano Flow] Found image button by text:", text.substring(0, 30));
        break;
      }
    }
  }

  // Method 3: Find by class
  if (!imageBtn) {
    const listButtons = document.querySelectorAll(".toolbox-drawer-item-list-button");
    for (const btn of listButtons) {
      const text = btn.textContent?.trim() || "";
      if (text.includes("תמונות") || text.includes("image") || text.includes("Image")) {
        imageBtn = btn as HTMLElement;
        console.log("[Nano Flow] Found image button by class:", text.substring(0, 30));
        break;
      }
    }
  }

  // Method 4: Find by image icon src
  if (!imageBtn) {
    const imgs = document.querySelectorAll('img[src*="image"], img[src*="boq-bard"]');
    for (const img of imgs) {
      const btn = img.closest("button");
      if (btn) {
        imageBtn = btn as HTMLElement;
        console.log("[Nano Flow] Found image button by img src");
        break;
      }
    }
  }

  if (!imageBtn) {
    console.error("[Nano Flow] Image creation button not found after all attempts");
    // List all buttons for debugging
    const allButtons = document.querySelectorAll("button");
    console.log("[Nano Flow] Available buttons:", allButtons.length);
    allButtons.forEach((btn, i) => {
      if (btn.textContent?.trim()) {
        console.log(`[Nano Flow] Button ${i}:`, btn.textContent?.substring(0, 50));
      }
    });
    return false;
  }

  imageBtn.click();
  await sleep(400);

  console.log("[Nano Flow] Image creation enabled");
  return true;
}

// Submit the prompt
async function submitPrompt(): Promise<boolean> {
  console.log("[Nano Flow] Submitting prompt...");

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
    const icons = document.querySelectorAll('mat-icon[fonticon="send"], mat-icon[data-mat-icon-name="send"]');
    for (const icon of icons) {
      const btn = icon.closest("button");
      if (btn && !btn.disabled) {
        submitBtn = btn;
        console.log("[Nano Flow] Found submit by send icon");
        break;
      }
    }
  }

  // Method 2: Find by aria-label containing send/submit keywords
  if (!submitBtn) {
    const buttons = document.querySelectorAll("button:not([disabled])");
    for (const btn of buttons) {
      const ariaLabel = (btn.getAttribute("aria-label") || "").toLowerCase();
      if (ariaLabel.includes("send") || ariaLabel.includes("submit") || ariaLabel.includes("שליחה") || ariaLabel.includes("הנחיה")) {
        submitBtn = btn;
        console.log("[Nano Flow] Found submit by aria-label:", ariaLabel);
        break;
      }
    }
  }

  // Method 3: Find by text content "send"
  if (!submitBtn) {
    const buttons = document.querySelectorAll("button:not([disabled])");
    for (const btn of buttons) {
      const text = btn.textContent?.toLowerCase() || "";
      if (text === "send" || text.includes("שליחה")) {
        submitBtn = btn;
        console.log("[Nano Flow] Found submit by text");
        break;
      }
    }
  }

  // Method 4: Press Enter key as fallback
  if (!submitBtn) {
    console.log("[Nano Flow] Submit button not found, trying Enter key...");
    const editor = findElement(SELECTORS.textInput, SELECTORS.textInputAlt, SELECTORS.textInputAlt2, SELECTORS.textInputAlt3);
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
      console.log("[Nano Flow] Submitted via Enter key");
      return true;
    }
    console.error("[Nano Flow] Could not submit - no button or input found");
    return false;
  }

  (submitBtn as HTMLElement).click();
  await sleep(300);

  console.log("[Nano Flow] Prompt submitted via button");
  return true;
}

// Check if Gemini is currently thinking/processing
function isGeminiThinking(): boolean {
  // Check for thinking avatar (animated star)
  const thinkingAvatar = document.querySelector(SELECTORS.thinkingAvatar);
  if (thinkingAvatar) {
    console.log("[Nano Flow] Gemini thinking - avatar indicator present");
    return true;
  }

  // Check for processing state container
  const processingState = document.querySelector(SELECTORS.processingState);
  if (processingState) {
    console.log("[Nano Flow] Gemini thinking - processing state present");
    return true;
  }

  // Check for processing button
  const processingButton = document.querySelector(SELECTORS.processingButton);
  if (processingButton) {
    console.log("[Nano Flow] Gemini thinking - processing button present");
    return true;
  }

  // Check for generic loading indicators
  const loading = document.querySelector('[data-loading="true"], [aria-busy="true"]');
  if (loading) {
    console.log("[Nano Flow] Gemini thinking - generic loading indicator present");
    return true;
  }

  return false;
}

// Wait for generation to complete
async function waitForGenerationComplete(timeout = 180000): Promise<boolean> {
  console.log("[Nano Flow] Waiting for generation to complete...");

  // Wait for initial response to start appearing
  await sleep(2000);

  const startTime = Date.now();
  let lastLogTime = 0;

  // Wait until Gemini stops thinking
  while (Date.now() - startTime < timeout) {
    const isThinking = isGeminiThinking();

    // Log progress every 5 seconds
    if (Date.now() - lastLogTime > 5000) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`[Nano Flow] Waiting... ${elapsed}s elapsed, thinking: ${isThinking}`);
      lastLogTime = Date.now();
    }

    if (!isThinking) {
      // Double-check by waiting a moment and checking again
      await sleep(1000);

      if (!isGeminiThinking()) {
        // Check if images appeared in the response
        const responseImages = document.querySelectorAll(".response-container img, .generated-image, img[alt*='Generated'], img[src*='blob:']");
        if (responseImages.length > 0) {
          console.log("[Nano Flow] Generation complete - images found:", responseImages.length);
          return true;
        }

        // Check if text response appeared
        const textResponse = document.querySelector(".model-response-text, .response-text, .response-content");
        if (textResponse && textResponse.textContent && textResponse.textContent.length > 20) {
          console.log("[Nano Flow] Generation complete - response text found");
          return true;
        }

        // If no thinking indicators and we've waited at least 5 seconds, consider it done
        if (Date.now() - startTime > 5000) {
          console.log("[Nano Flow] Generation appears complete - no thinking indicators");
          return true;
        }
      }
    }

    await sleep(1000);
  }

  console.log("[Nano Flow] Generation timeout reached after", Math.round(timeout / 1000), "seconds");
  return true; // Return true anyway to continue with next item
}

// Process a single prompt through the UI
async function processPromptThroughUI(prompt: string, enableImages: boolean, images?: string[]): Promise<boolean> {
  try {
    // Step 1: Enable image creation if needed
    if (enableImages) {
      const imageEnabled = await enableImageCreation();
      if (!imageEnabled) {
        console.warn("[Nano Flow] Could not enable image creation, continuing anyway...");
      }
    }

    // Step 2: Upload reference images if provided
    if (images && images.length > 0) {
      console.log("[Nano Flow] Uploading reference images:", images.length);
      const uploaded = await uploadImages(images);
      if (!uploaded) {
        console.warn("[Nano Flow] Could not upload images, continuing with text only...");
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

    // Step 5: Wait for completion
    await waitForGenerationComplete();

    return true;
  } catch (error) {
    console.error("[Nano Flow] Error processing prompt:", error);
    return false;
  }
}

// Automation module that handles message passing
export const automationModule = {
  init() {
    console.log("[Nano Flow] Automation module initializing...");

    // Notify background that we're on a Gemini page and ready
    chrome.runtime
      .sendMessage({
        type: MessageType.CONTENT_SCRIPT_READY,
      })
      .catch(() => {
        // Ignore errors - background might not be listening yet
      });

    // Handle messages from background script
    chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse: (response: ExtensionResponse) => void) => {
      console.log("[Nano Flow] Received message:", message.type);

      const handleAsync = async () => {
        switch (message.type) {
          case MessageType.PASTE_PROMPT: {
            const payload = message.payload as { prompt: string; enableImages?: boolean; images?: string[] };
            console.log("[Nano Flow] Processing prompt with", payload.images?.length || 0, "images");
            const success = await processPromptThroughUI(payload.prompt, payload.enableImages ?? true, payload.images);
            return { success };
          }

          case MessageType.ENABLE_IMAGE_CREATION: {
            const success = await enableImageCreation();
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
          console.error("[Nano Flow] Message handler error:", error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
        });

      return true; // Indicates async response
    });

    // Add keyboard shortcut to toggle sidebar
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + Shift + G to toggle sidebar visibility
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "g") {
        e.preventDefault();
        // Dispatch custom event for sidebar toggle
        window.dispatchEvent(new CustomEvent("nano-flow-toggle-sidebar"));
      }
    });

    console.log("[Nano Flow] Automation module initialized");
  },
};
