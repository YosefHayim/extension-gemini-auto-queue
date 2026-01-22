import { GEMINI_MODE_INFO, type GeminiMode } from "@/types";
import { sleep, logger } from "@/utils";

import { simulateClick, isModeCurrentlyActive, openModeMenu } from "./modeHelpers";

const log = logger.module("ModeSelection");

let currentActiveMode: GeminiMode | null = null;

export async function selectMode(mode: GeminiMode): Promise<boolean> {
  const actionKey = log.startAction("selectMode");

  if (currentActiveMode === mode) {
    log.endAction(actionKey, "selectMode", "Mode already cached", true, { mode });
    return true;
  }

  if (isModeCurrentlyActive(mode)) {
    currentActiveMode = mode;
    log.endAction(actionKey, "selectMode", "Mode already active in UI", true, { mode });
    return true;
  }

  const modeInfo = GEMINI_MODE_INFO[mode];

  let modeBtn: HTMLElement | null =
    document.querySelector(`[data-test-id="${modeInfo.dataTestId}"]`) ??
    document.querySelector(`[data-test-id="${modeInfo.dataTestIdHebrew}"]`);

  if (!modeBtn) {
    await openModeMenu();
    await sleep(300);

    modeBtn =
      document.querySelector(`[data-test-id="${modeInfo.dataTestId}"]`) ??
      document.querySelector(`[data-test-id="${modeInfo.dataTestIdHebrew}"]`);
  }

  if (!modeBtn) {
    const buttons = document.querySelectorAll("button, [role='menuitem'], [role='option']");
    for (const btn of buttons) {
      const text = btn.textContent?.trim().toLowerCase() ?? "";
      if (
        text.includes(modeInfo.label.toLowerCase()) ||
        text.includes(modeInfo.labelHebrew.toLowerCase())
      ) {
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
    log.endAction(actionKey, "selectMode", "Mode button not found", false, { mode });
    return false;
  }

  log.debug("selectMode", `Clicking mode button: ${modeBtn.textContent?.trim()}`);
  simulateClick(modeBtn);
  await sleep(300);

  const stillNeedToSelect = !isModeCurrentlyActive(mode);
  if (stillNeedToSelect) {
    log.debug("selectMode", "First click didn't work, trying focus + click");
    modeBtn.focus();
    await sleep(100);
    simulateClick(modeBtn);
    await sleep(300);
  }

  currentActiveMode = mode;
  log.endAction(actionKey, "selectMode", "Mode selected successfully", true, { mode });
  return true;
}

export function resetModeState(): void {
  currentActiveMode = null;
}
