import { findElement, findByAriaLabel, sleep, base64ToFile, SELECTORS, logger } from "@/utils";

import {
  tryFileInputApproach,
  tryHiddenFileSelector,
  tryPasteApproach,
  tryDropApproach,
} from "./uploadStrategies";

const log = logger.module("PromptInput");

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
