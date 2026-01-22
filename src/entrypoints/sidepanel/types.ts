import type { AppSettings, ExtensionMessage, ExtensionResponse, Folder, QueueItem } from "@/types";

export type TabType = "queue" | "templates" | "settings";

export interface AppState {
  queue: QueueItem[];
  folders: Folder[];
  settings: AppSettings;
  isProcessing: boolean;
  isPaused: boolean;
}

export interface DialogState {
  showCsvDialog: boolean;
  showApiKeyDialog: boolean;
  showClearAllConfirm: boolean;
  showExportDialog: boolean;
  showBulkDownloadDialog: boolean;
  showAIOptimizationDialog: boolean;
}

export type SendMessageFn = <T>(message: ExtensionMessage) => Promise<ExtensionResponse<T>>;
