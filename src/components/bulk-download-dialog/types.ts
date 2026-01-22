import type { QueueItem } from "@/types";
import type { DownloadableFile, DownloadMode } from "@/types/imageProcessing";

export interface BulkDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  queue: QueueItem[];
  isDark: boolean;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

export type { DownloadableFile, DownloadMode };
