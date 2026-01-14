import { GEMINI_MODE_INFO, GeminiMode } from "@/types";
import { sleep } from "@/utils";

let currentActiveMode: GeminiMode | null = null;

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

export async function selectMode(mode: GeminiMode): Promise<boolean> {
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

  currentActiveMode = mode;
  return true;
}

export function resetModeState(): void {
  currentActiveMode = null;
}
