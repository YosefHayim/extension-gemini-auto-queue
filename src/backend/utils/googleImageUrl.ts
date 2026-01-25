import { FORMAT_INFO, getPresetById } from "@/backend/utils/imagePresets";

import type { ProcessingOptions } from "@/backend/types/imageProcessing";

const GOOGLE_CDN_PATTERN = /lh\d\.googleusercontent\.com|googleusercontent\.com\/img|ggpht\.com/;

export function isGoogleCdnUrl(url: string): boolean {
  return GOOGLE_CDN_PATTERN.test(url);
}

export function stripGoogleUrlParams(url: string): string {
  const equalIndex = url.indexOf("=");
  if (equalIndex === -1) return url;
  return url.substring(0, equalIndex);
}

export function buildGoogleImageUrl(baseUrl: string, options: ProcessingOptions): string {
  const cleanUrl = stripGoogleUrlParams(baseUrl);
  const parts: string[] = [];

  if (options.size.type === "preset" && options.size.presetId) {
    const preset = getPresetById(options.size.presetId);
    if (preset && preset.width > 0) {
      parts.push(`w${preset.width}`);
      parts.push(`h${preset.height}`);
      if (!options.maintainAspectRatio) {
        parts.push("c");
      }
    }
  } else if (options.size.type === "custom" && options.size.width && options.size.height) {
    parts.push(`w${options.size.width}`);
    parts.push(`h${options.size.height}`);
    if (!options.maintainAspectRatio) {
      parts.push("c");
    }
  }

  const formatInfo = FORMAT_INFO[options.format];
  parts.push(formatInfo.googleParam);

  if (formatInfo.supportsQuality && options.quality < 100) {
    parts.push(`l${options.quality}`);
  }

  return parts.length > 0 ? `${cleanUrl}=${parts.join("-")}` : cleanUrl;
}

export function canUseServerSideProcessing(url: string, options: ProcessingOptions): boolean {
  if (!isGoogleCdnUrl(url)) return false;
  if (url.startsWith("blob:") || url.startsWith("data:")) return false;

  const maxGoogleDimension = 4000;
  if (options.size.type === "custom") {
    if ((options.size.width ?? 0) > maxGoogleDimension) return false;
    if ((options.size.height ?? 0) > maxGoogleDimension) return false;
  } else if (options.size.type === "preset" && options.size.presetId) {
    const preset = getPresetById(options.size.presetId);
    if (preset && (preset.width > maxGoogleDimension || preset.height > maxGoogleDimension)) {
      return false;
    }
  }

  return true;
}
