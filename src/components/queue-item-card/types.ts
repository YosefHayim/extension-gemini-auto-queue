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

export const MODE_BADGE_STYLES: Record<GeminiMode, { light: string; dark: string }> = {
  quick: {
    light: "bg-emerald-100 text-emerald-600",
    dark: "bg-emerald-900/50 text-emerald-400",
  },
  deep: {
    light: "bg-blue-100 text-blue-600",
    dark: "bg-blue-900/50 text-blue-400",
  },
  pro: {
    light: "bg-purple-100 text-purple-600",
    dark: "bg-purple-900/50 text-purple-400",
  },
};
