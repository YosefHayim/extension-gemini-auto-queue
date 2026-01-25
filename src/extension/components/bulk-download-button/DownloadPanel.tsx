import { AlertCircle, CheckCircle, Download, FileText, Image, Video, X } from "lucide-react";
import React from "react";

import type { DownloadMethod, DownloadState, MediaCounts } from "@/extension/components/bulk-download-button/types";

interface DownloadPanelProps {
  isDark: boolean;
  downloadState: DownloadState;
  mediaCounts: MediaCounts;
  onClose: () => void;
  onDownload: (method: DownloadMethod, filterType?: "image" | "video" | "file") => void;
  onScanAgain: () => void;
}

export const DownloadPanel: React.FC<DownloadPanelProps> = ({
  isDark: _isDark,
  downloadState,
  mediaCounts,
  onClose,
  onDownload,
  onScanAgain,
}) => {
  const { imageCount, videoCount, fileCount, totalCount } = mediaCounts;

  return (
    <div className="bg-popover absolute bottom-full right-0 z-50 mb-2 w-72 rounded-xl border border-border shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-popover-foreground text-sm font-bold">Download Media</h3>
          <p className="text-xs text-muted-foreground">
            {downloadState.isScanning ? "Scanning chat..." : `Found ${totalCount} items`}
          </p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-muted">
          <X size={14} className="text-muted-foreground" />
        </button>
      </div>

      {downloadState.isDownloading && (
        <div className="border-b border-border px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-foreground/70">Downloading...</span>
            <span className="text-muted-foreground">
              {downloadState.progress}/{downloadState.total}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${downloadState.total > 0 ? (downloadState.progress / downloadState.total) * 100 : 0}%`,
              }}
            />
          </div>
          {downloadState.currentItem && (
            <p className="mt-1 truncate text-[10px] text-muted-foreground">
              {downloadState.currentItem}
            </p>
          )}
        </div>
      )}

      <div className="p-3">
        {totalCount === 0 && !downloadState.isScanning ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle size={32} className="text-muted-foreground/30" />
            <p className="mt-2 text-xs text-muted-foreground">No media found in this chat</p>
            <button
              onClick={onScanAgain}
              className="mt-3 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
            >
              Scan Again
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {imageCount > 0 && (
              <MediaTypeButton
                isDark={false}
                isLoading={downloadState.isDownloading}
                icon={Image}
                iconBgClass="bg-muted"
                iconClass="text-foreground"
                label="Images"
                count={imageCount}
                onClick={() => onDownload("direct", "image")}
              />
            )}

            {videoCount > 0 && (
              <MediaTypeButton
                isDark={false}
                isLoading={downloadState.isDownloading}
                icon={Video}
                iconBgClass="bg-purple-500/20 dark:bg-purple-500/20"
                iconClass="text-purple-600 dark:text-purple-400"
                label="Videos"
                count={videoCount}
                onClick={() => onDownload("direct", "video")}
              />
            )}

            {fileCount > 0 && (
              <MediaTypeButton
                isDark={false}
                isLoading={downloadState.isDownloading}
                icon={FileText}
                iconBgClass="bg-amber-500/20 dark:bg-amber-500/20"
                iconClass="text-amber-600 dark:text-amber-400"
                label="Files"
                count={fileCount}
                onClick={() => onDownload("direct", "file")}
              />
            )}

            {totalCount > 0 && (
              <>
                <div className="my-2 border-t border-border" />
                <button
                  onClick={() => onDownload("direct")}
                  disabled={downloadState.isDownloading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/20 px-3 py-2.5 text-xs font-bold text-primary transition-all hover:bg-primary/30"
                >
                  <Download size={14} />
                  Download All ({totalCount})
                </button>

                <button
                  onClick={() => onDownload("native")}
                  disabled={downloadState.isDownloading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <CheckCircle size={12} />
                  Use Gemini's Download Buttons
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-2 text-center text-[10px] text-muted-foreground/50">
        Tip: Use native download for full-quality images
      </div>
    </div>
  );
};

interface MediaTypeButtonProps {
  isDark: boolean;
  isLoading: boolean;
  icon: typeof Image;
  iconBgClass: string;
  iconClass: string;
  label: string;
  count: number;
  onClick: () => void;
}

const MediaTypeButton: React.FC<MediaTypeButtonProps> = ({
  isDark: _isDark,
  isLoading,
  icon: Icon,
  iconBgClass,
  iconClass,
  label,
  count,
  onClick,
}) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className="flex w-full items-center justify-between rounded-lg bg-muted px-3 py-2.5 text-left transition-colors hover:bg-muted/80"
  >
    <div className="flex items-center gap-2.5">
      <div className={`rounded-lg p-1.5 ${iconBgClass}`}>
        <Icon size={14} className={iconClass} />
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">
          {count} file{count !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
    <Download size={14} className="text-muted-foreground" />
  </button>
);
