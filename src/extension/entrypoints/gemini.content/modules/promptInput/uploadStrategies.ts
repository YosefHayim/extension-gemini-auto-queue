import { findElement, sleep, SELECTORS, logger } from "@/backend/utils";

const log = logger.module("PromptInput");

function dispatchFileInputEvents(input: HTMLInputElement): void {
  input.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  input.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

  const focusEvent = new FocusEvent("focus", { bubbles: true });
  input.dispatchEvent(focusEvent);

  const blurEvent = new FocusEvent("blur", { bubbles: true });
  input.dispatchEvent(blurEvent);
}

export async function tryFileInputApproach(dataTransfer: DataTransfer): Promise<boolean> {
  const allInputs = document.querySelectorAll('input[type="file"]');
  log.debug("tryFileInput", `Found ${allInputs.length} file inputs`);

  for (const input of allInputs) {
    const inputEl = input as HTMLInputElement;
    const accepts = inputEl.accept || "";

    log.debug("tryFileInput", `Trying input`, {
      className: inputEl.className,
      accepts,
      multiple: inputEl.multiple,
    });

    try {
      inputEl.files = dataTransfer.files;
      dispatchFileInputEvents(inputEl);
      await sleep(300);

      if (inputEl.files && inputEl.files.length > 0) {
        log.info("tryFileInput", `Files attached successfully`, {
          count: inputEl.files.length,
        });
        return true;
      }
    } catch (e) {
      log.warn("tryFileInput", `Failed to set files on input`, { error: e });
    }
  }

  return false;
}

export async function tryHiddenFileSelector(dataTransfer: DataTransfer): Promise<boolean> {
  const hiddenFileBtn = document.querySelector(
    "button.hidden-local-file-image-selector-button, button[xapfileselectortrigger]"
  );

  if (!hiddenFileBtn) {
    log.debug("tryHiddenSelector", "No hidden file selector button found");
    return false;
  }

  log.debug("tryHiddenSelector", "Found hidden file selector button");
  const parent = hiddenFileBtn.closest("images-files-uploader");

  if (!parent) {
    log.debug("tryHiddenSelector", "No parent images-files-uploader found");
    return false;
  }

  const fileInput = parent.querySelector('input[type="file"]') as HTMLInputElement | null;
  if (!fileInput) {
    log.debug("tryHiddenSelector", "No file input in parent");
    return false;
  }

  log.debug("tryHiddenSelector", "Setting files via hidden input");
  fileInput.files = dataTransfer.files;
  dispatchFileInputEvents(fileInput as HTMLInputElement);
  await sleep(1000);

  return true;
}

export async function tryPasteApproach(files: File[]): Promise<boolean> {
  const editor = findElement(
    SELECTORS.textInput,
    SELECTORS.textInputAlt,
    SELECTORS.textInputAlt2,
    SELECTORS.textInputAlt3
  );

  if (!editor) {
    log.error("tryPaste", "Could not find editor for paste approach");
    return false;
  }

  const editorEl = editor as HTMLElement;
  editorEl.focus();
  await sleep(100);

  log.debug("tryPaste", "Attempting clipboard paste");

  const clipboardData = new DataTransfer();
  files.forEach((file) => clipboardData.items.add(file));

  const pasteEvent = new ClipboardEvent("paste", {
    bubbles: true,
    cancelable: true,
    clipboardData: clipboardData,
  });

  editorEl.dispatchEvent(pasteEvent);

  const richTextarea = editorEl.closest("rich-textarea");
  if (richTextarea) {
    const clipboardData2 = new DataTransfer();
    files.forEach((file) => clipboardData2.items.add(file));

    const pasteEvent2 = new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData: clipboardData2,
    });
    richTextarea.dispatchEvent(pasteEvent2);
  }

  await sleep(300);
  return true;
}

export async function tryDropApproach(dataTransfer: DataTransfer): Promise<boolean> {
  const editor = findElement(
    SELECTORS.textInput,
    SELECTORS.textInputAlt,
    SELECTORS.textInputAlt2,
    SELECTORS.textInputAlt3
  );

  if (!editor) {
    log.error("tryDrop", "Could not find editor for drop approach");
    return false;
  }

  const editorEl = editor as HTMLElement;
  const richTextarea = editorEl.closest("rich-textarea");
  const dropTarget = richTextarea || editorEl;

  log.debug("tryDrop", "Attempting drag-drop");

  dropTarget.dispatchEvent(
    new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer })
  );
  dropTarget.dispatchEvent(
    new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer })
  );
  await sleep(100);
  dropTarget.dispatchEvent(
    new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer })
  );

  await sleep(500);
  return true;
}
