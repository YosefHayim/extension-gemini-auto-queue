import { QueueStatus } from "@/types";

import type { QueueItem, GeminiMode } from "@/types";

export const MAX_IMAGES_PER_CARD = 10;

export interface QueueItemCardProps {
  item: QueueItem;
  isDark: boolean;
  searchText?: string;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDuplicateWithAI: (id: string) => void;
  onEdit?: (id: string, newPrompt: string) => void;
  onRunSingle?: (id: string) => void;
  onUpdateImages?: (id: string, images: string[]) => void;
  isEditing?: boolean;
  dragHandleProps?: Record<string, unknown>;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  showCheckbox?: boolean;
}

export const STATUS_BORDER_STYLES: Record<QueueStatus, string> = {
  [QueueStatus.Pending]: "border-l-amber-400",
  [QueueStatus.Processing]: "border-l-blue-500 animate-pulse",
  [QueueStatus.Completed]: "border-l-emerald-500",
  [QueueStatus.Failed]: "border-l-red-500",
};

export const MODE_BADGE_STYLES: Record<GeminiMode, { light: string; dark: string }> = {
  quick: {
    light: "bg-emerald-50 text-emerald-600",
    dark: "bg-emerald-500/10 text-emerald-400",
  },
  deep: {
    light: "bg-blue-50 text-blue-600",
    dark: "bg-blue-500/10 text-blue-400",
  },
  pro: {
    light: "bg-purple-50 text-purple-600",
    dark: "bg-purple-500/10 text-purple-400",
  },
};
