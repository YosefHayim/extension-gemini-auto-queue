import { GeminiTool } from "@/types";
import { sleep, SELECTORS } from "@/utils";
import { isNetworkGenerating, waitForNetworkComplete } from "./networkMonitor";

export function isVideoGenerating(): boolean {
  const asyncChips = document.querySelectorAll("async-processing-chip");
  for (const chip of asyncChips) {
    const text = chip.textContent?.toLowerCase() ?? "";
    const hasVideoText =
      text.includes("יוצר את הסרטון") ||
      text.includes("creating video") ||
      text.includes("generating video") ||
      text.includes("generating your video") ||
      text.includes("creating your video") ||
      (text.includes("video") && (text.includes("creating") || text.includes("generating"))) ||
      (text.includes("סרטון") && text.includes("יוצר"));

    if (hasVideoText) {
      const spinner = chip.querySelector(
        ".spinner, lottie-animation, [class*='spinner'], svg[viewBox*='32']"
      );
      const movieIcon = chip.querySelector(
        'mat-icon[fonticon="movie"], mat-icon[data-mat-icon-name="movie"]'
      );
      if (spinner || movieIcon) {
        return true;
      }
    }
  }

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
      const processingChip = element.querySelector("async-processing-chip");
      if (processingChip) {
        return true;
      }
    }
  }

  return false;
}

export function isVideoGenerationComplete(): boolean {
  const videoElements = document.querySelectorAll(
    "video, iframe[src*='video'], video[src], video[controls], video[preload]"
  );
  if (videoElements.length > 0) {
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
      const spinner = chip.querySelector(
        ".spinner, lottie-animation, [class*='spinner'], svg[viewBox*='32']"
      );
      if (spinner) {
        hasVideoProcessing = true;
        break;
      }
    }
  }

  if (!hasVideoProcessing) {
    const videoElements = document.querySelectorAll("video, iframe[src*='video']");
    if (videoElements.length > 0) {
      return true;
    }
  }

  return false;
}

export function isCanvasGenerating(): boolean {
  const thinkingAvatars = document.querySelectorAll("bard-avatar.thinking, .bard-avatar.thinking");
  if (thinkingAvatars.length > 0) {
    for (const avatar of thinkingAvatars) {
      const spinner = avatar.querySelector("lottie-animation, .avatar_spinner_animation");
      if (spinner) {
        return true;
      }
    }
  }

  const busyElements = document.querySelectorAll('[aria-busy="true"]');
  for (const element of busyElements) {
    if (
      element.classList.contains("markdown") ||
      element.id?.includes("model-response-message-content") ||
      element.closest(".model-response-text")
    ) {
      const canvasChip = element
        .closest(".response-container")
        ?.querySelector("immersive-entry-chip");
      if (!canvasChip) {
        return true;
      }
    }
  }

  return false;
}

export function isCanvasGenerationComplete(): boolean {
  const canvasChips = document.querySelectorAll("immersive-entry-chip");
  if (canvasChips.length > 0) {
    for (const chip of canvasChips) {
      const htmlChip = chip as HTMLElement;
      const isVisible = htmlChip.offsetParent !== null;
      const hasContent = chip.textContent && chip.textContent.trim().length > 0;
      if (isVisible && hasContent) {
        return true;
      }
    }
  }

  const thinkingAvatars = document.querySelectorAll("bard-avatar.thinking, .bard-avatar.thinking");
  let hasActiveThinking = false;
  for (const avatar of thinkingAvatars) {
    const spinner = avatar.querySelector("lottie-animation, .avatar_spinner_animation");
    if (spinner) {
      hasActiveThinking = true;
      break;
    }
  }

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
      const canvasChips = document.querySelectorAll("immersive-entry-chip");
      if (canvasChips.length > 0) {
        return true;
      }
    }
  }

  return false;
}

