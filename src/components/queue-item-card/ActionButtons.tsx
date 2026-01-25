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
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
            isDark
              ? "text-emerald-400 hover:bg-emerald-900/50"
              : "text-emerald-600 hover:bg-emerald-100"
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
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
            isDark ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100"
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
        className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
          isDark ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100"
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
        className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-blue-500 transition-colors hover:bg-blue-200"
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
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
            isDark ? "text-blue-400 hover:bg-blue-900/50" : "text-blue-600 hover:bg-blue-100"
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
        className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
          isDark ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
