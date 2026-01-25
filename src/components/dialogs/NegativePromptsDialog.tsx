import { X } from "lucide-react";
import React, { useState } from "react";

interface NegativePromptsDialogProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onApply: (negativePrompts: string) => void;
}

export const NegativePromptsDialog: React.FC<NegativePromptsDialogProps> = ({
  isOpen,
  isDark: _isDark,
  onClose,
  onApply,
}) => {
  const [negativePrompts, setNegativePrompts] = useState("");

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(negativePrompts);
    setNegativePrompts("");
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
          <h3 className="text-sm font-bold text-card-foreground">Add Negative Prompts</h3>
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
              Negative Prompts
            </label>
            <textarea
              value={negativePrompts}
              onChange={(e) => setNegativePrompts(e.target.value)}
              placeholder="Describe what you don't want in the generated content (e.g., 'blurry, low quality, distorted')"
              className="mt-1 w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground placeholder:text-muted-foreground"
              rows={4}
            />
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
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
