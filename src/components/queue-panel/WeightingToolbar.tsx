import { Maximize2, TrendingUp, Type, X } from "lucide-react";
import React from "react";

import type { TextSelection } from "./types";

interface WeightingToolbarProps {
  selection: TextSelection | null;
  onApplyWeight: (mode: "standard" | "heavy" | "ultra" | "echo") => void;
  onClearSelection: () => void;
}

export const WeightingToolbar: React.FC<WeightingToolbarProps> = ({
  selection,
  onApplyWeight,
  onClearSelection,
}) => {
  if (!selection) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 absolute right-0 top-0 z-50 mb-1 flex -translate-y-full gap-1 rounded-md bg-blue-600 p-1 shadow-2xl">
      <button
        onClick={() => {
          onApplyWeight("standard");
        }}
        title="Light emphasis (1.2x)"
        className="rounded-md p-1 hover:bg-white/10"
      >
        <Type size={12} />
      </button>
      <button
        onClick={() => {
          onApplyWeight("heavy");
        }}
        title="Strong emphasis (1.5x)"
        className="rounded-md p-1 hover:bg-white/10"
      >
        <Maximize2 size={12} />
      </button>
      <button
        onClick={() => {
          onApplyWeight("echo");
        }}
        title="Repeat for impact"
        className="rounded-md p-1 hover:bg-white/10"
      >
        <TrendingUp size={12} />
      </button>
      <button
        onClick={onClearSelection}
        title="Cancel"
        className="rounded-md border-l border-white/20 p-1 hover:bg-white/10"
      >
        <X size={12} />
      </button>
    </div>
  );
};
