import { Download, Image, X } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

import { DownloadOptionsDialog } from "../download/DownloadOptionsDialog";

import { FileGrid } from "./FileGrid";
import { collectDownloadableFiles } from "./utils";

import type { BulkDownloadDialogProps } from "./types";
import type { DownloadMode } from "@/types/imageProcessing";

export const BulkDownloadDialog: React.FC<BulkDownloadDialogProps> = ({
  isOpen,
  onClose,
  queue,
  isDark,
  onToast,
}) => {
  const [downloadMode, setDownloadMode] = useState<DownloadMode>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);

  const allFiles = useMemo(() => collectDownloadableFiles(queue), [queue]);
  const imageFiles = useMemo(() => allFiles.filter((f) => f.type === "image"), [allFiles]);
  const videoFiles = useMemo(() => allFiles.filter((f) => f.type === "video"), [allFiles]);

  const filesToDownload = useMemo(() => {
    switch (downloadMode) {
      case "images":
        return imageFiles;
      case "videos":
        return videoFiles;
      case "select":
        return allFiles.filter((f) => selectedIds.has(f.id));
      default:
        return allFiles;
    }
  }, [downloadMode, allFiles, imageFiles, videoFiles, selectedIds]);

  const handleToggleSelection = useCallback((fileId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(allFiles.map((f) => f.id)));
  }, [allFiles]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleDownloadClick = () => {
    if (filesToDownload.length === 0) {
      onToast?.("No files selected for download", "info");
      return;
    }
    setShowOptionsDialog(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div
          className={`mx-4 flex max-h-[80vh] w-full max-w-lg flex-col rounded-lg border shadow-2xl ${
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
                Download Results
              </h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {allFiles.length} file{allFiles.length !== 1 ? "s" : ""} available
              </p>
            </div>
            <button
              onClick={onClose}
              className={`rounded-md p-2 transition-colors ${
                isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {allFiles.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <Image size={48} className={isDark ? "text-slate-600" : "text-slate-300"} />
              <p className={`mt-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                No completed results to download
              </p>
              <p className={`mt-1 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Process some prompts first to see results here
              </p>
            </div>
          ) : (
            <>
              <div className={`border-b p-3 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <div className="flex flex-wrap gap-2">
                  {[
                    { mode: "all" as const, label: "All", count: allFiles.length },
                    { mode: "images" as const, label: "Images", count: imageFiles.length },
                    { mode: "videos" as const, label: "Videos", count: videoFiles.length },
                    { mode: "select" as const, label: "Select", count: selectedIds.size },
                  ]
                    .filter((opt) => opt.mode !== "videos" || videoFiles.length > 0)
                    .map((opt) => (
                      <button
                        key={opt.mode}
                        onClick={() => setDownloadMode(opt.mode)}
                        className={`rounded-md border px-3 py-2 text-sm font-medium transition-all ${
                          downloadMode === opt.mode
                            ? "border-emerald-500 bg-emerald-500/20 text-emerald-500"
                            : isDark
                              ? "border-slate-700 text-slate-400 hover:border-slate-600"
                              : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                        {opt.count > 0 && (
                          <span
                            className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                              downloadMode === opt.mode
                                ? "bg-blue-500/30"
                                : isDark
                                  ? "bg-slate-700"
                                  : "bg-slate-100"
                            }`}
                          >
                            {opt.count}
                          </span>
                        )}
                      </button>
                    ))}
                </div>

                {downloadMode === "select" && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handleSelectAll}
                      className={`text-xs ${isDark ? "text-blue-400" : "text-blue-600"} hover:underline`}
                    >
                      Select all
                    </button>
                    <span className={isDark ? "text-slate-600" : "text-slate-300"}>|</span>
                    <button
                      onClick={handleDeselectAll}
                      className={`text-xs ${isDark ? "text-blue-400" : "text-blue-600"} hover:underline`}
                    >
                      Deselect all
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <FileGrid
                  files={downloadMode === "select" ? allFiles : filesToDownload}
                  isDark={isDark}
                  selectable={downloadMode === "select"}
                  selectedIds={selectedIds}
                  onToggleSelection={handleToggleSelection}
                />
              </div>

              <div className={`border-t p-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <button
                  onClick={handleDownloadClick}
                  disabled={filesToDownload.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-600 disabled:opacity-50"
                >
                  <Download size={16} />
                  Download {filesToDownload.length} File{filesToDownload.length !== 1 ? "s" : ""}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <DownloadOptionsDialog
        isOpen={showOptionsDialog}
        onClose={() => setShowOptionsDialog(false)}
        files={filesToDownload}
        isDark={isDark}
        onToast={onToast}
      />
    </>
  );
};

export default BulkDownloadDialog;

export type { BulkDownloadDialogProps } from "./types";
