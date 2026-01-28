import { Shuffle, Zap, Star, X, Dices } from "lucide-react";
import React, { useState } from "react";

import type { ShuffleOption } from "./types";

interface ShuffleOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (option: ShuffleOption) => void;
  selectedCount: number;
}

const SHUFFLE_OPTIONS: Record<ShuffleOption, { label: string; description: string; icon: React.ReactNode }> = {
  regular: {
    label: "Regular",
    description: "Random order",
    icon: <Dices size={18} className="text-blue-500" />,
  },
  flashFirst: {
    label: "Flash First",
    description: "Flash → Pro",
    icon: <Zap size={18} className="text-amber-500" />,
  },
  proFirst: {
    label: "Pro First",
    description: "Pro → Flash",
    icon: <Star size={18} className="text-purple-500" />,
  },
};

export const ShuffleOptionsDialog: React.FC<ShuffleOptionsDialogProps> = ({
  isOpen,
  onClose,
  onApply,
  selectedCount,
}) => {
  const [selectedOption, setSelectedOption] = useState<ShuffleOption>("regular");

  const handleApply = () => {
    onApply(selectedOption);
    onClose();
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
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
              <Shuffle size={18} className="text-blue-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-card-foreground">Shuffle Options</span>
              <span className="text-xs text-muted-foreground">
                Apply to {selectedCount} item{selectedCount !== 1 ? "s" : ""}
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
          <p className="mb-3 text-sm font-medium text-foreground">Select Shuffle Method</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(SHUFFLE_OPTIONS) as [ShuffleOption, typeof SHUFFLE_OPTIONS[ShuffleOption]][]).map(
              ([option, info]) => {
                const isSelected = selectedOption === option;
                return (
                  <button
                    key={option}
                    onClick={() => setSelectedOption(option)}
                    className={`flex flex-col items-center gap-1.5 rounded-md border p-3 text-sm transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    } ${option === "proFirst" ? "col-span-2 sm:col-span-1" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      {info.icon}
                      <span className="font-medium">{info.label}</span>
                    </div>
                    <span className="text-center text-xs text-muted-foreground">{info.description}</span>
                  </button>
                );
              }
            )}
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
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Shuffle
          </button>
        </div>
      </div>
    </div>
  );
};
