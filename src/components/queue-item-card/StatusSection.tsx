import { AlertTriangle, Clock } from "lucide-react";
import React from "react";

import { StatusBadge } from "@/components/StatusBadge";
import { ErrorCategory, GEMINI_MODE_INFO, GEMINI_TOOL_INFO, QueueStatus } from "@/types";
import { getErrorCategoryLabel } from "@/utils/retryStrategy";

import { MODE_BADGE_STYLES } from "./types";

import type { QueueItem, GeminiTool } from "@/types";

interface StatusSectionProps {
  item: QueueItem;
  isDark: boolean;
}

export const StatusSection: React.FC<StatusSectionProps> = ({ item, isDark }) => {
  const toolInfo = item.tool
    ? GEMINI_TOOL_INFO[item.tool]
    : GEMINI_TOOL_INFO["image" as GeminiTool];
  const modeInfo = item.mode ? GEMINI_MODE_INFO[item.mode] : null;
  const modeStyles = item.mode ? MODE_BADGE_STYLES[item.mode] : null;

  const isCompleted = item.status === QueueStatus.Completed;
  const hasCompletionTime = isCompleted && item.completionTimeSeconds !== undefined;

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      <StatusBadge status={item.status} errorMessage={item.error} />

      <span
        title={toolInfo.description}
        className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isDark ? "bg-slate-700/50 text-slate-400" : "bg-slate-100 text-slate-500"}`}
      >
        {React.createElement(toolInfo.icon, { size: 10 })}
        <span>{toolInfo.label}</span>
      </span>

      {modeInfo && modeStyles && (
        <span
          title={modeInfo.description}
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isDark ? modeStyles.dark : modeStyles.light}`}
        >
          {modeInfo.label}
        </span>
      )}

      {hasCompletionTime && (
        <span
          title="Completion time"
          className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}
        >
          <Clock size={10} />
          <span>{item.completionTimeSeconds?.toFixed(1)}s</span>
        </span>
      )}

      {item.retryInfo && item.retryInfo.attempts > 0 && (
        <span
          title={`${getErrorCategoryLabel(item.retryInfo.errorCategory)} - Attempt ${item.retryInfo.attempts}/${item.retryInfo.maxAttempts}`}
          className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
            item.retryInfo.errorCategory === ErrorCategory.CONTENT_POLICY
              ? isDark
                ? "bg-red-500/10 text-red-400"
                : "bg-red-50 text-red-600"
              : isDark
                ? "bg-amber-500/10 text-amber-400"
                : "bg-amber-50 text-amber-600"
          }`}
        >
          <AlertTriangle size={10} />
          <span>
            {item.retryInfo.attempts}/{item.retryInfo.maxAttempts}
          </span>
        </span>
      )}
    </div>
  );
};
