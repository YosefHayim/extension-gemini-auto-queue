import React from "react";

import { GEMINI_TOOL_INFO, GeminiTool } from "@/types";

interface ToolSelectorProps {
  selectedTool: GeminiTool;
  onToolChange: (tool: GeminiTool) => void;
  isDark: boolean;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({
  selectedTool,
  onToolChange,
  isDark,
}) => {
  return (
    <div
      data-onboarding="tool-selector"
      className={`inline-flex gap-1 rounded-md p-1 ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}
    >
      {Object.entries(GEMINI_TOOL_INFO)
        .filter(([tool]) => (tool as GeminiTool) !== GeminiTool.NONE)
        .map(([tool, info]) => {
          const toolEnum = tool as GeminiTool;
          const isSelected = selectedTool === toolEnum;
          return (
            <button
              key={tool}
              onClick={() => {
                onToolChange(toolEnum);
              }}
              title={info.description}
              className={`flex items-center gap-1.5 rounded px-3 py-2 text-xs font-medium transition-all ${
                isSelected
                  ? isDark
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-900 shadow-sm"
                  : isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span>{React.createElement(info.icon, { size: 14 })}</span>
              <span className="hidden sm:inline">{info.label}</span>
            </button>
          );
        })}
    </div>
  );
};
