import { findElement, findByAriaLabel, sleep, SELECTORS, logger } from "@/backend/utils";

const log = logger.module("PromptInput");

export async function pastePromptToInput(prompt: string): Promise<boolean> {
  const editor = findElement(
    SELECTORS.textInput,
    SELECTORS.textInputAlt,
    SELECTORS.textInputAlt2,
    SELECTORS.textInputAlt3
  );

  if (!editor) {
    log.error("pastePrompt", "Could not find text input");
    return false;
  }

  const editorEl = editor as HTMLElement;
  const actionKey = log.startAction("pastePrompt");

  editorEl.focus();
  await sleep(100);

  editorEl.innerHTML = "";
  await sleep(50);

  const paragraph = document.createElement("p");
  paragraph.textContent = prompt;
  editorEl.appendChild(paragraph);

  const inputEvent = new InputEvent("input", {
    bubbles: true,
    cancelable: true,
    inputType: "insertText",
    data: prompt,
  });
  editorEl.dispatchEvent(inputEvent);

  editorEl.dispatchEvent(new Event("input", { bubbles: true }));
  editorEl.dispatchEvent(new Event("change", { bubbles: true }));

  try {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editorEl);
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.execCommand("insertText", false, prompt);
  } catch {
    // intentionally empty
  }

  await sleep(200);
  editorEl.classList.remove("ql-blank");

  log.endAction(actionKey, "pastePrompt", "Prompt pasted successfully", true, {
    promptLength: prompt.length,
  });
  return true;
}

export async function submitPrompt(): Promise<boolean> {
  const actionKey = log.startAction("submitPrompt");

  let submitBtn = findElement(
    SELECTORS.submitButton,
    SELECTORS.submitButtonAlt,
    SELECTORS.submitButtonAlt2,
    SELECTORS.submitButtonAlt3,
    SELECTORS.submitButtonAlt4
  );

  if (!submitBtn) {
    const icons = document.querySelectorAll(
      'mat-icon[fonticon="send"], mat-icon[data-mat-icon-name="send"]'
    );
    for (const icon of icons) {
      const btn = icon.closest("button");
      if (btn && !btn.disabled) {
        submitBtn = btn;
        break;
      }
    }
  }

  if (!submitBtn) {
    submitBtn = findByAriaLabel(["send", "submit"]);
  }

  if (!submitBtn) {
    const buttons = document.querySelectorAll("button:not([disabled])");
    for (const btn of buttons) {
      const text = btn.textContent?.toLowerCase() ?? "";
      if (text === "send" || text.includes("submit")) {
        submitBtn = btn;
        break;
      }
    }
  }

  if (!submitBtn) {
    log.debug("submitPrompt", "No submit button found, trying Enter key");
    const editor = findElement(
      SELECTORS.textInput,
      SELECTORS.textInputAlt,
      SELECTORS.textInputAlt2,
      SELECTORS.textInputAlt3
    );
    if (editor) {
      (editor as HTMLElement).focus();

      const enterDown = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
      });
      editor.dispatchEvent(enterDown);

      const enterPress = new KeyboardEvent("keypress", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
      });
      editor.dispatchEvent(enterPress);

      const enterUp = new KeyboardEvent("keyup", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
      });
      editor.dispatchEvent(enterUp);

      await sleep(500);
      log.endAction(actionKey, "submitPrompt", "Submitted via Enter key", true);
      return true;
    }
    log.endAction(actionKey, "submitPrompt", "Failed - no submit method found", false);
    return false;
  }

  log.debug("submitPrompt", "Clicking submit button");
  (submitBtn as HTMLElement).click();
  await sleep(300);

  log.endAction(actionKey, "submitPrompt", "Submitted via button click", true);
  return true;
}
