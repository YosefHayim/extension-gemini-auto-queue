import { GeminiTool } from "@/backend/types";
import { sleep, logger } from "@/backend/utils";

const log = logger.module("GenerationDetection");

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
): Promise<boolean> {
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
    return true;
  }

  let consecutiveIdleChecks = 0;
  const requiredIdleChecks = 3;

  while (Date.now() - startTime < timeout) {
    const stillGenerating = isStillGenerating();

    if (!stillGenerating) {
      consecutiveIdleChecks++;
      if (consecutiveIdleChecks >= requiredIdleChecks) {
        const elapsed = Date.now() - startTime;
        log.endAction(actionKey, "waitForGeneration", "Complete", true, { elapsed });
        return true;
      }
    } else {
      consecutiveIdleChecks = 0;
    }

    await sleep(150);
  }

  log.endAction(actionKey, "waitForGeneration", "Timeout", false, { timeout });
  return true;
}
