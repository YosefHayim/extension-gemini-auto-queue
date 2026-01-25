import type { AspectRatio, FormatInfo, ImageFormat, SizePreset } from "@/backend/types/imageProcessing";

export const SIZE_PRESETS: SizePreset[] = [
  { id: "original", name: "Original", width: 0, height: 0, category: "default" },

  { id: "desktop-fhd", name: "Full HD", width: 1920, height: 1080, category: "desktop" },
  { id: "desktop-2k", name: "2K QHD", width: 2560, height: 1440, category: "desktop" },
  { id: "desktop-4k", name: "4K UHD", width: 3840, height: 2160, category: "desktop" },

  { id: "tablet-landscape", name: "iPad Landscape", width: 1024, height: 768, category: "tablet" },
  { id: "tablet-portrait", name: "iPad Portrait", width: 768, height: 1024, category: "tablet" },

  { id: "mobile-standard", name: "iPhone 14", width: 390, height: 844, category: "mobile" },
  { id: "mobile-plus", name: "iPhone 14 Plus", width: 430, height: 932, category: "mobile" },
  { id: "mobile-android", name: "Android Standard", width: 412, height: 915, category: "mobile" },

  { id: "square-1k", name: "Square 1K", width: 1024, height: 1024, category: "social" },
  { id: "square-2k", name: "Square 2K", width: 2048, height: 2048, category: "social" },
  { id: "instagram", name: "Instagram Post", width: 1080, height: 1080, category: "social" },
  { id: "instagram-story", name: "Instagram Story", width: 1080, height: 1920, category: "social" },
];

export const ASPECT_RATIOS: AspectRatio[] = [
  { id: "16:9", name: "16:9 Landscape", width: 16, height: 9 },
  { id: "9:16", name: "9:16 Portrait", width: 9, height: 16 },
  { id: "4:3", name: "4:3 Standard", width: 4, height: 3 },
  { id: "3:4", name: "3:4 Portrait", width: 3, height: 4 },
  { id: "1:1", name: "1:1 Square", width: 1, height: 1 },
  { id: "21:9", name: "21:9 Ultrawide", width: 21, height: 9 },
  { id: "3:2", name: "3:2 Photo", width: 3, height: 2 },
];

export const FORMAT_INFO: Record<ImageFormat, FormatInfo> = {
  png: {
    name: "PNG",
    description: "Lossless, supports transparency",
    supportsQuality: false,
    mimeType: "image/png",
    extension: "png",
    googleParam: "rp",
  },
  jpeg: {
    name: "JPEG",
    description: "Smaller files, no transparency",
    supportsQuality: true,
    mimeType: "image/jpeg",
    extension: "jpg",
    googleParam: "rj",
  },
  webp: {
    name: "WebP",
    description: "Best compression, modern browsers",
    supportsQuality: true,
    mimeType: "image/webp",
    extension: "webp",
    googleParam: "rw",
  },
};

export const QUICK_PRESETS = [
  { id: "original", label: "Original", icon: "image" },
  { id: "desktop-fhd", label: "Desktop", icon: "monitor" },
  { id: "mobile-standard", label: "Mobile", icon: "smartphone" },
  { id: "square-1k", label: "Square", icon: "square" },
] as const;

export function getPresetById(id: string): SizePreset | undefined {
  return SIZE_PRESETS.find((preset) => preset.id === id);
}

export function getAspectRatioById(id: string): AspectRatio | undefined {
  return ASPECT_RATIOS.find((ratio) => ratio.id === id);
}

export function getPresetsByCategory(category: SizePreset["category"]): SizePreset[] {
  return SIZE_PRESETS.filter((preset) => preset.category === category);
}
