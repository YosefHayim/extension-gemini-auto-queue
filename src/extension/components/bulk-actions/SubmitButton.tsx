import React from "react";

import type { BulkActionType, ChatMediaCounts, SelectedFile, ResetFilter } from "@/extension/components/bulk-actions/types";

interface SubmitButtonProps {
  isDark: boolean;
  activeAction: BulkActionType;
  isProcessing: boolean;
  selectedFiles: SelectedFile[];
  aiInstructions: string;
  modifyText: string;
  resetFilterType: ResetFilter["type"];
  resetTextMatch: string;
  resetTool: unknown;
  resetMode: unknown;
  resetStatus: unknown;
  textToRemove: string;
  selectedImagesForRemoval: number[];
  chatMediaCounts: ChatMediaCounts | null;
  pendingCount: number;
  resettableCount: number;
  textMatchCount: number;
  onSubmit: () => void;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isDark: _isDark,
  activeAction,
  isProcessing,
  selectedFiles,
  aiInstructions,
  modifyText,
  resetFilterType,
  resetTextMatch,
  resetTool,
  resetMode,
  resetStatus,
  textToRemove,
  selectedImagesForRemoval,
  chatMediaCounts,
  pendingCount,
  resettableCount,
  textMatchCount,
  onSubmit,
}) => {
  const isDisabled =
    isProcessing ||
    (activeAction === "attach" && selectedFiles.length === 0) ||
    (activeAction === "ai" && !aiInstructions.trim()) ||
    (activeAction === "modify" && !modifyText.trim()) ||
    (activeAction === "reset" && resetFilterType === "text" && !resetTextMatch.trim()) ||
    (activeAction === "reset" && resetFilterType === "tool" && !resetTool) ||
    (activeAction === "reset" && resetFilterType === "mode" && !resetMode) ||
    (activeAction === "reset" && resetFilterType === "status" && !resetStatus) ||
    (activeAction === "removeText" && !textToRemove.trim()) ||
    (activeAction === "removeFiles" && selectedImagesForRemoval.length === 0) ||
    (activeAction === "downloadChat" && (!chatMediaCounts || chatMediaCounts.total === 0));

  const getButtonColorClass = () => {
    switch (activeAction) {
      case "ai":
        return "bg-violet-600 hover:bg-violet-500";
      case "attach":
        return "bg-indigo-600 hover:bg-indigo-500";
      case "reset":
        return "bg-amber-600 hover:bg-amber-500";
      case "removeText":
      case "removeFiles":
        return "bg-rose-600 hover:bg-rose-500";
      case "downloadChat":
        return "bg-blue-600 hover:bg-blue-500";
      default:
        return "bg-zinc-800 hover:bg-zinc-700";
    }
  };

  const getButtonLabel = () => {
    if (isProcessing) return "Processing...";

    switch (activeAction) {
      case "attach":
        return `Attach to ${pendingCount} Prompts`;
      case "ai":
        return `Optimize ${pendingCount} Prompts`;
      case "reset":
        return `Reset ${resetFilterType === "all" ? resettableCount : ""} Prompts`;
      case "removeText":
        return `Remove Text from ${textMatchCount} Prompts`;
      case "removeFiles":
        return `Remove ${selectedImagesForRemoval.length} Image${selectedImagesForRemoval.length !== 1 ? "s" : ""}`;
      case "downloadChat":
        return `Download ${chatMediaCounts?.total ?? 0} Media`;
      default:
        return `Modify ${pendingCount} Prompts`;
    }
  };

  return (
    <div className="border-t border-border p-4">
      <button
        onClick={onSubmit}
        disabled={isDisabled}
        className={`w-full rounded-md px-4 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-50 ${getButtonColorClass()}`}
      >
        {getButtonLabel()}
      </button>
    </div>
  );
};
