import { Download, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import {
  findAllMedia,
  downloadAllMedia,
  downloadAllViaNativeButtons,
  type MediaItem,
} from "@/utils/mediaDownloader";

import { DownloadPanel } from "./DownloadPanel";
import { getMediaCounts } from "./types";

import type { BulkDownloadButtonProps, DownloadMethod, DownloadState } from "./types";

export const BulkDownloadButton: React.FC<BulkDownloadButtonProps> = ({ isDark, onToast }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isScanning: false,
    isDownloading: false,
    progress: 0,
    total: 0,
  });

  const mediaCounts = getMediaCounts(mediaItems);

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
        {mediaCounts.totalCount > 0 && !isLoading && (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              isDark ? "bg-blue-500/30 text-blue-300" : "bg-blue-100 text-blue-600"
            }`}
          >
            {mediaCounts.totalCount}
          </span>
        )}
      </button>

      {isExpanded && (
        <DownloadPanel
          isDark={isDark}
          downloadState={downloadState}
          mediaCounts={mediaCounts}
          onClose={() => setIsExpanded(false)}
          onDownload={handleDownload}
          onScanAgain={scanForMedia}
        />
      )}
    </div>
  );
};

export default BulkDownloadButton;

export type { BulkDownloadButtonProps } from "./types";
