import { Download, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import { FORMAT_OPTIONS } from "@/extension/components/export-dialog/constants";
import { FormatOptionButton } from "@/extension/components/export-dialog/FormatOptionButton";
import { downloadExport } from "@/extension/components/export-dialog/utils";

import type { ExportDialogProps, ExportFormat } from "@/extension/components/export-dialog/types";

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  queue,
  isDark: _isDark,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("txt");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleExport = () => {
    downloadExport(queue, selectedFormat, onClose);
  };

  if (!isOpen) return null;

  const selectedOption = FORMAT_OPTIONS.find((opt) => opt.id === selectedFormat);

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md duration-200"
      onClick={handleBackdropClick}
    >
      <div className="animate-in zoom-in-95 w-full max-w-md rounded-lg border border-border bg-card shadow-2xl duration-200">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-black tracking-tight text-card-foreground">
              Export Queue
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Export {queue.length} {queue.length === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={onClose}
            title="Close dialog"
            className="rounded-md p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 p-5">
          <label className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Select Format
          </label>

          <div className="space-y-2">
            {FORMAT_OPTIONS.map((option) => (
              <FormatOptionButton
                key={option.id}
                option={option}
                isSelected={selectedFormat === option.id}
                isDark={false}
                onSelect={() => setSelectedFormat(option.id)}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-border px-5 py-4">
          <button
            onClick={handleExport}
            disabled={queue.length === 0}
            title={
              queue.length === 0
                ? "No items to export"
                : `Export as ${selectedOption?.extension || ""}`
            }
            className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${queue.length === 0 ? "cursor-not-allowed bg-muted text-muted-foreground" : "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"}`}
          >
            <Download size={18} />
            Export as {selectedOption?.extension || ""}
          </button>

          {queue.length === 0 && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Add items to the queue to enable export
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;

export type { ExportDialogProps, ExportFormat } from "@/extension/components/export-dialog/types";
