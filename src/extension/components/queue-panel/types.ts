import type { GeminiMode, GeminiTool, QueueItem, QueueStatus } from "@/backend/types";
import type { ResetFilter } from "@/extension/components/BulkActionsDialog";
import type { QueueItemEditData } from "@/extension/components/queue-item-card/types";

export interface SortableQueueItemProps {
  item: QueueItem;
  isDark: boolean;
  searchText?: string;
  queueNumber: number;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDuplicateWithAI: (id: string) => void;
  onEdit?: (id: string, data: QueueItemEditData) => void;
  onRunSingle?: (id: string) => void;
  onUpdateImages?: (id: string, images: string[]) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  showCheckbox?: boolean;
}

export interface QueuePanelProps {
  queue: QueueItem[];
  isDark: boolean;
  defaultTool?: GeminiTool;
  hasApiKey: boolean;
  onAddToQueue: (
    text?: string,
    templateText?: string,
    images?: string[],
    tool?: GeminiTool,
    mode?: GeminiMode
  ) => void;
  onRemoveFromQueue: (id: string) => void;
  onRetryQueueItem: (id: string) => void;
  onClearAll?: () => void;
  onClearByFilter?: (filter: {
    status?: QueueStatus;
    tool?: GeminiTool;
    mode?: GeminiMode;
  }) => void;
  onOpenCsvDialog: () => void;
  onReorderQueue: (newQueue: QueueItem[]) => void;
  onDuplicateItem: (id: string) => void;
  onDuplicateWithAI: (id: string) => void;
  onEditItem?: (id: string, data: QueueItemEditData) => void;
  onRunSingleItem?: (id: string) => void;
  onUpdateItemImages?: (id: string, images: string[]) => void;
  selectedMode?: GeminiMode;
  onModeChange?: (mode: GeminiMode) => void;
  onBulkAttachImages?: (images: string[], selectedIds?: string[]) => void;
  onBulkAIOptimize?: (instructions: string, selectedIds?: string[]) => Promise<void>;
  onBulkModify?: (text: string, position: "prepend" | "append", selectedIds?: string[]) => void;
  onBulkReset?: (filter: ResetFilter, selectedIds?: string[]) => void;
  onBulkRemoveText?: (text: string, selectedIds?: string[]) => void;
  onBulkRemoveFiles?: (indices: number[] | "all", selectedIds?: string[]) => void;
  onScanChatMedia?: () => Promise<{
    images: number;
    videos: number;
    files: number;
    total: number;
  } | null>;
  onDownloadChatMedia?: (
    method: "native" | "direct",
    filterType?: "image" | "video" | "file"
  ) => Promise<void>;
  onClearCompleted?: () => void;
  onOpenExport?: () => void;
  onBulkShuffle?: (selectedIds?: string[]) => void;
  onBulkMoveToTop?: (selectedIds?: string[]) => void;
  onBulkRetryFailed?: (selectedIds?: string[]) => void;
  onBulkChangeTool?: (tool: GeminiTool, selectedIds?: string[]) => void;
  onBulkChangeMode?: (mode: GeminiMode, selectedIds?: string[]) => void;
  onBulkDelete?: (selectedIds?: string[]) => void;
  onBulkDeleteByPattern?: (pattern: string, selectedIds?: string[]) => void;
  onBulkTranslate?: (targetLanguage: string, selectedIds?: string[]) => Promise<void>;
}

export interface TextSelection {
  start: number;
  end: number;
  text: string;
}
