import React from "react";
import {
  ArrowUpToLine,
  ChevronRight,
  ClipboardCopy,
  Copy,
  Cpu,
  FileSpreadsheet,
  ImageMinus,
  ImagePlus,
  Languages,
  MinusCircle,
  Palette,
  RefreshCw,
  Replace,
  RotateCcw,
  Shuffle,
  Sparkles,
  TextCursorInput,
  Trash2,
  Wand2,
  X,
  BookmarkPlus,
} from "lucide-react";

import { DialogShell } from "./DialogShell";
import { buildResetFilter, readFilesAsBase64 } from "./handlers";
import { useBulkActionsState } from "./useBulkActionsState";

import type { BulkActionsDialogProps, BulkActionType } from "./types";

// Design tokens from .pen file
const DESIGN = {
  colors: {
    foreground: "#0D0D0D",
    mutedForeground: "#71717A",
    muted: "#F4F4F5",
    border: "#E4E4E7",
    background: "#FFFFFF",
    card: "#FFFFFF",
    // AI Tools special colors
    aiBlue: "#DBEAFE",
    aiBlueText: "#3B82F6",
    aiPurple: "#F3E8FF",
    aiGreen: "#D1FAE5",
    // Danger Zone
    dangerRed: "#DC2626",
    dangerBg: "#FEF2F2",
    dangerIconBg: "#FEE2E2",
  },
  spacing: {
    actionPadding: "py-2 px-2.5", // [8, 10]
    iconTextGap: "gap-2.5", // 10px
    sectionGap: "gap-1.5", // 6px
    actionGap: "gap-0.5", // 2px
    contentPadding: "p-3", // 12px
    contentGap: "gap-4", // 16px between sections
    headerPadding: "p-4", // 16px
  },
  typography: {
    dialogTitle: "text-base font-semibold", // 16px, 600
    dialogSubtitle: "text-[13px] font-normal", // 13px, normal
    sectionHeader: "text-[11px] font-semibold uppercase tracking-wide", // 11px, 600
    actionLabel: "text-[13px] font-medium", // 13px, 500
  },
  sizes: {
    iconContainer: "h-7 w-7", // 28x28
    icon: 14, // 14x14
    chevron: 14, // 14x14
    closeIcon: 16, // 16x16
  },
  radius: {
    sm: "rounded", // 4px
    md: "rounded-md", // 6px
    lg: "rounded-lg", // 8px
  },
} as const;

interface ActionItem {
  id:
    | BulkActionType
    | "shuffle"
    | "moveTop"
    | "retryFailed"
    | "prefix"
    | "findReplace"
    | "negative"
    | "stylePreset"
    | "variations"
    | "translate"
    | "attachImages"
    | "removeImages"
    | "changeTool"
    | "changeModel"
    | "exportCsv"
    | "copyClipboard"
    | "saveTemplates"
    | "delete";
  icon: React.ElementType;
  label: string;
  hasChevron?: boolean;
  iconBg?: string;
  iconColor?: string;
  badge?: { text: string; bg: string; color: string };
}

interface ActionSection {
  title: string;
  titleColor?: string;
  actions: ActionItem[];
  isDanger?: boolean;
}

