import React from "react";

import type { ContentType, GeminiMode, GeminiTool, QueueItem, QueueStatus } from "@/types";

import { SearchFilter } from "../SearchFilter";

import { EstimatedTime } from "./EstimatedTime";
import { QueueActions } from "./QueueActions";
import { QueueList } from "./QueueList";
import { SelectionBar } from "./SelectionBar";

interface QueueContentProps {
  queue: QueueItem[];
  filteredQueue: QueueItem[];
  isDark: boolean;
  searchText: string;
  selectedToolFilters: GeminiTool[];
  selectedModeFilters: GeminiMode[];
  selectedContentFilters: ContentType[];
  selectedStatusFilters: QueueStatus[];
  onSearchChange: (text: string) => void;
  onToolsChange: (tools: GeminiTool[]) => void;
  onModesChange: (modes: GeminiMode[]) => void;
  onContentTypesChange: (types: ContentType[]) => void;
  onStatusesChange: (statuses: QueueStatus[]) => void;
  selectedCount: number;
  selectedPendingCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  estimatedTimeRemaining: string | null;
  pendingCount: number;
  completedCount: number;
  onShowBulkActions: () => void;
  onClearCompleted?: () => void;
  onOpenExport?: () => void;
  onClearAll?: () => void;
  onClearByFilter?: (filter: {
    status?: QueueStatus;
    tool?: GeminiTool;
    mode?: GeminiMode;
  }) => void;
  hasBulkActions: boolean;
  hasSelection: boolean;
  selectedIds: Set<string>;
  onRemoveFromQueue: (id: string) => void;
  onRetryQueueItem: (id: string) => void;
  onDuplicateItem: (id: string) => void;
  onDuplicateWithAI: (id: string) => void;
  onEditItem?: (id: string, newPrompt: string) => void;
  onRunSingleItem?: (id: string) => void;
  onUpdateItemImages?: (id: string, images: string[]) => void;
  onReorderQueue: (newQueue: QueueItem[]) => void;
  onToggleSelect: (id: string) => void;
  pendingStatus: QueueStatus;
}

export const QueueContent: React.FC<QueueContentProps> = ({
  queue,
  filteredQueue,
  isDark,
  searchText,
  selectedToolFilters,
  selectedModeFilters,
  selectedContentFilters,
  selectedStatusFilters,
  onSearchChange,
  onToolsChange,
  onModesChange,
  onContentTypesChange,
  onStatusesChange,
  selectedCount,
  selectedPendingCount,
  onSelectAll,
  onClearSelection,
  estimatedTimeRemaining,
  pendingCount,
  completedCount,
  onShowBulkActions,
  onClearCompleted,
  onOpenExport,
  onClearAll,
  onClearByFilter,
  hasBulkActions,
  hasSelection,
  selectedIds,
  onRemoveFromQueue,
  onRetryQueueItem,
  onDuplicateItem,
  onDuplicateWithAI,
  onEditItem,
  onRunSingleItem,
  onUpdateItemImages,
  onReorderQueue,
  onToggleSelect,
  pendingStatus,
}) => {
  return (
    <>
      <SearchFilter
        searchText={searchText}
        onSearchChange={onSearchChange}
        selectedTools={selectedToolFilters}
        onToolsChange={onToolsChange}
        selectedModes={selectedModeFilters}
        onModesChange={onModesChange}
        selectedContentTypes={selectedContentFilters}
        onContentTypesChange={onContentTypesChange}
        selectedStatuses={selectedStatusFilters}
        onStatusesChange={onStatusesChange}
        isDark={isDark}
        totalItems={queue.length}
        filteredCount={filteredQueue.length}
      />

      <SelectionBar
        selectedCount={selectedCount}
        selectedPendingCount={selectedPendingCount}
        onSelectAll={onSelectAll}
        onClearSelection={onClearSelection}
        isDark={isDark}
      />

      <EstimatedTime
        estimatedTimeRemaining={estimatedTimeRemaining}
        pendingCount={pendingCount}
        isDark={isDark}
      />

      <QueueActions
        queue={queue}
        pendingCount={pendingCount}
        completedCount={completedCount}
        isDark={isDark}
        onShowBulkActions={onShowBulkActions}
        onClearCompleted={onClearCompleted}
        onOpenExport={onOpenExport}
        onClearAll={onClearAll}
        onClearByFilter={onClearByFilter}
        hasBulkActions={hasBulkActions}
      />

      <QueueList
        queue={queue}
        filteredQueue={filteredQueue}
        isDark={isDark}
        searchText={searchText}
        hasSelection={hasSelection}
        selectedIds={selectedIds}
        onRemoveFromQueue={onRemoveFromQueue}
        onRetryQueueItem={onRetryQueueItem}
        onDuplicateItem={onDuplicateItem}
        onDuplicateWithAI={onDuplicateWithAI}
        onEditItem={onEditItem}
        onRunSingleItem={onRunSingleItem}
        onUpdateItemImages={onUpdateItemImages}
        onReorderQueue={onReorderQueue}
        onToggleSelect={onToggleSelect}
        pendingStatus={pendingStatus}
      />
    </>
  );
};
