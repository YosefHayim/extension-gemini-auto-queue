import type { GeminiMode, GeminiTool, QueueItem, QueueStatus } from "@/types";

export type BulkQueueAction = "shuffle" | "moveTop" | "retryFailed" | "changeTool" | "changeMode";

export type BulkActionType =
  | "attach"
  | "ai"
  | "modify"
  | "reset"
  | "copy"
  | "removeText"
  | "removeFiles"
  | "downloadChat"
  | null;

export interface ResetFilter {
  type: "all" | "text" | "hasImages" | "tool" | "mode" | "status";
  textMatch?: string;
  tool?: GeminiTool;
  mode?: GeminiMode;
  status?: QueueStatus;
}

export interface ChatMediaCounts {
  images: number;
  videos: number;
  files: number;
  total: number;
}

export interface SelectedFile {
  data: string;
  name: string;
  type: string;
}

export interface BulkActionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  hasApiKey: boolean;
  pendingCount: number;
  totalCount: number;
  completedCount: number;
  failedCount: number;
  pendingItems: QueueItem[];
  onBulkAttach: (images: string[]) => void;
  onBulkAIOptimize: (instructions: string) => void | Promise<void>;
  onBulkModify: (text: string, position: "prepend" | "append") => void;
  onBulkReset: (filter: ResetFilter) => void;
  onCopyAllPrompts: () => string;
  onBulkRemoveText: (text: string) => void;
  onBulkRemoveFiles: (indices: number[] | "all") => void;
  onScanChatMedia?: () => Promise<ChatMediaCounts | null>;
  onDownloadChatMedia?: (
    method: "native" | "direct",
    filterType?: "image" | "video" | "file"
  ) => Promise<void>;
  onBulkShuffle?: () => void;
  onBulkMoveToTop?: () => void;
  onBulkRetryFailed?: () => void;
  onBulkChangeTool?: (tool: GeminiTool) => void;
  onBulkChangeMode?: (mode: GeminiMode) => void;
}

export interface BasePanelProps {
  isDark: boolean;
  onBack: () => void;
}

export interface AttachPanelProps extends BasePanelProps {
  selectedFiles: SelectedFile[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<SelectedFile[]>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface AIOptimizePanelProps extends BasePanelProps {
  aiInstructions: string;
  setAiInstructions: (value: string) => void;
}

export interface ModifyPanelProps extends BasePanelProps {
  modifyText: string;
  setModifyText: (value: string) => void;
  modifyPosition: "prepend" | "append";
  setModifyPosition: (value: "prepend" | "append") => void;
}

export interface ResetPanelProps extends BasePanelProps {
  resetFilterType: ResetFilter["type"];
  setResetFilterType: (value: ResetFilter["type"]) => void;
  resetTextMatch: string;
  setResetTextMatch: (value: string) => void;
  resetTool: GeminiTool | null;
  setResetTool: (value: GeminiTool | null) => void;
  resetMode: GeminiMode | null;
  setResetMode: (value: GeminiMode | null) => void;
  resetStatus: QueueStatus | null;
  setResetStatus: (value: QueueStatus | null) => void;
  resettableCount: number;
}

export interface RemoveTextPanelProps extends BasePanelProps {
  textToRemove: string;
  setTextToRemove: (value: string) => void;
  pendingCount: number;
  pendingItems: QueueItem[];
}

export interface RemoveFilesPanelProps extends BasePanelProps {
  allUniqueImages: string[];
  selectedImagesForRemoval: number[];
  setSelectedImagesForRemoval: React.Dispatch<React.SetStateAction<number[]>>;
  pendingItems: QueueItem[];
}

export interface DownloadChatPanelProps extends BasePanelProps {
  isScanning: boolean;
  chatMediaCounts: ChatMediaCounts | null;
  downloadMethod: "native" | "direct";
  setDownloadMethod: (value: "native" | "direct") => void;
}