// Icon container component matching design exactly
const ActionIconContainer: React.FC<{
  icon: React.ElementType;
  bg?: string;
  color?: string;
  isDanger?: boolean;
}> = ({ icon: Icon, bg, color, isDanger }) => (
  <div
    className={`${DESIGN.sizes.iconContainer} ${DESIGN.radius.sm} flex flex-shrink-0 items-center justify-center`}
    style={{
      backgroundColor: isDanger ? DESIGN.colors.dangerIconBg : (bg ?? DESIGN.colors.muted),
    }}
  >
    <Icon
      size={DESIGN.sizes.icon}
      style={{
        color: isDanger ? DESIGN.colors.dangerRed : (color ?? DESIGN.colors.mutedForeground),
      }}
    />
  </div>
);

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
  onBulkChangeTool: _onBulkChangeTool,
  onBulkChangeMode: _onBulkChangeMode,
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

    const actionMap: Record<string, BulkActionType> = {
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
      changeTool: null,
      changeModel: null,
      exportCsv: null,
      saveTemplates: null,
      delete: "reset",
    };

    const mappedAction = actionMap[actionId];
    if (mappedAction) {
      state.setActiveAction(mappedAction);
    }
  };

  // Define sections matching the design exactly
  const sections: ActionSection[] = [
    {
      title: "Queue Management",
      actions: [
        { id: "shuffle", icon: Shuffle, label: "Shuffle Order" },
        { id: "moveTop", icon: ArrowUpToLine, label: "Move to Top" },
        { id: "retryFailed", icon: RotateCcw, label: "Retry Failed" },
        { id: "reset", icon: RefreshCw, label: "Reset Status" },
      ],
    },
    {
      title: "Prompt Editing",
      actions: [
        { id: "prefix", icon: TextCursorInput, label: "Add Prefix/Suffix", hasChevron: true },
        { id: "findReplace", icon: Replace, label: "Find & Replace", hasChevron: true },
        { id: "negative", icon: MinusCircle, label: "Add Negative Prompts", hasChevron: true },
        { id: "stylePreset", icon: Palette, label: "Apply Style Preset", hasChevron: true },
      ],
    },
    {
      title: "AI Tools",
      actions: [
        {
          id: "ai",
          icon: Sparkles,
          label: "AI Optimize",
          iconBg: DESIGN.colors.aiBlue,
          badge: { text: "Pro", bg: DESIGN.colors.aiBlue, color: DESIGN.colors.aiBlueText },
        },
        {
          id: "variations",
          icon: Copy,
          label: "Clone with Variations",
          iconBg: DESIGN.colors.aiPurple,
          hasChevron: true,
        },
        {
          id: "translate",
          icon: Languages,
          label: "Translate Prompts",
          iconBg: DESIGN.colors.aiGreen,
          hasChevron: true,
        },
      ],
    },
    {
      title: "Media",
      actions: [
        { id: "attachImages", icon: ImagePlus, label: "Attach Images to All", hasChevron: true },
        { id: "removeImages", icon: ImageMinus, label: "Remove All Images" },
        { id: "changeTool", icon: Wand2, label: "Change Tool", hasChevron: true },
        {
          id: "changeModel",
          icon: Cpu,
          label: "Change Model",
          iconBg: DESIGN.colors.aiPurple,
          hasChevron: true,
        },
      ],
    },
    {
      title: "Export",
      actions: [
        { id: "exportCsv", icon: FileSpreadsheet, label: "Export to CSV", hasChevron: true },
        { id: "copyClipboard", icon: ClipboardCopy, label: "Copy to Clipboard" },
        { id: "saveTemplates", icon: BookmarkPlus, label: "Save as Templates", hasChevron: true },
      ],
    },
    {
      title: "Danger Zone",
      titleColor: DESIGN.colors.dangerRed,
      isDanger: true,
      actions: [{ id: "delete", icon: Trash2, label: "Delete Selected" }],
    },
  ];

  const renderAction = (action: ActionItem, isDanger = false) => (
    <button
      key={action.id}
      onClick={() => action.id && handleActionClick(action.id)}
      className={`group flex w-full items-center ${DESIGN.spacing.actionPadding} ${DESIGN.spacing.iconTextGap} ${DESIGN.radius.sm} transition-colors hover:bg-black/5`}
      style={isDanger ? { backgroundColor: DESIGN.colors.dangerBg } : undefined}
    >
      <ActionIconContainer
        icon={action.icon}
        bg={action.iconBg}
        color={action.iconColor}
        isDanger={isDanger}
      />
      <span
        className={DESIGN.typography.actionLabel}
        style={{ color: isDanger ? DESIGN.colors.dangerRed : DESIGN.colors.foreground }}
      >
        {action.label}
      </span>
      {action.badge && (
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ backgroundColor: action.badge.bg, color: action.badge.color }}
        >
          {action.badge.text}
        </span>
      )}
      {action.hasChevron && !action.badge && (
        <ChevronRight
          size={DESIGN.sizes.chevron}
          className="ml-auto"
          style={{ color: DESIGN.colors.mutedForeground }}
        />
      )}
    </button>
  );

  const renderSection = (section: ActionSection) => (
    <div
      key={section.title}
      className={DESIGN.spacing.sectionGap}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <span
        className={DESIGN.typography.sectionHeader}
        style={{ color: section.titleColor ?? DESIGN.colors.mutedForeground }}
      >
        {section.title}
      </span>
      <div
        className={DESIGN.spacing.actionGap}
        style={{ display: "flex", flexDirection: "column" }}
      >
        {section.actions.map((action) => renderAction(action, section.isDanger))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <DialogShell isOpen={isOpen} isDark={isDark} onClose={handleClose}>
      <div className="flex flex-col" style={{ backgroundColor: DESIGN.colors.card }}>
        <div
          className={`flex items-center justify-between ${DESIGN.spacing.headerPadding}`}
          style={{ borderBottom: `1px solid ${DESIGN.colors.border}` }}
        >
          <div className="flex flex-col gap-0.5">
            <h2
              className={DESIGN.typography.dialogTitle}
              style={{ color: DESIGN.colors.foreground }}
            >
              Bulk Actions
            </h2>
            <p
              className={DESIGN.typography.dialogSubtitle}
              style={{ color: DESIGN.colors.mutedForeground }}
            >
              Apply to {pendingCount} selected items
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`${DESIGN.radius.sm} p-1.5 transition-colors hover:bg-black/5`}
            style={{ backgroundColor: DESIGN.colors.muted }}
          >
            <X size={DESIGN.sizes.closeIcon} style={{ color: DESIGN.colors.mutedForeground }} />
          </button>
        </div>

        <div
          className={`max-h-[300px] overflow-y-auto ${DESIGN.spacing.contentPadding} ${DESIGN.spacing.contentGap}`}
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: DESIGN.colors.background,
          }}
        >
          {sections.map(renderSection)}
        </div>

        {state.activeAction && (
          <div
            className="border-t p-4"
            style={{ borderColor: DESIGN.colors.border, backgroundColor: DESIGN.colors.muted }}
          >
            {state.activeAction === "attach" && (
              <div className="space-y-3">
                <input
                  ref={state.fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => state.fileInputRef.current?.click()}
                  className="w-full rounded-md border-2 border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 hover:border-gray-400"
                >
                  Click to select images
                </button>
                {state.selectedFiles.length > 0 && (
                  <p className="text-sm text-gray-600">
                    {state.selectedFiles.length} files selected
                  </p>
                )}
              </div>
            )}
            {state.activeAction === "ai" && (
              <div className="space-y-3">
                <textarea
                  value={state.aiInstructions}
                  onChange={(e) => state.setAiInstructions(e.target.value)}
                  placeholder="Enter optimization instructions..."
                  className="w-full rounded-md border p-2 text-sm"
                  rows={3}
                />
              </div>
            )}
            {state.activeAction === "modify" && (
              <div className="space-y-3">
                <input
                  value={state.modifyText}
                  onChange={(e) => state.setModifyText(e.target.value)}
                  placeholder="Text to add..."
                  className="w-full rounded-md border p-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => state.setModifyPosition("prepend")}
                    className={`flex-1 rounded-md border p-2 text-sm ${state.modifyPosition === "prepend" ? "border-blue-500 bg-blue-50" : ""}`}
                  >
                    Prepend
                  </button>
                  <button
                    onClick={() => state.setModifyPosition("append")}
                    className={`flex-1 rounded-md border p-2 text-sm ${state.modifyPosition === "append" ? "border-blue-500 bg-blue-50" : ""}`}
                  >
                    Append
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={state.isProcessing}
              className="mt-3 w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {state.isProcessing ? "Processing..." : "Apply"}
            </button>
            <button
              onClick={() => state.setActiveAction(null)}
              className="mt-2 w-full rounded-md border py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </DialogShell>
  );
};
