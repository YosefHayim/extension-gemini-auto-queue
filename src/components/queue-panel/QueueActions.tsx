import { Download, Layers, Sparkles, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { ClearMenu } from "./ClearMenu";

import type { GeminiMode, GeminiTool, QueueItem, QueueStatus } from "@/types";

interface QueueActionsProps {
  queue: QueueItem[];
  pendingCount: number;
  completedCount: number;
  isDark: boolean;
  onShowBulkActions: () => void;
  onClearCompleted?: () => void;
  onOpenExport?: () => void;
  onClearAll?: () => void;
  onClearByFilter?: (filter: {
    status?: QueueStatus;
    tool?: GeminiTool;
    mode?: GeminiMode;
  }) => void;
  hasBulkActions: boolean;
}

export const QueueActions: React.FC<QueueActionsProps> = ({
  queue,
  pendingCount,
  completedCount,
  isDark,
  onShowBulkActions,
  onClearCompleted,
  onOpenExport,
  onClearAll,
  onClearByFilter,
  hasBulkActions,
}) => {
  const [showClearMenu, setShowClearMenu] = useState(false);
  const clearMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showClearMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (clearMenuRef.current && !clearMenuRef.current.contains(event.target as Node)) {
        setShowClearMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showClearMenu]);

  const showActions =
    onClearAll || onClearByFilter || hasBulkActions || onClearCompleted || onOpenExport;

  if (!showActions) return null;

  return (
    <div ref={clearMenuRef} className="relative flex flex-wrap items-center justify-end gap-2">
      {pendingCount > 0 && hasBulkActions && (
        <button
          onClick={onShowBulkActions}
          title="Bulk actions for pending prompts"
          className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/80"
        >
          <Layers size={16} />
          <span>Bulk Actions</span>
        </button>
      )}
      {onClearCompleted && completedCount > 0 && (
        <button
          onClick={onClearCompleted}
          title="Clear completed items"
          className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-600 transition-all hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-900"
        >
          <Sparkles size={16} />
          <span>Clear Done</span>
        </button>
      )}
      {onOpenExport && queue.length > 0 && (
        <button
          onClick={onOpenExport}
          title="Export queue to file"
          className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/80"
        >
          <Download size={16} />
          <span>Export</span>
        </button>
      )}
      <button
        onClick={() => setShowClearMenu(!showClearMenu)}
        title="Clear queue items"
        className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/80"
      >
        <Trash2 size={16} />
        <span>Clear</span>
      </button>

      <ClearMenu
        isOpen={showClearMenu}
        queue={queue}
        onClearAll={onClearAll}
        onClearByFilter={onClearByFilter}
        onClose={() => setShowClearMenu(false)}
        isDark={isDark}
      />
    </div>
  );
};
