import {
  Download,
  Image,
  Video,
  FileText,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import {
  findAllMedia,
  downloadAllMedia,
  downloadAllViaNativeButtons,
  type MediaItem,
} from "@/utils/mediaDownloader";

interface BulkDownloadButtonProps {
  isDark: boolean;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

type DownloadMethod = "native" | "direct";

interface DownloadState {
  isScanning: boolean;
  isDownloading: boolean;
  progress: number;
  total: number;
  currentItem?: string;
}

export const BulkDownloadButton: React.FC<BulkDownloadButtonProps> = ({ isDark, onToast }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isScanning: false,
    isDownloading: false,
    progress: 0,
    total: 0,
  });

  const imageCount = mediaItems.filter((m) => m.type === "image").length;
  const videoCount = mediaItems.filter((m) => m.type === "video").length;
  const fileCount = mediaItems.filter((m) => m.type === "file").length;
  const totalCount = mediaItems.length;

  const scanForMedia = useCallback(() => {
    setDownloadState((prev) => ({ ...prev, isScanning: true }));

    setTimeout(() => {
      const items = findAllMedia();
      setMediaItems(items);
      setDownloadState((prev) => ({ ...prev, isScanning: false }));

      if (items.length === 0) {
        onToast?.("No downloadable media found in chat", "info");
      }
    }, 100);
  }, [onToast]);

  useEffect(() => {
    if (isExpanded) {
      scanForMedia();
    }
  }, [isExpanded, scanForMedia]);

  const handleDownload = useCallback(
    async (method: DownloadMethod, filterType?: "image" | "video" | "file") => {
      const itemsToDownload = filterType
        ? mediaItems.filter((m) => m.type === filterType)
        : mediaItems;

      if (itemsToDownload.length === 0) {
        onToast?.("No items to download", "info");
        return;
      }

      setDownloadState((prev) => ({
        ...prev,
        isDownloading: true,
        progress: 0,
        total: itemsToDownload.length,
      }));

      try {
        if (method === "native") {
          const count = await downloadAllViaNativeButtons();
          onToast?.(`Started ${count} downloads via Gemini`, "success");
        } else {
          const result = await downloadAllMedia(itemsToDownload, (completed, total, current) => {
            setDownloadState((prev) => ({
              ...prev,
              progress: completed,
              total,
              currentItem: current.filename,
            }));
          });

          if (result.success > 0) {
            onToast?.(
              `Downloaded ${result.success} file${result.success !== 1 ? "s" : ""}${result.failed > 0 ? ` (${result.failed} failed)` : ""}`,
              result.failed > 0 ? "info" : "success"
            );
          } else {
            onToast?.("Download failed", "error");
          }
        }
      } catch (error) {
        onToast?.("Download error occurred", "error");
        console.error("Bulk download error:", error);
      } finally {
        setDownloadState((prev) => ({
          ...prev,
          isDownloading: false,
          progress: 0,
          total: 0,
          currentItem: undefined,
        }));
      }
    },
    [mediaItems, onToast]
  );

  const isLoading = downloadState.isScanning || downloadState.isDownloading;

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={isLoading}
        title="Bulk download all media from chat"
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
          isExpanded
            ? isDark
              ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
              : "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
            : isDark
              ? "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
        }`}
      >
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        <span>Bulk Download</span>
        {totalCount > 0 && !isLoading && (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              isDark ? "bg-blue-500/30 text-blue-300" : "bg-blue-100 text-blue-600"
            }`}
          >
            {totalCount}
          </span>
        )}
      </button>

      {isExpanded && (
        <div
          className={`absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border shadow-2xl ${
            isDark
              ? "border-white/10 bg-gray-900/95 backdrop-blur-xl"
              : "border-slate-200 bg-white shadow-slate-200/50"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div>
              <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Download Media
              </h3>
              <p className={`text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                {downloadState.isScanning ? "Scanning chat..." : `Found ${totalCount} items`}
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className={`rounded-lg p-1.5 transition-colors ${
                isDark ? "hover:bg-white/10" : "hover:bg-slate-100"
              }`}
            >
              <X size={14} className={isDark ? "text-white/60" : "text-slate-400"} />
            </button>
          </div>

          {downloadState.isDownloading && (
            <div className="border-b border-white/5 px-4 py-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className={isDark ? "text-white/70" : "text-slate-600"}>Downloading...</span>
                <span className={isDark ? "text-white/50" : "text-slate-500"}>
                  {downloadState.progress}/{downloadState.total}
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
                    width: `${downloadState.total > 0 ? (downloadState.progress / downloadState.total) * 100 : 0}%`,
                  }}
                />
              </div>
              {downloadState.currentItem && (
                <p
                  className={`mt-1 truncate text-[10px] ${
                    isDark ? "text-white/40" : "text-slate-400"
                  }`}
                >
                  {downloadState.currentItem}
                </p>
              )}
            </div>
          )}

          <div className="p-3">
            {totalCount === 0 && !downloadState.isScanning ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertCircle size={32} className={isDark ? "text-white/20" : "text-slate-300"} />
                <p className={`mt-2 text-xs ${isDark ? "text-white/50" : "text-slate-500"}`}>
                  No media found in this chat
                </p>
                <button
                  onClick={scanForMedia}
                  className={`mt-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isDark
                      ? "bg-white/5 text-white/70 hover:bg-white/10"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Scan Again
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {imageCount > 0 && (
                  <button
                    onClick={() => handleDownload("direct", "image")}
                    disabled={isLoading}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`rounded-lg p-1.5 ${
                          isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                        }`}
                      >
                        <Image
                          size={14}
                          className={isDark ? "text-emerald-400" : "text-emerald-600"}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium ${
                            isDark ? "text-white" : "text-slate-800"
                          }`}
                        >
                          Images
                        </p>
                        <p className={`text-[10px] ${isDark ? "text-white/50" : "text-slate-500"}`}>
                          {imageCount} file{imageCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <Download size={14} className={isDark ? "text-white/40" : "text-slate-400"} />
                  </button>
                )}

                {videoCount > 0 && (
                  <button
                    onClick={() => handleDownload("direct", "video")}
                    disabled={isLoading}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`rounded-lg p-1.5 ${
                          isDark ? "bg-purple-500/20" : "bg-purple-100"
                        }`}
                      >
                        <Video
                          size={14}
                          className={isDark ? "text-purple-400" : "text-purple-600"}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium ${
                            isDark ? "text-white" : "text-slate-800"
                          }`}
                        >
                          Videos
                        </p>
                        <p className={`text-[10px] ${isDark ? "text-white/50" : "text-slate-500"}`}>
                          {videoCount} file{videoCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <Download size={14} className={isDark ? "text-white/40" : "text-slate-400"} />
                  </button>
                )}

                {fileCount > 0 && (
                  <button
                    onClick={() => handleDownload("direct", "file")}
                    disabled={isLoading}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`rounded-lg p-1.5 ${
                          isDark ? "bg-amber-500/20" : "bg-amber-100"
                        }`}
                      >
                        <FileText
                          size={14}
                          className={isDark ? "text-amber-400" : "text-amber-600"}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium ${
                            isDark ? "text-white" : "text-slate-800"
                          }`}
                        >
                          Files
                        </p>
                        <p className={`text-[10px] ${isDark ? "text-white/50" : "text-slate-500"}`}>
                          {fileCount} file{fileCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <Download size={14} className={isDark ? "text-white/40" : "text-slate-400"} />
                  </button>
                )}

                {totalCount > 0 && (
                  <>
                    <div
                      className={`my-2 border-t ${isDark ? "border-white/5" : "border-slate-100"}`}
                    />
                    <button
                      onClick={() => handleDownload("direct")}
                      disabled={isLoading}
                      className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold transition-all ${
                        isDark
                          ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                    >
                      <Download size={14} />
                      Download All ({totalCount})
                    </button>

                    <button
                      onClick={() => handleDownload("native")}
                      disabled={isLoading}
                      className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[10px] font-medium transition-colors ${
                        isDark
                          ? "text-white/50 hover:text-white/70"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <CheckCircle size={12} />
                      Use Gemini's Download Buttons
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div
            className={`border-t px-4 py-2 text-center text-[10px] ${
              isDark ? "border-white/5 text-white/30" : "border-slate-100 text-slate-400"
            }`}
          >
            Tip: Use native download for full-quality images
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkDownloadButton;
