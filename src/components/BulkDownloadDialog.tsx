import { CheckCircle, Download, Image, Video, X } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

import type { DownloadableFile, DownloadMode } from "@/types/imageProcessing";
import type { QueueItem } from "@/types";
import { QueueStatus } from "@/types";

import { DownloadOptionsDialog } from "./download/DownloadOptionsDialog";

interface BulkDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  queue: QueueItem[];
  isDark: boolean;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

function collectDownloadableFiles(queue: QueueItem[]): DownloadableFile[] {
  const files: DownloadableFile[] = [];

  queue
    .filter((item) => item.status === QueueStatus.Completed)
    .forEach((item) => {
      const flashUrl = item.results?.flash?.url;
      const proUrl = item.results?.pro?.url;
      const promptPreview =
        item.originalPrompt.length > 30
          ? `${item.originalPrompt.substring(0, 30)}...`
          : item.originalPrompt;

      if (flashUrl) {
        files.push({
          id: `${item.id}-flash`,
          queueItemId: item.id,
          promptPreview,
          url: flashUrl,
          type: "image",
          filename: `gemini_${item.id}_flash`,
          selected: true,
          thumbnail: flashUrl,
        });
      }

      if (proUrl && proUrl !== flashUrl) {
        files.push({
          id: `${item.id}-pro`,
          queueItemId: item.id,
          promptPreview,
          url: proUrl,
          type: "image",
          filename: `gemini_${item.id}_pro`,
          selected: true,
          thumbnail: proUrl,
        });
      }
    });

  return files;
}

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

  const handleOptionsClose = () => {
    setShowOptionsDialog(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div
          className={`mx-4 flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl border shadow-2xl ${
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
              className={`rounded-lg p-2 transition-colors ${
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
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                          downloadMode === opt.mode
                            ? "border-blue-500 bg-blue-500/20 text-blue-500"
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
                {downloadMode === "select" ? (
                  <div className="grid grid-cols-4 gap-2">
                    {allFiles.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => handleToggleSelection(file.id)}
                        className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                          selectedIds.has(file.id)
                            ? "border-blue-500 ring-2 ring-blue-500/30"
                            : isDark
                              ? "border-slate-700 hover:border-slate-600"
                              : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {file.type === "image" ? (
                          <img
                            src={file.thumbnail ?? file.url}
                            alt={file.promptPreview}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-full w-full items-center justify-center ${
                              isDark ? "bg-slate-800" : "bg-slate-100"
                            }`}
                          >
                            <Video
                              size={24}
                              className={isDark ? "text-slate-500" : "text-slate-400"}
                            />
                          </div>
                        )}
                        {selectedIds.has(file.id) && (
                          <div className="absolute right-1 top-1 rounded-full bg-blue-500 p-0.5">
                            <CheckCircle size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {filesToDownload.map((file) => (
                      <div
                        key={file.id}
                        className={`relative aspect-square overflow-hidden rounded-lg border ${
                          isDark ? "border-slate-700" : "border-slate-200"
                        }`}
                      >
                        {file.type === "image" ? (
                          <img
                            src={file.thumbnail ?? file.url}
                            alt={file.promptPreview}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-full w-full items-center justify-center ${
                              isDark ? "bg-slate-800" : "bg-slate-100"
                            }`}
                          >
                            <Video
                              size={24}
                              className={isDark ? "text-slate-500" : "text-slate-400"}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={`border-t p-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <button
                  onClick={handleDownloadClick}
                  disabled={filesToDownload.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-blue-500 disabled:opacity-50"
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
        onClose={handleOptionsClose}
        files={filesToDownload}
        isDark={isDark}
        onToast={onToast}
      />
    </>
  );
};

export default BulkDownloadDialog;
