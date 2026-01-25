import React from "react";

import { BackButton } from "../BackButton";

import type { DownloadChatPanelProps } from "../types";

export const DownloadChatPanel: React.FC<DownloadChatPanelProps> = ({
  isDark,
  onBack,
  isScanning,
  chatMediaCounts,
  downloadMethod,
  setDownloadMethod,
}) => {
  return (
    <div className="space-y-4">
      <BackButton isDark={isDark} onClick={onBack} />

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Media Found in Chat
        </label>
        {isScanning ? (
          <div className="rounded-lg border border-border bg-muted p-4 text-center">
            <p className="text-xs text-muted-foreground">Scanning chat for media...</p>
          </div>
        ) : chatMediaCounts ? (
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-muted p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{chatMediaCounts.images}</div>
              <div className="text-[10px] uppercase text-muted-foreground">Images</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-500">{chatMediaCounts.videos}</div>
              <div className="text-[10px] uppercase text-muted-foreground">Videos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-500">{chatMediaCounts.files}</div>
              <div className="text-[10px] uppercase text-muted-foreground">Files</div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted p-4 text-center">
            <p className="text-xs text-muted-foreground">No media found in chat</p>
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Download Method
        </label>
        <div className="flex gap-2">
          {(["native", "direct"] as const).map((method) => (
            <button
              key={method}
              onClick={() => setDownloadMethod(method)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                downloadMethod === method
                  ? "border-blue-500 bg-blue-500/20 text-blue-500"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50"
              }`}
            >
              {method === "native" ? "Use Gemini Buttons" : "Direct Download"}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {downloadMethod === "native"
            ? "Clicks Gemini's download buttons for full-quality images"
            : "Fetches and downloads images directly"}
        </p>
      </div>
    </div>
  );
};
