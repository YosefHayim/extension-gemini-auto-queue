import React from "react";

import { QueueStatus, type GeminiMode, type GeminiTool, type QueueItem } from "@/types";

import { BulkActionsDialog, type ResetFilter } from "../BulkActionsDialog";

interface BulkActionsHandlerProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  hasApiKey: boolean;
  queue: QueueItem[];
  selectedItems: QueueItem[];
  selectedIds: Set<string>;
  hasSelection: boolean;
  pendingCount: number;
  pendingItems: QueueItem[];
  completedCount: number;
  failedCount: number;
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
  onClearSelection: () => void;
  onBulkShuffle?: (selectedIds?: string[]) => void;
  onBulkMoveToTop?: (selectedIds?: string[]) => void;
  onBulkRetryFailed?: (selectedIds?: string[]) => void;
  onBulkChangeTool?: (tool: GeminiTool, selectedIds?: string[]) => void;
  onBulkChangeMode?: (mode: GeminiMode, selectedIds?: string[]) => void;
  onBulkDelete?: (selectedIds?: string[]) => void;
}

export const BulkActionsHandler: React.FC<BulkActionsHandlerProps> = ({
  isOpen,
  onClose,
  isDark,
  hasApiKey,
  queue,
  selectedItems,
  selectedIds,
  hasSelection,
  pendingCount,
  pendingItems,
  completedCount,
  failedCount,
  onBulkAttachImages,
  onBulkAIOptimize,
  onBulkModify,
  onBulkReset,
  onBulkRemoveText,
  onBulkRemoveFiles,
  onScanChatMedia,
  onDownloadChatMedia,
  onClearSelection,
  onBulkShuffle,
  onBulkMoveToTop,
  onBulkRetryFailed,
  onBulkChangeTool,
  onBulkChangeMode,
  onBulkDelete,
}) => {
  const selectedPendingItems = selectedItems.filter((item) => item.status === QueueStatus.Pending);
  const selectedCount = selectedIds.size;

  return (
    <BulkActionsDialog
      isOpen={isOpen}
      onClose={() => {
        onClose();
        onClearSelection();
      }}
      isDark={isDark}
      hasApiKey={hasApiKey}
      pendingCount={hasSelection ? selectedPendingItems.length : pendingCount}
      totalCount={hasSelection ? selectedCount : queue.length}
      completedCount={
        hasSelection
          ? selectedItems.filter((i) => i.status === QueueStatus.Completed).length
          : completedCount
      }
      failedCount={
        hasSelection
          ? selectedItems.filter((i) => i.status === QueueStatus.Failed).length
          : failedCount
      }
      onBulkAttach={(images) => {
        onBulkAttachImages?.(images, hasSelection ? Array.from(selectedIds) : undefined);
        onClose();
        onClearSelection();
      }}
      onBulkAIOptimize={async (instructions) => {
        await onBulkAIOptimize?.(instructions, hasSelection ? Array.from(selectedIds) : undefined);
        onClose();
        onClearSelection();
      }}
      onBulkModify={(text, position) => {
        onBulkModify?.(text, position, hasSelection ? Array.from(selectedIds) : undefined);
        onClose();
        onClearSelection();
      }}
      onBulkReset={(filter) => {
        onBulkReset?.(filter, hasSelection ? Array.from(selectedIds) : undefined);
        onClose();
        onClearSelection();
      }}
      onCopyAllPrompts={() => {
        const items = hasSelection ? selectedItems : queue;
        return items.map((item) => item.originalPrompt).join("\n\n");
      }}
      pendingItems={hasSelection ? selectedPendingItems : pendingItems}
      onBulkRemoveText={(text) => {
        onBulkRemoveText?.(text, hasSelection ? Array.from(selectedIds) : undefined);
        onClose();
        onClearSelection();
      }}
      onBulkRemoveFiles={(indices) => {
        onBulkRemoveFiles?.(indices, hasSelection ? Array.from(selectedIds) : undefined);
        onClose();
        onClearSelection();
      }}
      onScanChatMedia={onScanChatMedia}
      onDownloadChatMedia={async (method, filterType) => {
        await onDownloadChatMedia?.(method, filterType);
        onClose();
      }}
      onBulkShuffle={() => {
        onBulkShuffle?.(hasSelection ? Array.from(selectedIds) : undefined);
        onClose();
        onClearSelection();
      }}
      onBulkMoveToTop={() => {
        onBulkMoveToTop?.(hasSelection ? Array.from(selectedIds) : undefined);
        onClose();
        onClearSelection();
      }}
      onBulkRetryFailed={() => {
        onBulkRetryFailed?.(hasSelection ? Array.from(selectedIds) : undefined);
        onClose();
        onClearSelection();
      }}
      onBulkChangeTool={(tool) => {
        onBulkChangeTool?.(tool, hasSelection ? Array.from(selectedIds) : undefined);
        onClose();
        onClearSelection();
      }}
      onBulkChangeMode={(mode) => {
        onBulkChangeMode?.(mode, hasSelection ? Array.from(selectedIds) : undefined);
        onClose();
        onClearSelection();
      }}
      onBulkDelete={() => {
        onBulkDelete?.(hasSelection ? Array.from(selectedIds) : undefined);
        onClose();
        onClearSelection();
      }}
    />
  );
};
