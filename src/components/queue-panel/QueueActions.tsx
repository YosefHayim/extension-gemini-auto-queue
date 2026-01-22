import { Download, Layers, Sparkles, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import type { GeminiMode, GeminiTool, QueueItem, QueueStatus } from "@/types";

import { ClearMenu } from "./ClearMenu";

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
          className={`flex min-h-[40px] items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
            isDark
              ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/20"
              : "border-indigo-300 bg-indigo-50 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-100"
          }`}
        >
          <Layers size={14} />
          <span>Bulk Actions</span>
        </button>
      )}
      {onClearCompleted && completedCount > 0 && (
        <button
          onClick={onClearCompleted}
          title="Clear completed items"
          className={`flex min-h-[40px] items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
            isDark
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/20"
              : "border-emerald-300 bg-emerald-50 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-100"
          }`}
        >
          <Sparkles size={14} />
          <span>Clear Done</span>
        </button>
      )}
      {onOpenExport && queue.length > 0 && (
        <button
          onClick={onOpenExport}
          title="Export queue to file"
          className={`flex min-h-[40px] items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
            isDark
              ? "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/20"
              : "border-blue-300 bg-blue-50 text-blue-600 hover:border-blue-400 hover:bg-blue-100"
          }`}
        >
          <Download size={14} />
          <span>Export</span>
        </button>
      )}
      <button
        onClick={() => setShowClearMenu(!showClearMenu)}
        title="Clear queue items"
        className={`flex min-h-[40px] items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
          isDark
            ? "border-red-500/30 bg-red-500/10 text-red-400 hover:border-red-500/50 hover:bg-red-500/20"
            : "border-red-300 bg-red-50 text-red-600 hover:border-red-400 hover:bg-red-100"
        }`}
      >
        <Trash2 size={14} />
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
