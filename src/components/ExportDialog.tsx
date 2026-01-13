import { Download, FileJson, FileSpreadsheet, FileText, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { QueueItem } from "@/types";

type ExportFormat = "txt" | "json" | "csv";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  queue: QueueItem[];
  isDark: boolean;
}

interface FormatOption {
  id: ExportFormat;
  name: string;
  extension: string;
  description: string;
  icon: typeof FileText;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: "txt",
    name: "Plain Text",
    extension: ".txt",
    description: "One prompt per line, simple and universal",
    icon: FileText,
  },
  {
    id: "json",
    name: "JSON",
    extension: ".json",
    description: "Full data export with all fields preserved",
    icon: FileJson,
  },
  {
    id: "csv",
    name: "CSV",
    extension: ".csv",
    description: "Spreadsheet format with prompt, tool, mode, status",
    icon: FileSpreadsheet,
  },
];

const escapeCSV = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const generateTimestamp = (): string => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
};

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

  const generateExportContent = (): string => {
    switch (selectedFormat) {
      case "txt":
        return queue.map((item) => item.finalPrompt || item.originalPrompt).join("\n");

      case "json":
        return JSON.stringify(queue, null, 2);

      case "csv": {
        const headers = ["Prompt", "Tool", "Mode", "Status"];
        const rows = queue.map((item) => [
          escapeCSV(item.finalPrompt || item.originalPrompt),
          escapeCSV(item.tool || ""),
          escapeCSV(item.mode || ""),
          escapeCSV(item.status),
        ]);
        return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      }

      default:
        return "";
    }
  };

  const handleExport = () => {
    const content = generateExportContent();
    const timestamp = generateTimestamp();
    const filename = `nano-flow-queue-${timestamp}.${selectedFormat}`;

    const mimeTypes: Record<ExportFormat, string> = {
      txt: "text/plain",
      json: "application/json",
      csv: "text/csv",
    };

    const blob = new Blob([content], { type: `${mimeTypes[selectedFormat]};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onClose();
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
            {FORMAT_OPTIONS.map((option) => {
              const isSelected = selectedFormat === option.id;
              const Icon = option.icon;

              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedFormat(option.id)}
                  title={`Export as ${option.name}`}
                  className={`group relative w-full rounded-lg border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? isDark
                        ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                        : "border-blue-500/50 bg-blue-50 shadow-lg shadow-blue-500/10"
                      : isDark
                        ? "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-500"
                        : isDark
                          ? "border-white/20 bg-transparent"
                          : "border-slate-300 bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 pr-8">
                    <div
                      className={`rounded-lg p-2 transition-colors ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : isDark
                            ? "bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white/80"
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-600"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            isSelected
                              ? isDark
                                ? "text-white"
                                : "text-slate-900"
                              : isDark
                                ? "text-white/80"
                                : "text-slate-700"
                          }`}
                        >
                          {option.name}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                            isSelected
                              ? "bg-blue-500/20 text-blue-400"
                              : isDark
                                ? "bg-white/5 text-white/40"
                                : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {option.extension}
                        </span>
                      </div>
                      <p
                        className={`mt-0.5 text-xs ${
                          isSelected
                            ? isDark
                              ? "text-white/60"
                              : "text-slate-600"
                            : isDark
                              ? "text-white/40"
                              : "text-slate-400"
                        }`}
                      >
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
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
