import { GEMINI_MODE_INFO, GeminiMode } from "@/backend/types";
import { sleep } from "@/backend/utils";

export function simulateClick(element: HTMLElement): void {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const mouseEventInit: MouseEventInit = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: centerX,
    clientY: centerY,
    screenX: centerX,
    screenY: centerY,
    button: 0,
    buttons: 1,
  };

  const pointerEventInit: PointerEventInit = {
    ...mouseEventInit,
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
    width: 1,
    height: 1,
    pressure: 0.5,
  };

  element.dispatchEvent(new PointerEvent("pointerdown", pointerEventInit));
  element.dispatchEvent(new MouseEvent("mousedown", mouseEventInit));
  element.dispatchEvent(new PointerEvent("pointerup", pointerEventInit));
  element.dispatchEvent(new MouseEvent("mouseup", mouseEventInit));
  element.dispatchEvent(new MouseEvent("click", mouseEventInit));
}

export function isModeCurrentlyActive(mode: GeminiMode): boolean {
  const modeInfo = GEMINI_MODE_INFO[mode];

  const modeButton =
    document.querySelector(`[data-test-id="${modeInfo.dataTestId}"]`) ??
    document.querySelector(`[data-test-id="${modeInfo.dataTestIdHebrew}"]`);
  if (modeButton) {
    const hasCheckIcon = modeButton.querySelector(
      'mat-icon[fonticon="check_circle"], mat-icon[data-mat-icon-name="check_circle"]'
    );
    if (hasCheckIcon) {
      return true;
    }

    const isChecked = modeButton.getAttribute("aria-checked") === "true";
    const isPressed = modeButton.getAttribute("aria-pressed") === "true";
    const isSelected = modeButton.getAttribute("aria-selected") === "true";
    if (isChecked || isPressed || isSelected) {
      return true;
    }

    const hasActiveClass =
      modeButton.classList.contains("is-selected") ||
      modeButton.classList.contains("active") ||
      modeButton.classList.contains("selected") ||
      modeButton.classList.contains("mdc-tab--active");
    if (hasActiveClass) {
      return true;
    }
  }

  const activeIndicators = document.querySelectorAll(
    '[aria-checked="true"], [aria-pressed="true"], [aria-selected="true"], .is-selected, .selected, .active, .mdc-tab--active'
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

export async function openModeMenu(): Promise<boolean> {
  const modeMenuTriggers = [
    '[data-test-id="bard-mode-menu-trigger"]',
    '[data-test-id="mobile-nested-mode-menu-trigger"]',
    'button[aria-haspopup="menu"][aria-expanded]',
    ".gds-mode-switch-menu-list",
  ];

  for (const selector of modeMenuTriggers) {
    const trigger = document.querySelector(selector) as HTMLElement | null;
    if (trigger) {
      simulateClick(trigger);
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
        simulateClick(btn);
        await sleep(400);
        return true;
      }
    }
  }

  return false;
}
