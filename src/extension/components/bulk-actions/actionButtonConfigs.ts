import {
  ClipboardCopy,
  Download,
  ImageMinus,
  Paperclip,
  Pencil,
  RefreshCw,
  Type,
  Wand2,
} from "lucide-react";

import type { BulkActionType, ChatMediaCounts } from "@/extension/components/bulk-actions/types";
import type { LucideIcon } from "lucide-react";

export interface ActionButtonConfig {
  type: Exclude<BulkActionType, null>;
  icon: LucideIcon;
  label: string;
  description: string;
  available: boolean;
  count: number;
}

interface ActionButtonConfigParams {
  hasApiKey: boolean;
  pendingCount: number;
  totalCount: number;
  resettableCount: number;
  allUniqueImagesCount: number;
  chatMediaCounts: ChatMediaCounts | null;
  onDownloadChatMedia?: boolean;
}

export const getActionButtonConfigs = ({
  hasApiKey,
  pendingCount,
  totalCount,
  resettableCount,
  allUniqueImagesCount,
  chatMediaCounts,
  onDownloadChatMedia,
}: ActionButtonConfigParams): ActionButtonConfig[] => [
  {
    type: "attach",
    icon: Paperclip,
    label: "Attach Files",
    description: "Add reference files (images, videos, etc.) to all pending prompts",
    available: pendingCount > 0,
    count: pendingCount,
  },
  {
    type: "ai",
    icon: Wand2,
    label: "AI Optimize",
    description: hasApiKey ? "Enhance all prompts with AI" : "Requires API key in Settings",
    available: hasApiKey && pendingCount > 0,
    count: pendingCount,
  },
  {
    type: "modify",
    icon: Pencil,
    label: "Bulk Modify",
    description: "Add text to all pending prompts",
    available: pendingCount > 0,
    count: pendingCount,
  },
  {
    type: "reset",
    icon: RefreshCw,
    label: "Reset Prompts",
    description:
      resettableCount > 0 ? "Reset completed/failed prompts to re-run" : "No prompts to reset",
    available: resettableCount > 0,
    count: resettableCount,
  },
  {
    type: "copy",
    icon: ClipboardCopy,
    label: "Copy All Prompts",
    description:
      totalCount > 0
        ? "Copy all prompts to clipboard for use in another browser"
        : "No prompts to copy",
    available: totalCount > 0,
    count: totalCount,
  },
  {
    type: "removeText",
    icon: Type,
    label: "Remove Text",
    description: "Remove specific text from all pending prompts",
    available: pendingCount > 0,
    count: pendingCount,
  },
  {
    type: "removeFiles",
    icon: ImageMinus,
    label: "Remove Files",
    description:
      allUniqueImagesCount > 0
        ? "Remove attached images from pending prompts"
        : "No images attached to remove",
    available: allUniqueImagesCount > 0,
    count: allUniqueImagesCount,
  },
  {
    type: "downloadChat",
    icon: Download,
    label: "Download Chat Media",
    description: onDownloadChatMedia
      ? "Download all generated images/videos from the chat"
      : "Not available in this context",
    available: !!onDownloadChatMedia,
    count: chatMediaCounts?.total ?? 0,
  },
];
