import {
  Check,
  ClipboardCopy,
  Download,
  ImageMinus,
  Paperclip,
  Pencil,
  RefreshCw,
  Type,
  Wand2,
} from "lucide-react";
import React from "react";

import type { BulkActionType, ChatMediaCounts } from "./types";
import type { LucideIcon } from "lucide-react";

interface ActionButtonConfig {
  type: Exclude<BulkActionType, null>;
  icon: LucideIcon;
  label: string;
  description: string;
  available: boolean;
  count: number;
}

interface ActionButtonListProps {
  isDark: boolean;
  hasApiKey: boolean;
  pendingCount: number;
  totalCount: number;
  resettableCount: number;
  allUniqueImagesCount: number;
  chatMediaCounts: ChatMediaCounts | null;
  copySuccess: boolean;
  onDownloadChatMedia?: boolean;
  onActionSelect: (type: Exclude<BulkActionType, null>) => void;
  onCopyAll: () => void;
}

export const ActionButtonList: React.FC<ActionButtonListProps> = ({
  isDark: _isDark,
  hasApiKey,
  pendingCount,
  totalCount,
  resettableCount,
  allUniqueImagesCount,
  chatMediaCounts,
  copySuccess,
  onDownloadChatMedia,
  onActionSelect,
  onCopyAll,
}) => {
  const actionButtons: ActionButtonConfig[] = [
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

  const getIconColorClass = (type: string, isCopySuccess: boolean) => {
    if (type === "copy" && isCopySuccess) return "bg-zinc-500/20 text-zinc-600 dark:text-zinc-300";
    if (type === "ai") return "bg-violet-500/20 text-violet-500";
    if (type === "attach") return "bg-indigo-500/20 text-indigo-500";
    if (type === "reset") return "bg-amber-500/20 text-amber-500";
    if (type === "copy") return "bg-cyan-500/20 text-cyan-500";
    if (type === "removeText" || type === "removeFiles") return "bg-rose-500/20 text-rose-500";
    return "bg-zinc-500/20 text-zinc-600 dark:text-zinc-300";
  };

  return (
    <div className="h-[300px] space-y-2 overflow-y-auto">
      {actionButtons.map((action) => (
        <button
          key={action.type}
          onClick={() => {
            if (!action.available) return;
            if (action.type === "copy") {
              onCopyAll();
            } else {
              onActionSelect(action.type);
            }
          }}
          disabled={!action.available || (action.type === "copy" && copySuccess)}
          className={`flex w-full items-center gap-3 rounded-md border p-3 text-left transition-all ${
            action.type === "copy" && copySuccess
              ? "border-zinc-400 bg-zinc-200/50 dark:border-zinc-600 dark:bg-zinc-700/50"
              : action.available
                ? "border-border bg-muted hover:border-muted-foreground/30 hover:bg-muted/80"
                : "cursor-not-allowed opacity-50"
          }`}
        >
          <div className={`rounded-md p-2 ${getIconColorClass(action.type, copySuccess)}`}>
            {action.type === "copy" && copySuccess ? (
              <Check size={18} />
            ) : (
              <action.icon size={18} />
            )}
          </div>
          <div className="flex-1">
            <div
              className={`text-sm font-semibold ${
                action.type === "copy" && copySuccess
                  ? "text-zinc-700 dark:text-zinc-200"
                  : "text-foreground"
              }`}
            >
              {action.type === "copy" && copySuccess ? "Copied!" : action.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {action.type === "copy" && copySuccess
                ? "Prompts copied to clipboard"
                : action.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
