import { Download, Loader2, X } from "lucide-react";
import React, { useState } from "react";

import { DEFAULT_PROCESSING_OPTIONS } from "@/types/imageProcessing";
import { processBatch } from "@/utils/batchProcessor";

import { AdvancedOptionsPanel } from "./AdvancedOptionsPanel";
import { FormatSelector } from "./FormatSelector";
import { PresetSelector } from "./PresetSelector";

import type {
  BatchProgress,
  DownloadableFile,
  ImageFormat,
  ProcessingOptions,
} from "@/types/imageProcessing";

interface DownloadOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  files: DownloadableFile[];
  isDark: boolean;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

export const DownloadOptionsDialog: React.FC<DownloadOptionsDialogProps> = ({
  isOpen,
  onClose,
  files,
  isDark,
  onToast,
}) => {
  const [options, setOptions] = useState<ProcessingOptions>(DEFAULT_PROCESSING_OPTIONS);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<BatchProgress | null>(null);

  if (!isOpen) return null;

  const handlePresetChange = (presetId: string) => {
    if (presetId === "original") {
      setOptions({ ...options, size: { type: "original" } });
    } else {
      setOptions({ ...options, size: { type: "preset", presetId } });
    }
  };

  const handleFormatChange = (format: ImageFormat) => {
    setOptions({ ...options, format });
  };

  const handleDownload = async () => {
    if (files.length === 0) return;

    setIsDownloading(true);
    setProgress(null);

    try {
      const result = await processBatch(files, options, {
        concurrency: 3,
        delayBetween: 200,
        onProgress: (p) => setProgress(p),
      });

      if (result.successCount > 0) {
        onToast?.(
          `Downloaded ${result.successCount} file${result.successCount !== 1 ? "s" : ""}${
            result.failedCount > 0 ? ` (${result.failedCount} failed)` : ""
          }`,
          result.failedCount > 0 ? "info" : "success"
        );
      } else {
        onToast?.("Download failed", "error");
      }

      onClose();
    } catch (error) {
      onToast?.("Download error occurred", "error");
    } finally {
      setIsDownloading(false);
      setProgress(null);
    }
  };

  const selectedPresetId =
    options.size.type === "original"
      ? "original"
      : options.size.type === "preset"
        ? (options.size.presetId ?? "original")
        : "original";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`mx-4 w-full max-w-sm rounded-lg border shadow-2xl ${
          isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b p-4 ${
            isDark ? "border-slate-700" : "border-slate-200"
          }`}
        >
          <div>
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Download {files.length} Image{files.length !== 1 ? "s" : ""}
            </h3>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Choose size and format options
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isDownloading}
            className={`rounded-md p-2 transition-colors ${
              isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {isDownloading && progress && (
          <div className={`border-b px-4 py-3 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className={isDark ? "text-white/70" : "text-slate-600"}>Downloading...</span>
              <span className={isDark ? "text-white/50" : "text-slate-500"}>
                {progress.completed}/{progress.total}
              </span>
            </div>
            <div
              className={`h-1.5 overflow-hidden rounded-full ${
                isDark ? "bg-white/10" : "bg-slate-100"
              }`}
            >
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
            {progress.currentItem && (
              <p
                className={`mt-1 truncate text-[10px] ${isDark ? "text-white/40" : "text-slate-400"}`}
              >
                {progress.currentItem}
              </p>
            )}
          </div>
        )}

        <div className="space-y-4 p-4">
          <PresetSelector
            selected={selectedPresetId}
            onSelect={handlePresetChange}
            isDark={isDark}
          />

          <FormatSelector selected={options.format} onSelect={handleFormatChange} isDark={isDark} />

          <AdvancedOptionsPanel options={options} onChange={setOptions} isDark={isDark} />
        </div>

        <div className={`border-t p-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <button
            onClick={handleDownload}
            disabled={isDownloading || files.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-600 disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isDownloading
              ? "Downloading..."
              : `Download ${files.length} Image${files.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadOptionsDialog;
