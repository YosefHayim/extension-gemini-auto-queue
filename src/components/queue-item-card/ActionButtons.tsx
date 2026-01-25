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
      className={`flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${isEditing ? "hidden" : ""}`}
    >
      {(isPending || isFailed) && onRunSingle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRunSingle(itemId);
          }}
          title="Run this prompt now"
          className="flex h-7 w-7 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10"
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
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
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
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
      >
        <Copy size={14} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDuplicateWithAI(itemId);
        }}
        title="Duplicate and enhance with AI"
        className="flex h-7 w-7 items-center justify-center rounded-md bg-info/10 text-info transition-colors hover:bg-info/20"
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
          className="flex h-7 w-7 items-center justify-center rounded-md text-info transition-colors hover:bg-info/10"
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
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
