import type { MediaItem } from "@/utils/mediaDownloader";

export interface BulkDownloadButtonProps {
  isDark: boolean;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

export type DownloadMethod = "native" | "direct";

export interface DownloadState {
  isScanning: boolean;
  isDownloading: boolean;
  progress: number;
  total: number;
  currentItem?: string;
}

export interface MediaCounts {
  imageCount: number;
  videoCount: number;
  fileCount: number;
  totalCount: number;
}

export function getMediaCounts(mediaItems: MediaItem[]): MediaCounts {
  return {
    imageCount: mediaItems.filter((m) => m.type === "image").length,
    videoCount: mediaItems.filter((m) => m.type === "video").length,
    fileCount: mediaItems.filter((m) => m.type === "file").length,
    totalCount: mediaItems.length,
  };
}
