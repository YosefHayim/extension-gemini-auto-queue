import { X } from "lucide-react";
import React, { useState } from "react";

interface PrefixSuffixDialogProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onApply: (prefix: string, suffix: string) => void;
}

export const PrefixSuffixDialog: React.FC<PrefixSuffixDialogProps> = ({
  isOpen,
  isDark: _isDark,
  onClose,
  onApply,
}) => {
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(prefix, suffix);
    setPrefix("");
    setSuffix("");
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
          <h3 className="text-sm font-bold text-card-foreground">Add Prefix/Suffix</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Prefix</label>
            <textarea
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="Text to add at the beginning of each prompt"
              className="mt-1 w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground placeholder:text-muted-foreground"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">Suffix</label>
            <textarea
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="Text to add at the end of each prompt"
              className="mt-1 w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground placeholder:text-muted-foreground"
              rows={3}
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
