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
        <label
          className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          Media Found in Chat
        </label>
        {isScanning ? (
          <div
            className={`rounded-lg border p-4 text-center ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}
          >
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Scanning chat for media...
            </p>
          </div>
        ) : chatMediaCounts ? (
          <div
            className={`grid grid-cols-3 gap-2 rounded-lg border p-3 ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}
          >
            <div className="text-center">
              <div
                className={`text-lg font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
              >
                {chatMediaCounts.images}
              </div>
              <div
                className={`text-[10px] uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                Images
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-lg font-bold ${isDark ? "text-purple-400" : "text-purple-600"}`}
              >
                {chatMediaCounts.videos}
              </div>
              <div
                className={`text-[10px] uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                Videos
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                {chatMediaCounts.files}
              </div>
              <div
                className={`text-[10px] uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                Files
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-lg border p-4 text-center ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}
          >
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              No media found in chat
            </p>
          </div>
        )}
      </div>

      <div>
        <label
          className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
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
                  : isDark
                    ? "border-slate-700 text-slate-400 hover:border-slate-600"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {method === "native" ? "Use Gemini Buttons" : "Direct Download"}
            </button>
          ))}
        </div>
        <p className={`mt-1.5 text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {downloadMethod === "native"
            ? "Clicks Gemini's download buttons for full-quality images"
            : "Fetches and downloads images directly"}
        </p>
      </div>
    </div>
  );
};
