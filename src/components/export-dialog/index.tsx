import { Download, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import { FORMAT_OPTIONS } from "./constants";
import { FormatOptionButton } from "./FormatOptionButton";
import { downloadExport } from "./utils";

import type { ExportDialogProps, ExportFormat } from "./types";

export const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, queue, isDark }) => {
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
      <div
        className={`animate-in zoom-in-95 w-full max-w-md rounded-xl border shadow-2xl duration-200 ${
          isDark
            ? "border-white/10 bg-gradient-to-b from-slate-900 to-slate-950"
            : "border-slate-200 bg-gradient-to-b from-white to-slate-50"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div>
            <h2
              className={`text-base font-black tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Export Queue
            </h2>
            <p className={`mt-0.5 text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
              Export {queue.length} {queue.length === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={onClose}
            title="Close dialog"
            className={`rounded-lg p-2 transition-all ${
              isDark
                ? "text-white/60 hover:bg-white/10 hover:text-white"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 p-5">
          <label
            className={`mb-3 block text-[10px] font-bold uppercase tracking-widest ${
              isDark ? "text-white/40" : "text-slate-400"
            }`}
          >
            Select Format
          </label>

          <div className="space-y-2">
            {FORMAT_OPTIONS.map((option) => (
              <FormatOptionButton
                key={option.id}
                option={option}
                isSelected={selectedFormat === option.id}
                isDark={isDark}
                onSelect={() => setSelectedFormat(option.id)}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 px-5 py-4">
          <button
            onClick={handleExport}
            disabled={queue.length === 0}
            title={
              queue.length === 0
                ? "No items to export"
                : `Export as ${selectedOption?.extension || ""}`
            }
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-all ${
              queue.length === 0
                ? isDark
                  ? "cursor-not-allowed bg-white/5 text-white/30"
                  : "cursor-not-allowed bg-slate-100 text-slate-300"
                : "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/40 active:scale-[0.98]"
            }`}
          >
            <Download size={18} />
            Export as {selectedOption?.extension || ""}
          </button>

          {queue.length === 0 && (
            <p
              className={`mt-2 text-center text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}
            >
              Add items to the queue to enable export
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;

export type { ExportDialogProps, ExportFormat } from "./types";
