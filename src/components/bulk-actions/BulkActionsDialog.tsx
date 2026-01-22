import React from "react";

import { DialogShell } from "./DialogShell";
import { buildResetFilter, readFilesAsBase64 } from "./handlers";
import { PanelRenderer } from "./PanelRenderer";
import { SubmitButton } from "./SubmitButton";
import { useBulkActionsState } from "./useBulkActionsState";

import type { BulkActionsDialogProps, BulkActionType } from "./types";

export const BulkActionsDialog: React.FC<BulkActionsDialogProps> = ({
  isOpen,
  onClose,
  isDark,
  hasApiKey,
  pendingCount,
  totalCount,
  completedCount,
  failedCount,
  pendingItems,
  onBulkAttach,
  onBulkAIOptimize,
  onOpenAIOptimization,
  onBulkModify,
  onBulkReset,
  onCopyAllPrompts,
  onBulkRemoveText,
  onBulkRemoveFiles,
  onScanChatMedia,
  onDownloadChatMedia,
}) => {
  const state = useBulkActionsState({
    pendingItems,
    completedCount,
    failedCount,
    onScanChatMedia,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
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
      console.error("Failed to copy prompts:", err);
    }
  };

  const handleActionSelect = (type: Exclude<BulkActionType, null>) => {
    if (type === "ai" && onOpenAIOptimization) {
      handleClose();
      onOpenAIOptimization();
    } else {
      state.setActiveAction(type);
    }
  };

  return (
    <DialogShell isOpen={isOpen} isDark={isDark} pendingCount={pendingCount} onClose={handleClose}>
      <div className="p-4">
        <PanelRenderer
          activeAction={state.activeAction}
          isDark={isDark}
          hasApiKey={hasApiKey}
          pendingCount={pendingCount}
          totalCount={totalCount}
          pendingItems={pendingItems}
          resettableCount={state.resettableCount}
          allUniqueImages={state.allUniqueImages}
          chatMediaCounts={state.chatMediaCounts}
          copySuccess={state.copySuccess}
          onDownloadChatMediaAvailable={!!onDownloadChatMedia}
          selectedFiles={state.selectedFiles}
          setSelectedFiles={state.setSelectedFiles}
          fileInputRef={state.fileInputRef}
          onFileUpload={handleFileUpload}
          aiInstructions={state.aiInstructions}
          setAiInstructions={state.setAiInstructions}
          modifyText={state.modifyText}
          setModifyText={state.setModifyText}
          modifyPosition={state.modifyPosition}
          setModifyPosition={state.setModifyPosition}
          resetFilterType={state.resetFilterType}
          setResetFilterType={state.setResetFilterType}
          resetTextMatch={state.resetTextMatch}
          setResetTextMatch={state.setResetTextMatch}
          resetTool={state.resetTool}
          setResetTool={state.setResetTool}
          resetMode={state.resetMode}
          setResetMode={state.setResetMode}
          resetStatus={state.resetStatus}
          setResetStatus={state.setResetStatus}
          textToRemove={state.textToRemove}
          setTextToRemove={state.setTextToRemove}
          selectedImagesForRemoval={state.selectedImagesForRemoval}
          setSelectedImagesForRemoval={state.setSelectedImagesForRemoval}
          isScanning={state.isScanning}
          downloadMethod={state.downloadMethod}
          setDownloadMethod={state.setDownloadMethod}
          onBack={() => state.setActiveAction(null)}
          onActionSelect={handleActionSelect}
          onCopyAll={handleCopyAll}
        />
      </div>
      {state.activeAction && (
        <SubmitButton
          isDark={isDark}
          activeAction={state.activeAction}
          isProcessing={state.isProcessing}
          selectedFiles={state.selectedFiles}
          aiInstructions={state.aiInstructions}
          modifyText={state.modifyText}
          resetFilterType={state.resetFilterType}
          resetTextMatch={state.resetTextMatch}
          resetTool={state.resetTool}
          resetMode={state.resetMode}
          resetStatus={state.resetStatus}
          textToRemove={state.textToRemove}
          selectedImagesForRemoval={state.selectedImagesForRemoval}
          chatMediaCounts={state.chatMediaCounts}
          pendingCount={pendingCount}
          resettableCount={state.resettableCount}
          textMatchCount={state.textMatchCount}
          onSubmit={handleSubmit}
        />
      )}
    </DialogShell>
  );
};
