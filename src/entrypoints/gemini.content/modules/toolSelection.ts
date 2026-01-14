import { GeminiTool } from "@/types";
import { findElement, sleep, SELECTORS, TOOL_SELECTORS, logger } from "@/utils";

const log = logger.module("ToolSelection");

let currentActiveTool: GeminiTool | null = null;

async function openToolbox(): Promise<boolean> {
  let toolboxBtn = findElement(
    SELECTORS.toolboxButton,
    SELECTORS.toolboxButtonAlt,
    SELECTORS.toolboxButtonAlt2,
    SELECTORS.toolboxButtonAlt3
  );

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
  await sleep(600);

  return true;
}

function isToolCurrentlyActive(tool: GeminiTool): boolean {
  if (tool === GeminiTool.NONE) {
    return true;
  }

  const toolConfig = TOOL_SELECTORS[tool];

  const activeToolChips = document.querySelectorAll(
    "chip-button-input, .tool-chip, .active-tool-indicator"
  );
  for (const chip of activeToolChips) {
    const text = chip.textContent?.toLowerCase() ?? "";
    for (const pattern of toolConfig.textPatterns) {
      if (text.includes(pattern.toLowerCase())) {
        return true;
      }
    }
    for (const iconName of toolConfig.fontIcons) {
      const icon = chip.querySelector(
        `mat-icon[fonticon="${iconName}"], mat-icon[data-mat-icon-name="${iconName}"]`
      );
      if (icon) {
        return true;
      }
    }
  }

  const selectedToolIndicators = document.querySelectorAll(
    '[aria-pressed="true"], [aria-selected="true"], .selected-tool, .active-mode'
  );
  for (const indicator of selectedToolIndicators) {
    const text = indicator.textContent?.toLowerCase() ?? "";
    for (const pattern of toolConfig.textPatterns) {
      if (text.includes(pattern.toLowerCase())) {
        return true;
      }
    }
  }

  const inputArea = document.querySelector("rich-textarea, .input-area, .prompt-input");
  if (inputArea) {
    for (const iconName of toolConfig.fontIcons) {
      const icon = inputArea.querySelector(
        `mat-icon[fonticon="${iconName}"], mat-icon[data-mat-icon-name="${iconName}"]`
      );
      if (icon) {
        return true;
      }
    }
  }

  return false;
}

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

  if (!toolBtn && toolConfig.fontIcons.length > 0) {
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
              btn.closest("toolbox-drawer-item") ||
              btn.closest("mat-action-list");
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

  if (!toolBtn) {
    toolBtn = document.querySelector(`button[jf-ext-button-ct*="${toolConfig.jfExtHebrew}" i]`);
  }

  if (!toolBtn && toolConfig.jfExtEnglish) {
    toolBtn = document.querySelector(`button[jf-ext-button-ct*="${toolConfig.jfExtEnglish}" i]`);
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
