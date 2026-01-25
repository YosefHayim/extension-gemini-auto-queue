export type ImageFormat = "png" | "jpeg" | "webp";

export type PresetCategory = "default" | "desktop" | "tablet" | "mobile" | "social";

export type ProcessingStrategy = "server" | "client";

export interface SizePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: PresetCategory;
}

export interface AspectRatio {
  id: string;
  name: string;
  width: number;
  height: number;
}

export interface FormatInfo {
  name: string;
  description: string;
  supportsQuality: boolean;
  mimeType: string;
  extension: string;
  googleParam: string;
}

export interface SizeOptions {
  type: "original" | "preset" | "custom" | "aspectRatio";
  presetId?: string;
  width?: number;
  height?: number;
  aspectRatioId?: string;
}

export interface ProcessingOptions {
  size: SizeOptions;
  format: ImageFormat;
  quality: number;
  maintainAspectRatio: boolean;
}

export const DEFAULT_PROCESSING_OPTIONS: ProcessingOptions = {
  size: { type: "original" },
  format: "png",
  quality: 90,
  maintainAspectRatio: true,
};

export interface DownloadableFile {
  id: string;
  queueItemId: string;
  promptPreview: string;
  url: string;
  type: "image" | "video";
  filename: string;
  selected: boolean;
  thumbnail?: string;
}

export interface ProcessingResult {
  success: boolean;
  originalUrl: string;
  processedUrl?: string;
  filename: string;
  error?: string;
  processingTime: number;
  strategy: ProcessingStrategy;
}

export interface BatchProgress {
  completed: number;
  total: number;
  currentItem: string;
  estimatedTimeRemaining: number;
}

export interface BatchResult {
  results: ProcessingResult[];
  successCount: number;
  failedCount: number;
  totalTime: number;
}

export type DownloadMode = "images" | "videos" | "all" | "select";

export interface StrategyResult {
  type: ProcessingStrategy;
  buildUrl?: (url: string, options: ProcessingOptions) => string;
  process?: (url: string, options: ProcessingOptions) => Promise<Blob>;
}
