import { X } from "lucide-react";
import React, { useState } from "react";

interface CloneVariationsDialogProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onApply: (count: number) => void;
}

export const CloneVariationsDialog: React.FC<CloneVariationsDialogProps> = ({
  isOpen,
  isDark: _isDark,
  onClose,
  onApply,
}) => {
  const [count, setCount] = useState(1);

  if (!isOpen) return null;

  const handleApply = () => {
    if (count > 0) {
      onApply(count);
      setCount(1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setCount(value);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="mx-4 w-full max-w-sm rounded-lg border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-sm font-bold text-card-foreground">Clone Variations</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Number of Variations
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={handleInputChange}
              placeholder="Enter number of variations"
              className="mt-1 w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Create {count} {count === 1 ? "variation" : "variations"} of the selected{" "}
              {count === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-4">
          <button
            onClick={onClose}
            className="rounded-md bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={count <= 0}
            className={`rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
              count > 0
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "cursor-not-allowed bg-muted text-muted-foreground"
            }`}
          >
            Clone
          </button>
        </div>
      </div>
    </div>
  );
};
