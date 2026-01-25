import { FORMAT_INFO, getPresetById, getAspectRatioById } from "@/backend/utils/imagePresets";

import type { ProcessingOptions } from "@/backend/types/imageProcessing";

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

function calculateDimensions(
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number,
  maintainRatio: boolean
): { width: number; height: number } {
  if (!maintainRatio) {
    return { width: targetW, height: targetH };
  }

  const srcRatio = srcW / srcH;
  const targetRatio = targetW / targetH;

  if (srcRatio > targetRatio) {
    return { width: targetW, height: Math.round(targetW / srcRatio) };
  }
  return { width: Math.round(targetH * srcRatio), height: targetH };
}

function calculateAspectRatioDimensions(
  srcW: number,
  srcH: number,
  aspectW: number,
  aspectH: number
): { width: number; height: number } {
  const targetRatio = aspectW / aspectH;
  const srcRatio = srcW / srcH;

  if (srcRatio > targetRatio) {
    const newWidth = Math.round(srcH * targetRatio);
    return { width: newWidth, height: srcH };
  }
  const newHeight = Math.round(srcW / targetRatio);
  return { width: srcW, height: newHeight };
}

export async function processWithCanvas(
  imageUrl: string,
  options: ProcessingOptions
): Promise<Blob> {
  const img = await loadImage(imageUrl);

  let targetWidth: number;
  let targetHeight: number;

  if (options.size.type === "original") {
    targetWidth = img.naturalWidth;
    targetHeight = img.naturalHeight;
  } else if (options.size.type === "preset" && options.size.presetId) {
    const preset = getPresetById(options.size.presetId);
    if (preset && preset.width > 0) {
      const dims = calculateDimensions(
        img.naturalWidth,
        img.naturalHeight,
        preset.width,
        preset.height,
        options.maintainAspectRatio
      );
      targetWidth = dims.width;
      targetHeight = dims.height;
    } else {
      targetWidth = img.naturalWidth;
      targetHeight = img.naturalHeight;
    }
  } else if (options.size.type === "custom" && options.size.width && options.size.height) {
    const dims = calculateDimensions(
      img.naturalWidth,
      img.naturalHeight,
      options.size.width,
      options.size.height,
      options.maintainAspectRatio
    );
    targetWidth = dims.width;
    targetHeight = dims.height;
  } else if (options.size.type === "aspectRatio" && options.size.aspectRatioId) {
    const ratio = getAspectRatioById(options.size.aspectRatioId);
    if (ratio) {
      const dims = calculateAspectRatioDimensions(
        img.naturalWidth,
        img.naturalHeight,
        ratio.width,
        ratio.height
      );
      targetWidth = dims.width;
      targetHeight = dims.height;
    } else {
      targetWidth = img.naturalWidth;
      targetHeight = img.naturalHeight;
    }
  } else {
    targetWidth = img.naturalWidth;
    targetHeight = img.naturalHeight;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const formatInfo = FORMAT_INFO[options.format];
  const quality = formatInfo.supportsQuality ? options.quality / 100 : undefined;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      },
      formatInfo.mimeType,
      quality
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadFromUrl(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
