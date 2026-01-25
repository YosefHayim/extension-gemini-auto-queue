import React from "react";

import {
  GEMINI_MODE_INFO,
  GEMINI_TOOL_INFO,
  GeminiMode,
  GeminiTool,
  QueueStatus,
} from "@/backend/types";
import { BackButton } from "@/extension/components/bulk-actions/BackButton";

import type { ResetPanelProps } from "@/extension/components/bulk-actions/types";

export const ResetPanel: React.FC<ResetPanelProps> = ({
  isDark,
  onBack,
  resetFilterType,
  setResetFilterType,
  resetTextMatch,
  setResetTextMatch,
  resetTool,
  setResetTool,
  resetMode,
  setResetMode,
  resetStatus,
  setResetStatus,
  resettableCount,
}) => {
  return (
    <div className="space-y-4">
      <BackButton isDark={isDark} onClick={onBack} />

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Reset Filter
        </label>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { type: "all", label: "All" },
              { type: "status", label: "By Status" },
              { type: "text", label: "By Text" },
              { type: "hasImages", label: "With Images" },
              { type: "tool", label: "By Tool" },
              { type: "mode", label: "By Mode" },
            ] as const
          ).map((option) => (
            <button
              key={option.type}
              onClick={() => setResetFilterType(option.type)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-all ${
                resetFilterType === option.type
                  ? "border-amber-500 bg-amber-500/20 text-amber-500"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {resetFilterType === "text" && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Text to Match
          </label>
          <input
            type="text"
            value={resetTextMatch}
            onChange={(e) => setResetTextMatch(e.target.value)}
            placeholder="e.g., landscape, portrait..."
            className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-amber-500"
          />
        </div>
      )}

      {resetFilterType === "status" && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Select Status
          </label>
          <div className="flex flex-wrap gap-2">
            {[QueueStatus.Completed, QueueStatus.Failed, QueueStatus.Processing].map((status) => (
              <button
                key={status}
                onClick={() => setResetStatus(status)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-all ${
                  resetStatus === status
                    ? "border-amber-500 bg-amber-500/20 text-amber-500"
                    : "border-border text-muted-foreground hover:border-muted-foreground/50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {resetFilterType === "tool" && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Select Tool
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.values(GeminiTool)
              .filter((t) => t !== GeminiTool.NONE)
              .map((tool) => {
                const toolInfo = GEMINI_TOOL_INFO[tool];
                return (
                  <button
                    key={tool}
                    onClick={() => setResetTool(tool)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      resetTool === tool
                        ? "border-amber-500 bg-amber-500/20 text-amber-500"
                        : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    {React.createElement(toolInfo.icon, { size: 12 })}
                    <span>{toolInfo.label}</span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {resetFilterType === "mode" && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Select Mode
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.values(GeminiMode).map((mode) => {
              const modeInfo = GEMINI_MODE_INFO[mode];
              return (
                <button
                  key={mode}
                  onClick={() => setResetMode(mode)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-all ${
                    resetMode === mode
                      ? "border-amber-500 bg-amber-500/20 text-amber-500"
                      : "border-border text-muted-foreground hover:border-muted-foreground/50"
                  }`}
                >
                  {modeInfo.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        {resetFilterType === "all" &&
          `Reset all ${resettableCount} completed/failed prompts to pending`}
        {resetFilterType === "status" && "Reset prompts with the selected status"}
        {resetFilterType === "text" && "Reset prompts containing the specified text"}
        {resetFilterType === "hasImages" && "Reset prompts that have attached images"}
        {resetFilterType === "tool" && "Reset prompts using the selected tool"}
        {resetFilterType === "mode" && "Reset prompts using the selected mode"}
      </p>
    </div>
  );
};
