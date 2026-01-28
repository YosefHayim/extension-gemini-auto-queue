import React from "react";

import { GeminiMode, QueueStatus } from "@/backend/types";
import { BulkActionsHandler } from "@/extension/components/queue-panel/BulkActionsHandler";
import { EmptyQueue } from "@/extension/components/queue-panel/EmptyQueue";
import { useQueuePanelState } from "@/extension/components/queue-panel/hooks/useQueuePanelState";
import { PromptInput } from "@/extension/components/queue-panel/PromptInput";
import { QueueContent } from "@/extension/components/queue-panel/QueueContent";

import type { QueuePanelProps } from "@/extension/components/queue-panel/types";

export const QueuePanel: React.FC<QueuePanelProps> = (props) => {
  const {
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
    onBulkModify,
    onBulkReset,
    onBulkRemoveText,
    onBulkRemoveFiles,
    onScanChatMedia,
    onDownloadChatMedia,
    onClearCompleted,
    onOpenExport,
    onBulkShuffle,
    onBulkMoveToTop,
    onBulkRetryFailed,
    onBulkChangeTool,
    onBulkChangeMode,
    onBulkDelete,
    onBulkDeleteByPattern,
    onBulkTranslate,
  } = props;

  const state = useQueuePanelState({
    queue,
    defaultTool,
    selectedMode,
    onModeChange,
    onAddToQueue,
  });

  const hasBulkActions = Boolean(onBulkAttachImages ?? onBulkAIOptimize ?? onBulkModify);

  return (
    <div className="animate-in fade-in space-y-3 duration-300">
      <BulkActionsHandler
        isOpen={state.showBulkActions}
        onClose={() => state.setShowBulkActions(false)}
        isDark={isDark}
        hasApiKey={hasApiKey}
        queue={queue}
        selectedItems={state.selectedItems}
        selectedIds={state.selectedIds}
        hasSelection={state.hasSelection}
        pendingCount={state.stats.pendingCount}
        pendingItems={state.stats.pendingItems}
        completedCount={state.stats.completedCount}
        failedCount={state.stats.failedCount}
        onBulkAttachImages={onBulkAttachImages}
        onBulkAIOptimize={onBulkAIOptimize}
        onBulkModify={onBulkModify}
        onBulkReset={onBulkReset}
        onBulkRemoveText={onBulkRemoveText}
        onBulkRemoveFiles={onBulkRemoveFiles}
        onScanChatMedia={onScanChatMedia}
        onDownloadChatMedia={onDownloadChatMedia}
        onClearSelection={state.handleClearSelection}
        onBulkShuffle={onBulkShuffle}
        onBulkMoveToTop={onBulkMoveToTop}
        onBulkRetryFailed={onBulkRetryFailed}
        onBulkChangeTool={onBulkChangeTool}
        onBulkChangeMode={onBulkChangeMode}
        onBulkDelete={onBulkDelete}
        onBulkDeleteByPattern={onBulkDeleteByPattern}
        onBulkTranslate={onBulkTranslate}
      />

      <PromptInput
        bulkInput={state.bulkInput}
        onBulkInputChange={state.setBulkInput}
        selectedImages={state.selectedImages}
        onImagesChange={state.setSelectedImages}
        selection={state.selection}
        onSelectionChange={state.setSelection}
        promptPreviewCount={state.promptPreviewCount}
        onEnqueue={state.handleEnqueue}
        onOpenCsvDialog={onOpenCsvDialog}
        isDark={isDark}
        textareaRef={state.textareaRef}
      />

      <div data-onboarding="queue-list" className="space-y-2 pt-2">
        {queue.length === 0 ? (
          <EmptyQueue isDark={isDark} />
        ) : (
          <QueueContent
            queue={queue}
            filteredQueue={state.filteredQueue}
            isDark={isDark}
            searchText={state.searchText}
            selectedToolFilters={state.selectedToolFilters}
            selectedModeFilters={state.selectedModeFilters}
            selectedContentFilters={state.selectedContentFilters}
            selectedStatusFilters={state.selectedStatusFilters}
            onSearchChange={state.setSearchText}
            onToolsChange={state.setSelectedToolFilters}
            onModesChange={state.setSelectedModeFilters}
            onContentTypesChange={state.setSelectedContentFilters}
            onStatusesChange={state.setSelectedStatusFilters}
            selectedCount={state.selectedCount}
            selectedPendingCount={state.selectedPendingItems.length}
            onSelectAll={state.handleSelectAll}
            onClearSelection={state.handleClearSelection}
            estimatedTimeRemaining={state.stats.estimatedTimeRemaining}
            pendingCount={state.stats.pendingCount}
            completedCount={state.stats.completedCount}
            onShowBulkActions={() => state.setShowBulkActions(true)}
            onClearCompleted={onClearCompleted}
            onOpenExport={onOpenExport}
            onClearAll={onClearAll}
            onClearByFilter={onClearByFilter}
            hasBulkActions={hasBulkActions}
            hasSelection={state.hasSelection}
            selectedIds={state.selectedIds}
            onRemoveFromQueue={onRemoveFromQueue}
            onRetryQueueItem={onRetryQueueItem}
            onDuplicateItem={onDuplicateItem}
            onDuplicateWithAI={onDuplicateWithAI}
            onEditItem={onEditItem}
            onRunSingleItem={onRunSingleItem}
            onUpdateItemImages={onUpdateItemImages}
            onReorderQueue={onReorderQueue}
            onToggleSelect={state.handleToggleSelect}
            pendingStatus={QueueStatus.Pending}
          />
        )}
      </div>
    </div>
  );
};

export default QueuePanel;
