import { Download, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import {
  findAllMedia,
  downloadAllMedia,
  downloadAllViaNativeButtons,
  type MediaItem,
} from "@/backend/utils/mediaDownloader";
import { DownloadPanel } from "@/extension/components/bulk-download-button/DownloadPanel";
import { getMediaCounts } from "@/extension/components/bulk-download-button/types";

import type {
  BulkDownloadButtonProps,
  DownloadMethod,
  DownloadState,
} from "@/extension/components/bulk-download-button/types";

export const BulkDownloadButton: React.FC<BulkDownloadButtonProps> = ({
  isDark: _isDark,
  onToast,
}) => {
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
            ? "bg-primary/20 text-primary ring-1 ring-primary/30"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        }`}
      >
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        <span>Bulk Download</span>
        {mediaCounts.totalCount > 0 && !isLoading && (
          <span className="rounded-full bg-primary/30 px-1.5 py-0.5 text-[10px] font-bold text-primary">
            {mediaCounts.totalCount}
          </span>
        )}
      </button>

      {isExpanded && (
        <DownloadPanel
          isDark={false}
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

export type { BulkDownloadButtonProps } from "@/extension/components/bulk-download-button/types";
