import { findElement, findByAriaLabel, sleep, base64ToFile, SELECTORS } from "@/utils";

export async function uploadImages(images: string[]): Promise<boolean> {
  if (!images || images.length === 0) {
    return true;
  }

  console.log("[NanoFlow] uploadImages: Starting file upload for", images.length, "files");

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
    uploadMenuBtn = findByAriaLabel(["upload", "file", "העלא"]);
  }

  if (uploadMenuBtn) {
    console.log("[NanoFlow] uploadImages: Opening upload menu...");
    (uploadMenuBtn as HTMLElement).click();
    await sleep(500);

    const uploadFilesBtn = document.querySelector(
      'button[data-test-id="local-images-files-uploader-button"], images-files-uploader button'
    );
    if (uploadFilesBtn) {
      console.log("[NanoFlow] uploadImages: Found 'Upload files' option, clicking...");
      (uploadFilesBtn as HTMLElement).click();
      await sleep(300);
    }
  }

  const hiddenFileBtn = document.querySelector(
    "button.hidden-local-file-image-selector-button, button[xapfileselectortrigger]"
  );
  if (hiddenFileBtn) {
    console.log("[NanoFlow] uploadImages: Found hidden file selector button");
    const parent = hiddenFileBtn.closest("images-files-uploader");
    if (parent) {
      const fileInput = parent.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        console.log("[NanoFlow] uploadImages: Setting files via hidden input");
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event("change", { bubbles: true }));
        await sleep(1000);
        return true;
      }
    }
  }

  const allInputs = document.querySelectorAll('input[type="file"]');
  console.log("[NanoFlow] uploadImages: Found", allInputs.length, "file inputs total");

  for (const input of allInputs) {
    const inputEl = input as HTMLInputElement;
    console.log("[NanoFlow] uploadImages: Trying input:", inputEl.className);
    inputEl.files = dataTransfer.files;
    inputEl.dispatchEvent(new Event("change", { bubbles: true }));
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    await sleep(500);
  }

  if (allInputs.length > 0) {
    console.log("[NanoFlow] uploadImages: File input approach completed");
    await sleep(500);
    return true;
  }

  console.log("[NanoFlow] uploadImages: No file input found, trying paste/drop approach");

  const editor = findElement(
    SELECTORS.textInput,
    SELECTORS.textInputAlt,
    SELECTORS.textInputAlt2,
    SELECTORS.textInputAlt3
  );

  if (!editor) {
    console.error("[NanoFlow] uploadImages: Could not find editor");
    return false;
  }

  const editorEl = editor as HTMLElement;
  editorEl.focus();
  await sleep(100);

  const pasteEvent = new Event("paste", { bubbles: true, cancelable: true }) as ClipboardEvent;
  Object.defineProperty(pasteEvent, "clipboardData", { value: dataTransfer, writable: false });
  editorEl.dispatchEvent(pasteEvent);

  const richTextarea = editorEl.closest("rich-textarea");
  if (richTextarea) {
    const pasteEvent2 = new Event("paste", { bubbles: true, cancelable: true }) as ClipboardEvent;
    Object.defineProperty(pasteEvent2, "clipboardData", { value: dataTransfer, writable: false });
    richTextarea.dispatchEvent(pasteEvent2);
  }

  await sleep(300);

  const dropTarget = richTextarea || editorEl;
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

  console.log("[NanoFlow] uploadImages: Paste/drop approach completed");
  await sleep(1000);
  return true;
}

export async function pastePromptToInput(prompt: string): Promise<boolean> {
  const editor = findElement(
    SELECTORS.textInput,
    SELECTORS.textInputAlt,
    SELECTORS.textInputAlt2,
    SELECTORS.textInputAlt3
  );

  if (!editor) {
    return false;
  }

  const editorEl = editor as HTMLElement;

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
    // execCommand fallback failed
  }

  await sleep(200);

  editorEl.classList.remove("ql-blank");

  return true;
}

export async function submitPrompt(): Promise<boolean> {
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
    submitBtn = findByAriaLabel(["send", "submit", "שליחה", "הנחיה"]);
  }

  if (!submitBtn) {
    const buttons = document.querySelectorAll("button:not([disabled])");
    for (const btn of buttons) {
      const text = btn.textContent?.toLowerCase() ?? "";
      if (text === "send" || text.includes("שליחה")) {
        submitBtn = btn;
        break;
      }
    }
  }

  if (!submitBtn) {
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
      return true;
    }
    return false;
  }

  (submitBtn as HTMLElement).click();
  await sleep(300);

  return true;
}
