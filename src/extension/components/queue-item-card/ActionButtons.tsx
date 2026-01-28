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
  onEdit?: () => void;
  onRunSingle?: (id: string) => void;
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
}) => {
  return (
    <div className={`flex shrink-0 items-center gap-1 ${isEditing ? "hidden" : ""}`}>
      {(isPending || isFailed) && onRunSingle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRunSingle(itemId);
          }}
          title="Run this prompt now"
          className="flex items-center justify-center rounded p-1 text-primary transition-colors hover:bg-primary/10"
        >
          <Play size={14} fill="currentColor" />
        </button>
      )}

      {isPending && onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title="Edit prompt"
          className="flex items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-muted"
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
        className="flex items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-muted"
      >
        <Copy size={14} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDuplicateWithAI(itemId);
        }}
        title="Duplicate and enhance with AI"
        className="flex items-center justify-center rounded bg-[#DBEAFE] p-1 text-[#3B82F6] transition-colors hover:bg-[#DBEAFE]/80"
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
          className="flex items-center justify-center rounded p-1 text-info transition-colors hover:bg-info/10"
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
        className="flex items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-muted"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
