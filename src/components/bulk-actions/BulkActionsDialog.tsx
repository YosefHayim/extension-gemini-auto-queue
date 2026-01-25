import React from "react";
import {
  Copy,
  FileUp,
  Pencil,
  RotateCcw,
  Trash2,
  Download,
  Zap,
  Image,
  ChevronRight,
} from "lucide-react";

import { DialogShell } from "./DialogShell";
import { buildResetFilter, readFilesAsBase64 } from "./handlers";
import { SubmitButton } from "./SubmitButton";
import { useBulkActionsState } from "./useBulkActionsState";

import type { BulkActionsDialogProps, BulkActionType } from "./types";

interface ActionItem {
  id: BulkActionType;
  icon: React.ReactNode;
  label: string;
  description?: string;
  badge?: React.ReactNode;
  isDanger?: boolean;
}

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
      console.warn("Failed to copy prompts:", err);
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

  // TODO: Implement action panel UI for each action type
  // TODO: Add form inputs for modify, reset, removeText actions
  // TODO: Add file picker UI for attach action
  // TODO: Add image preview for removeFiles action

  const queueActions: ActionItem[] = [
    {
      id: "attach",
      icon: <FileUp className="h-7 w-7" />,
      label: "Attach Files",
    },
    {
      id: "copy",
      icon: <Copy className="h-7 w-7" />,
      label: "Copy All Prompts",
    },
  ];

  const promptActions: ActionItem[] = [
    {
      id: "modify",
      icon: <Pencil className="h-7 w-7" />,
      label: "Modify Text",
    },
    {
      id: "removeText",
      icon: <Trash2 className="h-7 w-7" />,
      label: "Remove Text",
    },
  ];

  const aiActions: ActionItem[] = [
    {
      id: "ai",
      icon: <Zap className="h-7 w-7" />,
      label: "AI Optimize",
      badge: (
        <span className="ml-auto inline-flex items-center rounded-full bg-info px-2 py-0.5 text-xs font-medium text-info-foreground">
          PRO
        </span>
      ),
    },
  ];

  const mediaActions: ActionItem[] = [
    {
      id: "removeFiles",
      icon: <Image className="h-7 w-7" />,
      label: "Remove Images",
    },
    {
      id: "downloadChat",
      icon: <Download className="h-7 w-7" />,
      label: "Download Media",
    },
  ];

  const exportActions: ActionItem[] = [
    // TODO: Add export to CSV action
    // TODO: Add export to JSON action
  ];

  const dangerActions: ActionItem[] = [
    {
      id: "reset",
      icon: <RotateCcw className="h-7 w-7" />,
      label: "Reset Queue",
      isDanger: true,
    },
  ];

  const renderSection = (title: string, actions: ActionItem[], isDanger = false) => {
    if (actions.length === 0) return null;

    return (
      <div key={title} className="space-y-2">
        <h3
          className={`text-xs font-semibold uppercase tracking-wide ${
            isDanger ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {title}
        </h3>
        <div className="space-y-1">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                if (action.id === "copy") {
                  handleCopyAll();
                } else if (action.id !== null) {
                  handleActionSelect(action.id);
                }
              }}
              className={`group flex w-full items-center gap-3 rounded-sm px-2.5 py-2 transition-colors ${
                action.isDanger ? "hover:bg-destructive/10" : "hover:bg-muted"
              }`}
            >
              <div
                className={`flex-shrink-0 ${
                  action.isDanger ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {action.icon}
              </div>
              <div className="flex flex-1 items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    action.isDanger ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {action.label}
                </span>
                {action.badge}
              </div>
              <ChevronRight
                className={`h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100 ${
                  action.isDanger ? "text-destructive" : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <DialogShell isOpen={isOpen} isDark={isDark} pendingCount={pendingCount} onClose={handleClose}>
      <div className="flex flex-col">
        <div className="flex items-start justify-between border-b border-border px-4 py-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground">Bulk Actions</h2>
            <p className="text-xs text-muted-foreground">Apply to {pendingCount} selected items</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-sm p-1.5 transition-colors hover:bg-muted"
          >
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto bg-background p-3">
          {renderSection("Queue Management", queueActions)}
          {renderSection("Prompt Editing", promptActions)}
          {renderSection("AI Tools", aiActions)}
          {renderSection("Media", mediaActions)}
          {renderSection("Export", exportActions)}
          {renderSection("Danger Zone", dangerActions, true)}
        </div>

        {state.activeAction && (
          <div className="border-t border-border bg-muted px-4 py-4">
            {/* TODO: Render action-specific form based on activeAction */}
            <div className="mb-4 text-sm">
              {state.activeAction === "attach" && (
                <input
                  ref={state.fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              )}
            </div>
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
          </div>
        )}
      </div>
    </DialogShell>
  );
};
