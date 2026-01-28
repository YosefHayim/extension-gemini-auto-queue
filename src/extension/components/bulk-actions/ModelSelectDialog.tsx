import { Zap, X } from "lucide-react";
import React, { useState } from "react";

import { GEMINI_MODE_INFO } from "@/backend/types";

import type { GeminiMode } from "@/backend/types";

interface ModelSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (mode: GeminiMode) => void;
  selectedCount: number;
  initialMode?: GeminiMode | null;
}

export const ModelSelectDialog: React.FC<ModelSelectDialogProps> = ({
  isOpen,
  onClose,
  onApply,
  selectedCount,
  initialMode,
}) => {
  const [selectedMode, setSelectedMode] = useState<GeminiMode | null>(initialMode ?? null);

  const handleApply = () => {
    if (selectedMode) {
      onApply(selectedMode);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100">
              <Zap size={18} className="text-amber-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-card-foreground">Change Mode</span>
              <span className="text-xs text-muted-foreground">
                Apply to {selectedCount} selected item{selectedCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded bg-secondary p-1.5 transition-colors hover:bg-secondary/80"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4">
          <p className="mb-3 text-sm font-medium text-foreground">Select Mode</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(GEMINI_MODE_INFO).map(([mode, info]) => {
              const isSelected = selectedMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode as GeminiMode)}
                  className={`flex flex-col items-center gap-1.5 rounded-md border p-3 text-sm transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="font-medium">{info.label}</span>
                  <span className="text-center text-xs text-muted-foreground">
                    {info.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!selectedMode}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
