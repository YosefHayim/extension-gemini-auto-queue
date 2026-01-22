import { findElement, findByAriaLabel, sleep, base64ToFile, SELECTORS, logger } from "@/utils";

const log = logger.module("PromptInput");

function dispatchFileInputEvents(input: HTMLInputElement): void {
  input.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  input.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

  const focusEvent = new FocusEvent("focus", { bubbles: true });
  input.dispatchEvent(focusEvent);

  const blurEvent = new FocusEvent("blur", { bubbles: true });
  input.dispatchEvent(blurEvent);
}

async function tryFileInputApproach(dataTransfer: DataTransfer): Promise<boolean> {
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

async function tryHiddenFileSelector(dataTransfer: DataTransfer): Promise<boolean> {
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

  const fileInput = parent.querySelector('input[type="file"]') as HTMLInputElement;
  if (!fileInput) {
    log.debug("tryHiddenSelector", "No file input in parent");
    return false;
  }

  log.debug("tryHiddenSelector", "Setting files via hidden input");
  fileInput.files = dataTransfer.files;
  dispatchFileInputEvents(fileInput);
  await sleep(1000);

  return true;
}

async function tryPasteApproach(files: File[]): Promise<boolean> {
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

async function tryDropApproach(dataTransfer: DataTransfer): Promise<boolean> {
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

export async function uploadImages(images: string[]): Promise<boolean> {
  if (!images || images.length === 0) {
    return true;
  }

  const actionKey = log.startAction("uploadImages");
  log.info("uploadImages", `Starting file upload`, { count: images.length });

  const files: File[] = images.map((img, index) => {
    const mimeMatch = /data:(.*?);/.exec(img);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const ext = mime.split("/")[1]?.split("+")[0] || "png";
    return base64ToFile(img, `file_${index + 1}.${ext}`);
  });

  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));

  let uploadMenuBtn = findElement(
    SELECTORS.uploadButton,
    SELECTORS.uploadButtonAlt,
    SELECTORS.uploadButtonAlt2,
    SELECTORS.uploadButtonAlt3
  );

  if (!uploadMenuBtn) {
    uploadMenuBtn = findByAriaLabel(["upload", "file", "attachment"]);
  }

  if (uploadMenuBtn) {
    log.debug("uploadImages", "Opening upload menu");
    (uploadMenuBtn as HTMLElement).click();
    await sleep(500);

    const uploadFilesBtn = document.querySelector(
      'button[data-test-id="local-images-files-uploader-button"], images-files-uploader button'
    );
    if (uploadFilesBtn) {
      log.debug("uploadImages", "Clicking upload files option");
      (uploadFilesBtn as HTMLElement).click();
      await sleep(300);
    }
  }

  if (await tryHiddenFileSelector(dataTransfer)) {
    log.endAction(actionKey, "uploadImages", "Files uploaded via hidden selector", true);
    return true;
  }

  if (await tryFileInputApproach(dataTransfer)) {
    log.endAction(actionKey, "uploadImages", "Files uploaded via file input", true);
    return true;
  }

  await tryPasteApproach(files);
  await tryDropApproach(dataTransfer);

  log.endAction(actionKey, "uploadImages", "Attempted paste/drop fallback", true);
  await sleep(1000);
  return true;
}
