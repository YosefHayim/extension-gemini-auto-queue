import React, { useState } from "react";

import { ActionPanelContent } from "@/extension/components/bulk-actions/ActionPanelContent";
import { getActionSections } from "@/extension/components/bulk-actions/actionSectionConfigs";
import { ActionSectionGroup } from "@/extension/components/bulk-actions/ActionSectionGroup";
import { DESIGN } from "@/extension/components/bulk-actions/bulkActionsDesign";
import { DialogHeader } from "@/extension/components/bulk-actions/DialogHeader";
import { DialogShell } from "@/extension/components/bulk-actions/DialogShell";
import { buildResetFilter, readFilesAsBase64 } from "@/extension/components/bulk-actions/handlers";
import { ModelSelectDialog } from "@/extension/components/bulk-actions/ModelSelectDialog";
import { useBulkActionsState } from "@/extension/hooks/useBulkActionsState";

import type { GeminiMode } from "@/backend/types";
import type {
  BulkActionsDialogProps,
  BulkActionType,
} from "@/extension/components/bulk-actions/types";

const ACTION_ID_TO_TYPE: Record<string, BulkActionType> = {
  reset: "reset",
  prefix: "modify",
  findReplace: "modify",
  negative: "modify",
  stylePreset: null,
  ai: "ai",
  variations: null,
  translate: null,
  attachImages: "attach",
  attach: "attach",
  removeImages: "removeFiles",
  removeFiles: "removeFiles",
  changeTool: "changeTool",
  changeModel: "changeMode",
  exportCsv: null,
  saveTemplates: null,
  deleteByPattern: "deleteByPattern",
};

export const BulkActionsDialog: React.FC<BulkActionsDialogProps> = ({
  isOpen,
  onClose,
  isDark,
  pendingCount,
  completedCount,
  failedCount,
  pendingItems,
  onBulkAttach,
  onBulkAIOptimize,
  onBulkModify,
  onBulkReset,
  onCopyAllPrompts,
  onBulkRemoveText,
  onBulkRemoveFiles,
  onScanChatMedia,
  onDownloadChatMedia,
  onBulkShuffle,
  onBulkMoveToTop,
  onBulkRetryFailed,
  onBulkChangeTool,
  onBulkChangeMode,
  onBulkDelete,
  onBulkDeleteByPattern,
}) => {
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);

  const state = useBulkActionsState({
    pendingItems,
    completedCount,
    failedCount,
    onScanChatMedia,
  });

  const sections = getActionSections();

  const handleModeApply = (mode: GeminiMode) => {
    if (onBulkChangeMode) {
      onBulkChangeMode(mode);
    }
    handleClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    e.target.value = "";
    const validFiles = await readFilesAsBase64(files);
    if (validFiles.length > 0) {
      state.setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleClose = () => {
    state.resetState();
    onClose();
  };

  const handleSubmit = async () => {
    state.setIsProcessing(true);
    try {
      const { activeAction } = state;
      if (activeAction === "attach" && state.selectedFiles.length > 0) {
        onBulkAttach(state.selectedFiles.map((f) => f.data));
      } else if (activeAction === "ai" && state.aiInstructions.trim()) {
        await onBulkAIOptimize(state.aiInstructions.trim());
      } else if (activeAction === "modify" && state.modifyText.trim()) {
        onBulkModify(state.modifyText.trim(), state.modifyPosition);
      } else if (activeAction === "reset") {
        onBulkReset(
          buildResetFilter(
            state.resetFilterType,
            state.resetTextMatch,
            state.resetTool,
            state.resetMode,
            state.resetStatus
          )
        );
      } else if (activeAction === "removeText" && state.textToRemove.trim()) {
        onBulkRemoveText(state.textToRemove.trim());
      } else if (activeAction === "removeFiles" && state.selectedImagesForRemoval.length > 0) {
        onBulkRemoveFiles(state.selectedImagesForRemoval);
      } else if (activeAction === "downloadChat" && onDownloadChatMedia) {
        await onDownloadChatMedia(state.downloadMethod);
      } else if (activeAction === "changeTool" && state.selectedTool && onBulkChangeTool) {
        onBulkChangeTool(state.selectedTool);
      } else if (activeAction === "changeMode" && state.selectedMode && onBulkChangeMode) {
        onBulkChangeMode(state.selectedMode);
      } else if (
        activeAction === "deleteByPattern" &&
        state.deletePatternText.trim() &&
        onBulkDeleteByPattern
      ) {
        onBulkDeleteByPattern(state.deletePatternText.trim());
      }
      handleClose();
    } finally {
      state.setIsProcessing(false);
    }
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(onCopyAllPrompts());
      state.setCopySuccess(true);
      setTimeout(() => {
        state.setCopySuccess(false);
        handleClose();
      }, 1500);
    } catch (err) {
      console.warn("Failed to copy prompts:", err);
    }
  };

  const handleActionClick = (actionId: string) => {
    if (actionId === "copyClipboard" || actionId === "copy") {
      handleCopyAll();
      return;
    }

    if (actionId === "shuffle" && onBulkShuffle) {
      onBulkShuffle();
      return;
    }

    if (actionId === "moveTop" && onBulkMoveToTop) {
      onBulkMoveToTop();
      return;
    }

    if (actionId === "retryFailed" && onBulkRetryFailed) {
      onBulkRetryFailed();
      return;
    }

    if (actionId === "delete" && onBulkDelete) {
      onBulkDelete();
      handleClose();
      return;
    }

    // Open separate dialog for model selection
    if (actionId === "changeModel") {
      setIsModelDialogOpen(true);
      return;
    }

    const mappedAction = ACTION_ID_TO_TYPE[actionId];
    if (mappedAction) {
      state.setActiveAction(mappedAction);
    }
  };

  if (!isOpen) return null;

  return (
    <DialogShell isOpen={isOpen} isDark={isDark} onClose={handleClose}>
      <div className="flex flex-col" style={{ backgroundColor: DESIGN.colors.card }}>
        <DialogHeader pendingCount={pendingCount} onClose={handleClose} />

        <div
          className={`max-h-[300px] overflow-y-auto ${DESIGN.spacing.contentPadding} ${DESIGN.spacing.contentGap}`}
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: DESIGN.colors.background,
          }}
        >
          {sections.map((section) => (
            <ActionSectionGroup
              key={section.title}
              section={section}
              onActionClick={handleActionClick}
            />
          ))}
        </div>

        <ActionPanelContent
          activeAction={state.activeAction}
          fileInputRef={state.fileInputRef}
          selectedFiles={state.selectedFiles}
          aiInstructions={state.aiInstructions}
          modifyText={state.modifyText}
          modifyPosition={state.modifyPosition}
          selectedTool={state.selectedTool}
          deletePatternText={state.deletePatternText}
          deletePatternMatchCount={state.deletePatternMatchCount}
          isProcessing={state.isProcessing}
          onFileUpload={handleFileUpload}
          onFileInputClick={() => state.fileInputRef.current?.click()}
          setAiInstructions={state.setAiInstructions}
          setModifyText={state.setModifyText}
          setModifyPosition={state.setModifyPosition}
          setSelectedTool={state.setSelectedTool}
          setDeletePatternText={state.setDeletePatternText}
          onSubmit={handleSubmit}
          onCancel={() => state.setActiveAction(null)}
        />
      </div>

      <ModelSelectDialog
        isOpen={isModelDialogOpen}
        onClose={() => setIsModelDialogOpen(false)}
        onApply={handleModeApply}
        selectedCount={pendingCount}
      />
    </DialogShell>
  );
};
