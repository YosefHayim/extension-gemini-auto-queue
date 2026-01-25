import { AlertCircle, CheckCircle, Download, FileText, Image, Video, X } from "lucide-react";
import React from "react";

import type { DownloadMethod, DownloadState, MediaCounts } from "./types";

interface DownloadPanelProps {
  isDark: boolean;
  downloadState: DownloadState;
  mediaCounts: MediaCounts;
  onClose: () => void;
  onDownload: (method: DownloadMethod, filterType?: "image" | "video" | "file") => void;
  onScanAgain: () => void;
}

export const DownloadPanel: React.FC<DownloadPanelProps> = ({
  isDark,
  downloadState,
  mediaCounts,
  onClose,
  onDownload,
  onScanAgain,
}) => {
  const { imageCount, videoCount, fileCount, totalCount } = mediaCounts;

  return (
    <div
      className={`absolute bottom-full right-0 z-50 mb-2 w-72 rounded-xl border shadow-2xl ${
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
          onClick={onClose}
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
              className={`mt-1 truncate text-[10px] ${isDark ? "text-white/40" : "text-slate-400"}`}
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
              onClick={onScanAgain}
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
              <MediaTypeButton
                isDark={isDark}
                isLoading={downloadState.isDownloading}
                icon={Image}
                iconBgClass={isDark ? "bg-zinc-600/30" : "bg-zinc-200"}
                iconClass={isDark ? "text-zinc-300" : "text-zinc-700"}
                label="Images"
                count={imageCount}
                onClick={() => onDownload("direct", "image")}
              />
            )}

            {videoCount > 0 && (
              <MediaTypeButton
                isDark={isDark}
                isLoading={downloadState.isDownloading}
                icon={Video}
                iconBgClass={isDark ? "bg-purple-500/20" : "bg-purple-100"}
                iconClass={isDark ? "text-purple-400" : "text-purple-600"}
                label="Videos"
                count={videoCount}
                onClick={() => onDownload("direct", "video")}
              />
            )}

            {fileCount > 0 && (
              <MediaTypeButton
                isDark={isDark}
                isLoading={downloadState.isDownloading}
                icon={FileText}
                iconBgClass={isDark ? "bg-amber-500/20" : "bg-amber-100"}
                iconClass={isDark ? "text-amber-400" : "text-amber-600"}
                label="Files"
                count={fileCount}
                onClick={() => onDownload("direct", "file")}
              />
            )}

            {totalCount > 0 && (
              <>
                <div
                  className={`my-2 border-t ${isDark ? "border-white/5" : "border-slate-100"}`}
                />
                <button
                  onClick={() => onDownload("direct")}
                  disabled={downloadState.isDownloading}
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
                  onClick={() => onDownload("native")}
                  disabled={downloadState.isDownloading}
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
  isDark,
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
    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
      isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
    }`}
  >
    <div className="flex items-center gap-2.5">
      <div className={`rounded-lg p-1.5 ${iconBgClass}`}>
        <Icon size={14} className={iconClass} />
      </div>
      <div>
        <p className={`text-xs font-medium ${isDark ? "text-white" : "text-slate-800"}`}>{label}</p>
        <p className={`text-[10px] ${isDark ? "text-white/50" : "text-slate-500"}`}>
          {count} file{count !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
    <Download size={14} className={isDark ? "text-white/40" : "text-slate-400"} />
  </button>
);
