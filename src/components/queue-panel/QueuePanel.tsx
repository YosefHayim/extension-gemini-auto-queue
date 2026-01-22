import React from "react";

import { GeminiMode, QueueStatus } from "@/types";

import { SearchFilter } from "../SearchFilter";

import { BulkActionsHandler } from "./BulkActionsHandler";
import { EmptyQueue } from "./EmptyQueue";
import { EstimatedTime } from "./EstimatedTime";
import { useQueuePanelState } from "./hooks/useQueuePanelState";
import { ModeSelector } from "./ModeSelector";
import { PromptInput } from "./PromptInput";
import { QueueActions } from "./QueueActions";
import { QueueList } from "./QueueList";
import { SelectionBar } from "./SelectionBar";
import { ToolSelector } from "./ToolSelector";

import type { QueuePanelProps } from "./types";

export const QueuePanel: React.FC<QueuePanelProps> = ({
  queue,
  isDark,
  defaultTool,
  hasApiKey,
  onAddToQueue,
  onRemoveFromQueue,
  onRetryQueueItem,
  onClearAll,
  onClearByFilter,
  onOpenCsvDialog,
  onReorderQueue,
  onDuplicateItem,
  onDuplicateWithAI,
  onEditItem,
  onRunSingleItem,
  onUpdateItemImages,
  selectedMode = GeminiMode.Quick,
  onModeChange,
  onBulkAttachImages,
  onBulkAIOptimize,
  onOpenAIOptimization,
  onBulkModify,
  onBulkReset,
  onBulkRemoveText,
  onBulkRemoveFiles,
  onScanChatMedia,
  onDownloadChatMedia,
  onClearCompleted,
  onOpenExport,
}) => {
  const {
    bulkInput,
    setBulkInput,
    selectedImages,
    setSelectedImages,
    selection,
    setSelection,
    selectedTool,
    setSelectedTool,
    localSelectedMode,
    searchText,
    setSearchText,
    selectedToolFilters,
    setSelectedToolFilters,
    selectedModeFilters,
    setSelectedModeFilters,
    selectedContentFilters,
    setSelectedContentFilters,
    selectedStatusFilters,
    setSelectedStatusFilters,
    showBulkActions,
    setShowBulkActions,
    selectedIds,
    textareaRef,
    stats,
    filteredQueue,
    promptPreviewCount,
    selectedCount,
    hasSelection,
    selectedItems,
    selectedPendingItems,
    handleToggleSelect,
    handleSelectAll,
    handleClearSelection,
    handleModeSelect,
    handleEnqueue,
  } = useQueuePanelState({
    queue,
    defaultTool,
    selectedMode,
    onModeChange,
    onAddToQueue,
  });

  const hasBulkActions = !!(onBulkAttachImages || onBulkAIOptimize || onBulkModify);

  return (
    <div className="animate-in fade-in space-y-3 duration-300">
      <BulkActionsHandler
        isOpen={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        isDark={isDark}
        hasApiKey={hasApiKey}
        queue={queue}
        selectedItems={selectedItems}
        selectedIds={selectedIds}
        hasSelection={hasSelection}
        pendingCount={stats.pendingCount}
        pendingItems={stats.pendingItems}
        completedCount={stats.completedCount}
        failedCount={stats.failedCount}
        onBulkAttachImages={onBulkAttachImages}
        onBulkAIOptimize={onBulkAIOptimize}
        onOpenAIOptimization={onOpenAIOptimization}
        onBulkModify={onBulkModify}
        onBulkReset={onBulkReset}
        onBulkRemoveText={onBulkRemoveText}
        onBulkRemoveFiles={onBulkRemoveFiles}
        onScanChatMedia={onScanChatMedia}
        onDownloadChatMedia={onDownloadChatMedia}
        onClearSelection={handleClearSelection}
      />

      <PromptInput
        bulkInput={bulkInput}
        onBulkInputChange={setBulkInput}
        selectedImages={selectedImages}
        onImagesChange={setSelectedImages}
        selection={selection}
        onSelectionChange={setSelection}
        promptPreviewCount={promptPreviewCount}
        onEnqueue={handleEnqueue}
        onOpenCsvDialog={onOpenCsvDialog}
        isDark={isDark}
        textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
      />

      <ToolSelector selectedTool={selectedTool} onToolChange={setSelectedTool} isDark={isDark} />

      <ModeSelector
        selectedMode={localSelectedMode}
        onModeChange={handleModeSelect}
        isDark={isDark}
      />

      <div data-onboarding="queue-list" className="space-y-2 pt-2">
        {queue.length === 0 ? (
          <EmptyQueue isDark={isDark} />
        ) : (
          <>
            <SearchFilter
              searchText={searchText}
              onSearchChange={setSearchText}
              selectedTools={selectedToolFilters}
              onToolsChange={setSelectedToolFilters}
              selectedModes={selectedModeFilters}
              onModesChange={setSelectedModeFilters}
              selectedContentTypes={selectedContentFilters}
              onContentTypesChange={setSelectedContentFilters}
              selectedStatuses={selectedStatusFilters}
              onStatusesChange={setSelectedStatusFilters}
              isDark={isDark}
              totalItems={queue.length}
              filteredCount={filteredQueue.length}
            />

            <SelectionBar
              selectedCount={selectedCount}
              selectedPendingCount={selectedPendingItems.length}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              isDark={isDark}
            />

            <EstimatedTime
              estimatedTimeRemaining={stats.estimatedTimeRemaining}
              pendingCount={stats.pendingCount}
              isDark={isDark}
            />

            <QueueActions
              queue={queue}
              pendingCount={stats.pendingCount}
              completedCount={stats.completedCount}
              isDark={isDark}
              onShowBulkActions={() => setShowBulkActions(true)}
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
              onToggleSelect={handleToggleSelect}
              pendingStatus={QueueStatus.Pending}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default QueuePanel;
