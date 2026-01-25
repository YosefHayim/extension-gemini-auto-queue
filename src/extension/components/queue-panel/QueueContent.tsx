import { Check, ChevronDown, Play, Search, Settings2, SquareCheck, Timer } from "lucide-react";
import React, { useRef, useState } from "react";

import {
  GEMINI_MODE_INFO,
  GeminiMode,
  QueueStatus,
  type ContentType,
  type GeminiTool,
  type QueueItem,
} from "@/backend/types";
import { QueueList } from "@/extension/components/queue-panel/QueueList";

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

const STATUS_OPTIONS = [
  { value: QueueStatus.Pending, label: "Pending", color: "amber" },
  { value: QueueStatus.Processing, label: "Processing", color: "blue" },
  { value: QueueStatus.Completed, label: "Completed", color: "emerald" },
  { value: QueueStatus.Failed, label: "Failed", color: "red" },
];

const MODE_OPTIONS = [
  { value: GeminiMode.Quick, label: GEMINI_MODE_INFO[GeminiMode.Quick].label, color: "emerald" },
  { value: GeminiMode.Deep, label: GEMINI_MODE_INFO[GeminiMode.Deep].label, color: "blue" },
  { value: GeminiMode.Pro, label: GEMINI_MODE_INFO[GeminiMode.Pro].label, color: "purple" },
];

export const QueueContent: React.FC<QueueContentProps> = ({
  queue,
  filteredQueue,
  isDark,
  searchText,
  selectedToolFilters: _selectedToolFilters,
  selectedModeFilters,
  selectedContentFilters: _selectedContentFilters,
  selectedStatusFilters,
  onSearchChange,
  onToolsChange: _onToolsChange,
  onModesChange,
  onContentTypesChange: _onContentTypesChange,
  onStatusesChange,
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
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target as Node)) {
        setModeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleStatusFilter = (status: QueueStatus) => {
    const isSelected = selectedStatusFilters.includes(status);
    if (isSelected) {
      onStatusesChange(selectedStatusFilters.filter((s) => s !== status));
    } else {
      onStatusesChange([...selectedStatusFilters, status]);
    }
  };

  const toggleModeFilter = (mode: GeminiMode) => {
    const isSelected = selectedModeFilters.includes(mode);
    if (isSelected) {
      onModesChange(selectedModeFilters.filter((m) => m !== mode));
    } else {
      onModesChange([...selectedModeFilters, mode]);
    }
  };

  const getStatusLabel = () => {
    if (selectedStatusFilters.length === 0) return "All Status";
    if (selectedStatusFilters.length === 1) {
      return (
        STATUS_OPTIONS.find((s) => s.value === selectedStatusFilters[0])?.label ?? "All Status"
      );
    }
    return `${selectedStatusFilters.length} statuses`;
  };

  const getModeLabel = () => {
    if (selectedModeFilters.length === 0) return "All Models";
    if (selectedModeFilters.length === 1) {
      return MODE_OPTIONS.find((m) => m.value === selectedModeFilters[0])?.label ?? "All Models";
    }
    return `${selectedModeFilters.length} modes`;
  };
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Queue</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {queue.length}
          </span>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 rounded bg-info/20 px-2.5 py-1 text-xs font-medium text-info">
              <Timer size={12} />
              {estimatedTimeRemaining ?? "calculating..."}
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
          <div className="relative flex-1" ref={statusDropdownRef}>
            <button
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className={`flex w-full items-center justify-between gap-2 rounded border px-2.5 py-2 text-xs font-medium transition-colors ${
                selectedStatusFilters.length > 0
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span>{getStatusLabel()}</span>
              <ChevronDown size={14} className={statusDropdownOpen ? "rotate-180" : ""} />
            </button>
            {statusDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = selectedStatusFilters.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleStatusFilter(option.value)}
                      className="flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-muted"
                    >
                      <span className="text-foreground">{option.label}</span>
                      {isSelected && <Check size={14} className="text-primary" />}
                    </button>
                  );
                })}
                {selectedStatusFilters.length > 0 && (
                  <>
                    <div className="border-t border-border" />
                    <button
                      onClick={() => onStatusesChange([])}
                      className="w-full px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
                    >
                      Clear filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="relative flex-1" ref={modeDropdownRef}>
            <button
              onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
              className={`flex w-full items-center justify-between gap-2 rounded border px-2.5 py-2 text-xs font-medium transition-colors ${
                selectedModeFilters.length > 0
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span>{getModeLabel()}</span>
              <ChevronDown size={14} className={modeDropdownOpen ? "rotate-180" : ""} />
            </button>
            {modeDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
                {MODE_OPTIONS.map((option) => {
                  const isSelected = selectedModeFilters.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleModeFilter(option.value)}
                      className="flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-muted"
                    >
                      <span className="text-foreground">{option.label}</span>
                      {isSelected && <Check size={14} className="text-primary" />}
                    </button>
                  );
                })}
                {selectedModeFilters.length > 0 && (
                  <>
                    <div className="border-t border-border" />
                    <button
                      onClick={() => onModesChange([])}
                      className="w-full px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
                    >
                      Clear filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
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