export function isGeminiThinking(): boolean {
  const thinkingAvatar = document.querySelector(SELECTORS.thinkingAvatar);
  if (thinkingAvatar) return true;

  const processingState = document.querySelector(SELECTORS.processingState);
  if (processingState) return true;

  const processingButton = document.querySelector(SELECTORS.processingButton);
  if (processingButton) return true;

  const loading = document.querySelector('[data-loading="true"]');
  if (loading) return true;

  const lottieSpinners = document.querySelectorAll("lottie-animation");
  for (const spinner of lottieSpinners) {
    const inResponse = spinner.closest(".response-container, .bard-avatar, model-response");
    if (inResponse) return true;
  }

  const matSpinners = document.querySelectorAll("mat-spinner, .mat-mdc-progress-spinner");
  if (matSpinners.length > 0) return true;

  const stopButtons = document.querySelectorAll(
    'button[aria-label*="Stop"], button[aria-label*="עצור"], button[aria-label*="Cancel"]'
  );
  for (const btn of stopButtons) {
    const htmlBtn = btn as HTMLElement;
    if (htmlBtn.offsetParent !== null && !htmlBtn.hasAttribute("disabled")) {
      return true;
    }
  }

  const streamingIndicators = document.querySelectorAll(
    ".streaming, .typing, [class*='streaming'], [class*='typing'], .cursor-blink"
  );
  if (streamingIndicators.length > 0) return true;

  const busyElements = document.querySelectorAll('[aria-busy="true"]');
  for (const element of busyElements) {
    const isCanvasRelated =
      element.closest(".response-container")?.querySelector("immersive-entry-chip") !== null;
    if (!isCanvasRelated) return true;
  }

  const responseElements = document.querySelectorAll("model-response, response-element");
  for (const response of responseElements) {
    const hasActiveSpinner = response.querySelector(
      "lottie-animation, mat-spinner, .loading, [class*='loading']"
    );
    if (hasActiveSpinner) return true;
  }

  return false;
}

function countResponses(): number {
  const responses = document.querySelectorAll(
    "model-response, response-element, .response-container, [data-message-id]"
  );
  return responses.length;
}

function hasResponseContent(): boolean {
  const images = document.querySelectorAll(
    ".response-container img:not([src*='avatar']), .generated-image, img[alt*='Generated'], img[src*='blob:'], img[src*='data:']"
  );
  if (images.length > 0) {
    for (const img of images) {
      const htmlImg = img as HTMLImageElement;
      if (htmlImg.offsetParent !== null && htmlImg.complete && htmlImg.naturalWidth > 0) {
        return true;
      }
    }
  }

  const textElements = document.querySelectorAll(
    ".markdown, .model-response-text, .response-text, [class*='message-content']"
  );
  for (const el of textElements) {
    const text = el.textContent?.trim() ?? "";
    if (text.length > 50 && !text.includes("Generating") && !text.includes("יוצר")) {
      return true;
    }
  }

  return false;
}

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

    if (isVideoGen && !wasVideoGenerating) wasVideoGenerating = true;
    if (isCanvasGen && !wasCanvasGenerating) wasCanvasGenerating = true;

    if (tool === GeminiTool.VIDEO || wasVideoGenerating) {
      if (isVideoGenerationComplete()) return true;
    }

    if (tool === GeminiTool.CANVAS || wasCanvasGenerating) {
      if (isCanvasGenerationComplete()) return true;
    }

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

    await sleep(500);
  }

  return true;
}

export async function waitForGenerationComplete(
  tool: GeminiTool = GeminiTool.IMAGE,
  timeout = 180000
): Promise<boolean> {
  const effectiveTimeout =
    tool === GeminiTool.VIDEO || tool === GeminiTool.CANVAS ? Math.max(timeout, 300000) : timeout;

  const initialResponseCount = countResponses();

  await sleep(500);

  const startTime = Date.now();

  const networkCompletePromise = waitForNetworkComplete(effectiveTimeout);
  const domCompletePromise = waitForDOMGenerationComplete(
    tool,
    effectiveTimeout,
    initialResponseCount,
    startTime
  );

  await Promise.all([networkCompletePromise, domCompletePromise]);

  if (tool === GeminiTool.VIDEO || isVideoGenerating()) {
    for (let i = 0; i < 10; i++) {
      if (isVideoGenerationComplete()) {
        await sleep(2000);
        return true;
      }
      await sleep(1000);
    }
  }

  if (tool === GeminiTool.CANVAS || isCanvasGenerating()) {
    for (let i = 0; i < 10; i++) {
      if (isCanvasGenerationComplete()) {
        await sleep(1500);
        return true;
      }
      await sleep(500);
    }
  }

  if (tool === GeminiTool.IMAGE) {
    await sleep(1500);
    const responseImages = document.querySelectorAll(
      ".response-container img:not([src*='avatar']), .generated-image, img[alt*='Generated'], img[src*='blob:'], img[src*='data:']"
    );
    if (responseImages.length > 0) {
      await Promise.all(
        Array.from(responseImages).map((img) => {
          const htmlImg = img as HTMLImageElement;
          if (htmlImg.complete) return Promise.resolve();
          return new Promise((resolve) => {
            htmlImg.onload = resolve;
            htmlImg.onerror = resolve;
            setTimeout(resolve, 5000);
          });
        })
      );
    }
  }

  await sleep(500);

  return true;
}
