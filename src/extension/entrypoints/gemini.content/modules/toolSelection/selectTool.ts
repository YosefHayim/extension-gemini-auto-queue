import { GeminiTool } from "@/backend/types";
import { sleep, TOOL_SELECTORS, logger } from "@/backend/utils";
import {
  openToolbox,
  isToolCurrentlyActive,
} from "@/extension/entrypoints/gemini.content/modules/toolSelection/toolHelpers";

const log = logger.module("ToolSelection");

let currentActiveTool: GeminiTool | null = null;

export async function selectTool(tool: GeminiTool): Promise<boolean> {
  const actionKey = log.startAction("selectTool");

  if (tool === GeminiTool.NONE) {
    log.endAction(actionKey, "selectTool", "No tool needed (NONE)", true);
    return true;
  }

  if (currentActiveTool === tool) {
    log.endAction(actionKey, "selectTool", "Tool already cached", true, { tool });
    return true;
  }

  if (isToolCurrentlyActive(tool)) {
    currentActiveTool = tool;
    log.endAction(actionKey, "selectTool", "Tool already active in UI", true, { tool });
    return true;
  }

  await openToolbox();
  await sleep(500);

  const toolConfig = TOOL_SELECTORS[tool];
  let toolBtn: HTMLElement | null = null;

  if (toolConfig.fontIcons.length > 0) {
    for (const iconName of toolConfig.fontIcons) {
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
            const isInDrawer =
              btn.classList.contains("toolbox-drawer-item-list-button") ||
              btn.closest("toolbox-drawer-item") !== null ||
              btn.closest("mat-action-list") !== null;
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

  toolBtn ??= document.querySelector(`button[jf-ext-button-ct*="${toolConfig.jfExtHebrew}" i]`);

  if (toolConfig.jfExtEnglish) {
    toolBtn ??= document.querySelector(`button[jf-ext-button-ct*="${toolConfig.jfExtEnglish}" i]`);
  }

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
    log.endAction(actionKey, "selectTool", "Tool button not found", false, { tool });
    return false;
  }

  toolBtn.click();
  await sleep(400);

  currentActiveTool = tool;
  log.endAction(actionKey, "selectTool", "Tool selected successfully", true, { tool });
  return true;
}

export function resetToolState(): void {
  currentActiveTool = null;
}
