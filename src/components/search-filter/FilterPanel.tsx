import React from "react";

import {
  ContentType,
  GEMINI_MODE_INFO,
  GEMINI_TOOL_INFO,
  GeminiMode,
  GeminiTool,
  QueueStatus,
} from "@/types";

import { MODE_PILL_STYLES, CONTENT_TYPE_INFO, STATUS_INFO } from "./constants";

interface FilterPanelProps {
  selectedTools: GeminiTool[];
  onToolToggle: (tool: GeminiTool) => void;
  selectedModes: GeminiMode[];
  onModeToggle: (mode: GeminiMode) => void;
  selectedContentTypes: ContentType[];
  onContentTypeToggle: (type: ContentType) => void;
  selectedStatuses: QueueStatus[];
  onStatusToggle: (status: QueueStatus) => void;
  isDark: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedTools,
  onToolToggle,
  selectedModes,
  onModeToggle,
  selectedContentTypes,
  onContentTypeToggle,
  selectedStatuses,
  onStatusToggle,
  isDark,
}) => {
  const allTools = Object.values(GeminiTool);
  const allModes = Object.values(GeminiMode);

  return (
    <div
      className={`border-t px-3 py-3 ${
        isDark ? "border-white/5 bg-white/[0.01]" : "border-slate-100 bg-slate-50/50"
      }`}
    >
      <div className="mb-3">
        <div
          className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${
            isDark ? "text-white/40" : "text-slate-500"
          }`}
        >
          Filter by Tool
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allTools.map((tool) => {
            const toolInfo = GEMINI_TOOL_INFO[tool];
            const isSelected = selectedTools.includes(tool);
            return (
              <button
                key={tool}
                onClick={() => onToolToggle(tool)}
                title={toolInfo.description}
                className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold transition-all duration-200 ${
                  isSelected
                    ? isDark
                      ? "border-white/30 bg-white/15 text-white shadow-sm"
                      : "border-slate-400 bg-slate-700 text-white shadow-sm"
                    : isDark
                      ? "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                {React.createElement(toolInfo.icon, { size: 10 })}
                <span>{toolInfo.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div
          className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${
            isDark ? "text-white/40" : "text-slate-500"
          }`}
        >
          Filter by Mode
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allModes.map((mode) => {
            const modeInfo = GEMINI_MODE_INFO[mode];
            const isSelected = selectedModes.includes(mode);
            const pillStyles = MODE_PILL_STYLES[mode];
            return (
              <button
                key={mode}
                onClick={() => onModeToggle(mode)}
                title={modeInfo.description}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-all duration-200 ${
                  isSelected
                    ? `${pillStyles.selected} shadow-sm`
                    : `${pillStyles.unselected} bg-transparent`
                }`}
              >
                {modeInfo.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3">
        <div
          className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${
            isDark ? "text-white/40" : "text-slate-500"
          }`}
        >
          Filter by Content
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.values(ContentType).map((type) => {
            const typeInfo = CONTENT_TYPE_INFO[type];
            const isSelected = selectedContentTypes.includes(type);
            const Icon = typeInfo.icon;
            return (
              <button
                key={type}
                onClick={() => onContentTypeToggle(type)}
                className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold transition-all duration-200 ${
                  isSelected
                    ? isDark
                      ? "border-white/30 bg-white/15 text-white shadow-sm"
                      : "border-slate-400 bg-slate-700 text-white shadow-sm"
                    : isDark
                      ? "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <Icon size={10} />
                <span>{typeInfo.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3">
        <div
          className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${
            isDark ? "text-white/40" : "text-slate-500"
          }`}
        >
          Filter by Status
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.values(QueueStatus).map((status) => {
            const statusInfo = STATUS_INFO[status];
            const isSelected = selectedStatuses.includes(status);
            const Icon = statusInfo.icon;
            return (
              <button
                key={status}
                onClick={() => onStatusToggle(status)}
                title={`Filter by ${statusInfo.label} items`}
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-all duration-200 ${
                  isSelected
                    ? `${statusInfo.selectedStyle} shadow-sm`
                    : `${statusInfo.unselectedStyle} bg-transparent`
                }`}
              >
                <Icon
                  size={10}
                  className={status === QueueStatus.Processing ? "animate-spin" : ""}
                />
                <span>{statusInfo.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
