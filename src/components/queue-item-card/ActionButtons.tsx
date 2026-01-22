import { Copy, Pencil, Play, RefreshCw, Trash2, Wand2 } from "lucide-react";
import React from "react";

interface ActionButtonsProps {
  itemId: string;
  isDark: boolean;
  isPending: boolean;
  isFailed: boolean;
  isEditing: boolean;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDuplicateWithAI: (id: string) => void;
  onEdit?: (id: string, newPrompt: string) => void;
  onRunSingle?: (id: string) => void;
  originalPrompt: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  itemId,
  isDark,
  isPending,
  isFailed,
  isEditing,
  onRemove,
  onRetry,
  onDuplicate,
  onDuplicateWithAI,
  onEdit,
  onRunSingle,
  originalPrompt,
}) => {
  return (
    <div
      className={`flex shrink-0 items-center gap-0.5 transition-opacity duration-150 ${isEditing ? "hidden" : ""} ${isDark ? "opacity-0 group-hover:opacity-100" : "opacity-0 group-hover:opacity-100"}`}
    >
      {(isPending || isFailed) && onRunSingle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRunSingle(itemId);
          }}
          title="Run this prompt now"
          className={`flex min-h-[28px] min-w-[28px] items-center justify-center rounded transition-colors ${
            isDark
              ? "text-emerald-500 hover:bg-emerald-500/15 hover:text-emerald-400"
              : "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
          }`}
        >
          <Play size={14} fill="currentColor" />
        </button>
      )}

      {isPending && onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(itemId, originalPrompt);
          }}
          title="Edit prompt"
          className={`flex min-h-[28px] min-w-[28px] items-center justify-center rounded transition-colors ${
            isDark
              ? "text-slate-500 hover:bg-slate-700 hover:text-slate-300"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          }`}
        >
          <Pencil size={14} />
        </button>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate(itemId);
        }}
        title="Duplicate this prompt"
        className={`flex min-h-[28px] min-w-[28px] items-center justify-center rounded transition-colors ${
          isDark
            ? "text-slate-500 hover:bg-slate-700 hover:text-slate-300"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        }`}
      >
        <Copy size={14} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDuplicateWithAI(itemId);
        }}
        title="Duplicate and enhance with AI"
        className={`flex min-h-[28px] min-w-[28px] items-center justify-center rounded transition-colors ${
          isDark
            ? "text-violet-400 hover:bg-violet-500/15 hover:text-violet-300"
            : "text-violet-400 hover:bg-violet-50 hover:text-violet-500"
        }`}
      >
        <Wand2 size={14} />
      </button>

      {isFailed && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRetry(itemId);
          }}
          title="Retry this prompt"
          className={`flex min-h-[28px] min-w-[28px] items-center justify-center rounded transition-colors ${
            isDark
              ? "text-blue-400 hover:bg-blue-500/15 hover:text-blue-300"
              : "text-blue-400 hover:bg-blue-50 hover:text-blue-500"
          }`}
        >
          <RefreshCw size={14} />
        </button>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(itemId);
        }}
        title="Remove from queue"
        className={`flex min-h-[28px] min-w-[28px] items-center justify-center rounded transition-colors ${
          isDark
            ? "text-red-400/70 hover:bg-red-500/15 hover:text-red-400"
            : "text-red-400 hover:bg-red-50 hover:text-red-500"
        }`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
