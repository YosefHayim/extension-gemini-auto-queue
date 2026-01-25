import React from "react";

interface SelectionBarProps {
  selectedCount: number;
  selectedPendingCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isDark?: boolean;
}

export const SelectionBar: React.FC<SelectionBarProps> = ({
  selectedCount,
  selectedPendingCount,
  onSelectAll,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-info/30 bg-info/10 px-3 py-2">
      <span className="text-xs font-semibold text-info">
        {selectedCount} selected
        {selectedPendingCount > 0 &&
          selectedPendingCount !== selectedCount &&
          ` (${selectedPendingCount} pending)`}
      </span>
      <div className="flex gap-2">
        <button
          onClick={onSelectAll}
          className="text-xs font-medium text-info transition-colors hover:text-info/80"
        >
          Select All Pending
        </button>
        <span className="text-border">|</span>
        <button
          onClick={onClearSelection}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
