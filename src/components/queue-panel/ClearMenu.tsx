import { Trash2 } from "lucide-react";
import React from "react";

import {
  GEMINI_MODE_INFO,
  GEMINI_TOOL_INFO,
  GeminiMode,
  GeminiTool,
  QueueStatus,
  type QueueItem,
} from "@/types";

interface ClearMenuProps {
  isOpen: boolean;
  queue: QueueItem[];
  onClearAll?: () => void;
  onClearByFilter?: (filter: {
    status?: QueueStatus;
    tool?: GeminiTool;
    mode?: GeminiMode;
  }) => void;
  onClose: () => void;
  isDark: boolean;
}

export const ClearMenu: React.FC<ClearMenuProps> = ({
  isOpen,
  queue,
  onClearAll,
  onClearByFilter,
  onClose,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-lg border shadow-xl ${
        isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
      }`}
    >
      <div className="p-2">
        {onClearAll && (
          <button
            onClick={() => {
              onClearAll();
              onClose();
            }}
            className={`flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              isDark ? "text-red-400 hover:bg-red-500/20" : "text-red-600 hover:bg-red-50"
            }`}
          >
            <Trash2 size={14} />
            Clear All ({queue.length})
          </button>
        )}

        {onClearByFilter && (
          <>
            <div className={`my-2 border-t ${isDark ? "border-white/10" : "border-slate-100"}`} />
            <div
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${isDark ? "text-white/40" : "text-slate-400"}`}
            >
              By Status
            </div>
            {Object.values(QueueStatus).map((status) => {
              const count = queue.filter((item) => item.status === status).length;
              if (count === 0) return null;
              return (
                <button
                  key={status}
                  onClick={() => {
                    onClearByFilter({ status });
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="capitalize">{status}</span>
                  <span className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}>
                    {count}
                  </span>
                </button>
              );
            })}

            <div className={`my-2 border-t ${isDark ? "border-white/10" : "border-slate-100"}`} />
            <div
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${isDark ? "text-white/40" : "text-slate-400"}`}
            >
              By Tool
            </div>
            {Object.values(GeminiTool)
              .filter((tool) => tool !== GeminiTool.NONE)
              .map((tool) => {
                const count = queue.filter((item) => item.tool === tool).length;
                if (count === 0) return null;
                const toolInfo = GEMINI_TOOL_INFO[tool];
                return (
                  <button
                    key={tool}
                    onClick={() => {
                      onClearByFilter({ tool });
                      onClose();
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {React.createElement(toolInfo.icon, { size: 14 })}
                      {toolInfo.label}
                    </span>
                    <span className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}

            <div className={`my-2 border-t ${isDark ? "border-white/10" : "border-slate-100"}`} />
            <div
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${isDark ? "text-white/40" : "text-slate-400"}`}
            >
              By Mode
            </div>
            {Object.values(GeminiMode).map((mode) => {
              const count = queue.filter((item) => item.mode === mode).length;
              if (count === 0) return null;
              const modeInfo = GEMINI_MODE_INFO[mode];
              return (
                <button
                  key={mode}
                  onClick={() => {
                    onClearByFilter({ mode });
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                  }`}
                >
                  <span>{modeInfo.label}</span>
                  <span className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
