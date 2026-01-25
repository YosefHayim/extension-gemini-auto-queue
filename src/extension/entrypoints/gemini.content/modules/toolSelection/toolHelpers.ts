import { GeminiTool } from "@/backend/types";
import { findElement, sleep, SELECTORS, TOOL_SELECTORS } from "@/backend/utils";

export async function openToolbox(): Promise<boolean> {
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
      const className = btn.className;
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

export function isToolCurrentlyActive(tool: GeminiTool): boolean {
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
