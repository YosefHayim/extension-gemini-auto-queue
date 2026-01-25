import { GEMINI_MODE_INFO, GeminiMode } from "@/backend/types";
import { sleep, logger } from "@/backend/utils";

import { simulateClick, isModeCurrentlyActive, openModeMenu } from "@/extension/entrypoints/gemini.content/modules/modeSelection/modeHelpers";

const log = logger.module("ModeSelection");

let currentActiveMode: GeminiMode | null = null;

function findModeButton(modeInfo: (typeof GEMINI_MODE_INFO)[GeminiMode]): HTMLElement | null {
  const modeBtn: HTMLElement | null =
    document.querySelector(`[data-test-id="${modeInfo.dataTestId}"]`) ??
    document.querySelector(`[data-test-id="${modeInfo.dataTestIdHebrew}"]`);

  if (modeBtn) return modeBtn;

  const buttons = document.querySelectorAll(
    "button, [role='menuitem'], [role='option'], .bard-mode-list-button"
  );
  for (const btn of buttons) {
    const text = btn.textContent?.trim().toLowerCase() ?? "";
    if (
      text.includes(modeInfo.label.toLowerCase()) ||
      text.includes(modeInfo.labelHebrew.toLowerCase())
    ) {
      return btn as HTMLElement;
    }
  }

  const tabs = document.querySelectorAll("[role='tablist'] [role='tab']");
  for (const tab of tabs) {
    const text = tab.textContent?.trim() ?? "";
    if (
      text.includes(modeInfo.labelHebrew) ||
      text.toLowerCase().includes(modeInfo.label.toLowerCase())
    ) {
      return tab as HTMLElement;
    }
  }

  return null;
}

async function clickModeButton(modeBtn: HTMLElement, mode: GeminiMode): Promise<boolean> {
  log.debug("selectMode", `Clicking mode button: ${modeBtn.textContent?.trim()}`);

  modeBtn.scrollIntoView({ behavior: "instant", block: "center" });
  await sleep(50);

  simulateClick(modeBtn);
  await sleep(400);

  if (isModeCurrentlyActive(mode)) {
    return true;
  }

  log.debug("selectMode", "First click didn't work, trying focus + click");
  modeBtn.focus();
  await sleep(100);
  simulateClick(modeBtn);
  await sleep(400);

  if (isModeCurrentlyActive(mode)) {
    return true;
  }

  log.debug("selectMode", "Second click didn't work, trying direct click method");
  modeBtn.click();
  await sleep(400);

  return isModeCurrentlyActive(mode);
}

export async function selectMode(mode: GeminiMode): Promise<boolean> {
  const actionKey = log.startAction("selectMode");

  if (mode === GeminiMode.Default) {
    log.endAction(actionKey, "selectMode", "Default mode - skipping selection", true, { mode });
    return true;
  }

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

  let modeBtn = findModeButton(modeInfo);

  if (!modeBtn) {
    log.debug("selectMode", "Mode button not found, opening mode menu");
    const menuOpened = await openModeMenu();
    if (menuOpened) {
      await sleep(500);
      modeBtn = findModeButton(modeInfo);
    }
  }

  if (!modeBtn) {
    log.debug("selectMode", "Still no button, trying menu open again with longer wait");
    await openModeMenu();
    await sleep(800);
    modeBtn = findModeButton(modeInfo);
  }

  if (!modeBtn) {
    log.endAction(actionKey, "selectMode", "Mode button not found", false, { mode });
    return false;
  }

  const clicked = await clickModeButton(modeBtn, mode);

  if (clicked) {
    currentActiveMode = mode;
    log.endAction(actionKey, "selectMode", "Mode selected successfully", true, { mode });
    return true;
  }

  log.endAction(actionKey, "selectMode", "Failed to select mode after multiple attempts", false, {
    mode,
  });
  return false;
}

export function resetModeState(): void {
  currentActiveMode = null;
}
