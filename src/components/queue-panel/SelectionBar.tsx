import React from "react";

interface SelectionBarProps {
  selectedCount: number;
  selectedPendingCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isDark: boolean;
}

export const SelectionBar: React.FC<SelectionBarProps> = ({
  selectedCount,
  selectedPendingCount,
  onSelectAll,
  onClearSelection,
  isDark,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${
        isDark ? "border-indigo-500/30 bg-indigo-500/10" : "border-indigo-300 bg-indigo-50"
      }`}
    >
      <span className={`text-xs font-semibold ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
        {selectedCount} selected
        {selectedPendingCount > 0 &&
          selectedPendingCount !== selectedCount &&
          ` (${selectedPendingCount} pending)`}
      </span>
      <div className="flex gap-2">
        <button
          onClick={onSelectAll}
          className={`text-xs font-medium transition-colors ${
            isDark
              ? "text-indigo-400 hover:text-indigo-300"
              : "text-indigo-600 hover:text-indigo-700"
          }`}
        >
          Select All Pending
        </button>
        <span className={isDark ? "text-slate-600" : "text-slate-300"}>|</span>
        <button
          onClick={onClearSelection}
          className={`text-xs font-medium transition-colors ${
            isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-600"
          }`}
        >
          Clear
        </button>
      </div>
    </div>
  );
};
