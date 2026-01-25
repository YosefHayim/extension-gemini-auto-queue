import React from "react";
import { ChevronDown, Play, Search, Settings2, SquareCheck, Timer } from "lucide-react";

import { QueueList } from "./QueueList";

import type { ContentType, GeminiMode, GeminiTool, QueueItem, QueueStatus } from "@/types";

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
  selectedToolFilters: _selectedToolFilters,
  selectedModeFilters: _selectedModeFilters,
  selectedContentFilters: _selectedContentFilters,
  selectedStatusFilters: _selectedStatusFilters,
  onSearchChange,
  onToolsChange: _onToolsChange,
  onModesChange: _onModesChange,
  onContentTypesChange: _onContentTypesChange,
  onStatusesChange: _onStatusesChange,
  selectedCount,
  selectedPendingCount: _selectedPendingCount,
  onSelectAll,
  onClearSelection,
  estimatedTimeRemaining,
  pendingCount,
  completedCount: _completedCount,
  onShowBulkActions,
  onClearCompleted: _onClearCompleted,
  onOpenExport: _onOpenExport,
  onClearAll: _onClearAll,
  onClearByFilter: _onClearByFilter,
  hasBulkActions: _hasBulkActions,
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
    <div className="flex h-full w-full flex-col">
      <div className={`flex items-center justify-between border-b border-border px-4 py-3`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Queue</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {queue.length}
          </span>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 rounded bg-info/20 px-2.5 py-1 text-xs font-medium text-info">
              <Timer size={12} />
              {estimatedTimeRemaining || "calculating..."}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSelectAll}
            className="rounded bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
          >
            Select
          </button>
          <button
            onClick={onShowBulkActions}
            disabled={pendingCount === 0}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
              pendingCount === 0
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <Play size={14} />
            Start
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground placeholder-opacity-60 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="flex flex-1 items-center justify-between gap-2 rounded border border-border bg-muted px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80">
            <span>All Status</span>
            <ChevronDown size={14} />
          </button>
          <button className="flex flex-1 items-center justify-between gap-2 rounded border border-border bg-muted px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80">
            <span>All Models</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {hasSelection && (
        <div className="flex items-center justify-between bg-foreground px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={onClearSelection}
              className="flex h-5 w-5 items-center justify-center rounded border border-border transition-colors hover:bg-muted"
            >
              <SquareCheck size={16} className="text-primary-foreground" />
            </button>
            <span className="text-sm font-medium text-primary-foreground">
              {selectedCount} selected
            </span>
          </div>

          <button
            onClick={onShowBulkActions}
            className="flex items-center gap-1.5 rounded bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
          >
            <Settings2 size={14} />
            Actions
            <ChevronDown size={12} />
          </button>
        </div>
      )}

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
    </div>
  );
};
