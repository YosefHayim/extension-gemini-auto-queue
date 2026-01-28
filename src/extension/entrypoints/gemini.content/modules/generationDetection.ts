import { GeminiTool } from "@/backend/types";
import { sleep, logger } from "@/backend/utils";

const log = logger.module("GenerationDetection");

/**
 * Check if Gemini is showing an error message that indicates generation was stopped/failed
 */
export function detectGenerationError(): string | null {
  // Check for "stopped generating" message (Hebrew and English)
  const errorPatterns = [
    "הפסקת את יצירת התשובה",
    "stopped generating",
    "generation was stopped",
    "couldn't generate",
    "unable to generate",
    "try again",
    "something went wrong",
    "an error occurred",
    "rate limit",
    "too many requests",
  ];

  // Look for error messages in response containers
  const responseElements = document.querySelectorAll(
    "model-response, response-element, .response-container, [data-message-id]"
  );

  for (const el of responseElements) {
    const text = el.textContent?.toLowerCase() ?? "";
    for (const pattern of errorPatterns) {
      if (text.includes(pattern.toLowerCase())) {
        log.warn("detectError", "Found error message in response", { pattern });
        return pattern;
      }
    }
  }

  // Check for error toast/snackbar messages
  const toastSelectors = [
    ".mat-snack-bar-container",
    "[role='alert']",
    ".error-message",
    ".toast-error",
  ];

  for (const selector of toastSelectors) {
    const toasts = document.querySelectorAll(selector);
    for (const toast of toasts) {
      const text = toast.textContent?.toLowerCase() ?? "";
      for (const pattern of errorPatterns) {
        if (text.includes(pattern.toLowerCase())) {
          log.warn("detectError", "Found error in toast", { pattern, selector });
          return pattern;
        }
      }
    }
  }

  return null;
}

function isStillGenerating(): boolean {
  const loadingSelectors = [
    "lottie-animation",
    "mat-spinner",
    ".mat-mdc-progress-spinner",
    '[aria-busy="true"]',
    ".bard-avatar.thinking",
    ".processing-state_container--processing",
    'button[aria-label*="Stop"]',
    'button[aria-label*="עצור"]',
    ".streaming",
    ".typing",
    '[class*="loading"]',
  ];

  for (const selector of loadingSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      const htmlEl = el as HTMLElement;
      const isVisible =
        htmlEl.offsetParent !== null || htmlEl.offsetWidth > 0 || htmlEl.offsetHeight > 0;

      if (isVisible) {
        if (selector.includes("Stop") || selector.includes("עצור")) {
          if (!htmlEl.hasAttribute("disabled")) {
            return true;
          }
        } else {
          return true;
        }
      }
    }
  }

  return false;
}

function hasNewContent(initialResponseCount: number): boolean {
  const responseSelectors = [
    "model-response",
    "response-element",
    ".response-container",
    "[data-message-id]",
    ".model-response-text",
  ];

  let currentCount = 0;
  for (const selector of responseSelectors) {
    currentCount = Math.max(currentCount, document.querySelectorAll(selector).length);
  }

  return currentCount > initialResponseCount;
}

function countResponses(): number {
  const responseSelectors = [
    "model-response",
    "response-element",
    ".response-container",
    "[data-message-id]",
  ];

  let maxCount = 0;
  for (const selector of responseSelectors) {
    maxCount = Math.max(maxCount, document.querySelectorAll(selector).length);
  }
  return maxCount;
}

export function isVideoGenerating(): boolean {
  const chips = document.querySelectorAll("async-processing-chip");
  for (const chip of chips) {
    const text = chip.textContent?.toLowerCase() ?? "";
    if (text.includes("video") || text.includes("סרטון")) {
      return true;
    }
  }
  return false;
}

export function isVideoGenerationComplete(): boolean {
  const videos = document.querySelectorAll("video[src], video[currentSrc]");
  return videos.length > 0;
}

export function isCanvasGenerating(): boolean {
  return isStillGenerating();
}

export function isCanvasGenerationComplete(): boolean {
  const chips = document.querySelectorAll("immersive-entry-chip");
  return chips.length > 0;
}

export function isGeminiThinking(): boolean {
  return isStillGenerating();
}

export async function waitForGenerationComplete(
  tool: GeminiTool = GeminiTool.IMAGE,
  timeout = 180000
): Promise<{ completed: boolean; error?: string }> {
  const actionKey = log.startAction("waitForGeneration");
  const startTime = Date.now();
  const initialResponseCount = countResponses();

  log.info("waitForGeneration", "Starting wait", { tool, initialResponseCount });

  let generationStarted = false;
  const maxStartWait = 30000;

  while (Date.now() - startTime < maxStartWait) {
    if (hasNewContent(initialResponseCount) || isStillGenerating()) {
      generationStarted = true;
      break;
    }
    await sleep(100);
  }

  if (!generationStarted) {
    log.warn("waitForGeneration", "Generation never started");
    const errorMsg = detectGenerationError();
    return { completed: true, error: errorMsg ?? undefined };
  }

  let consecutiveIdleChecks = 0;
  const requiredIdleChecks = 3;

  while (Date.now() - startTime < timeout) {
    const stillGenerating = isStillGenerating();
    const errorMsg = detectGenerationError();

    if (errorMsg) {
      log.warn("waitForGeneration", "Error detected during generation", { error: errorMsg });
      log.endAction(actionKey, "waitForGeneration", "Error detected", false, { error: errorMsg });
      return { completed: false, error: errorMsg };
    }

    if (!stillGenerating) {
      consecutiveIdleChecks++;
      if (consecutiveIdleChecks >= requiredIdleChecks) {
        const elapsed = Date.now() - startTime;
        const finalError = detectGenerationError();
        log.endAction(actionKey, "waitForGeneration", "Complete", true, { elapsed });
        return { completed: true, error: finalError ?? undefined };
      }
    } else {
      consecutiveIdleChecks = 0;
    }

    await sleep(150);
  }

  log.endAction(actionKey, "waitForGeneration", "Timeout", false, { timeout });
  return { completed: true, error: "Generation timeout" };
}
