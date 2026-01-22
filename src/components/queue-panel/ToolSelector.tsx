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
    <div data-onboarding="tool-selector" className="flex flex-wrap gap-1">
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
              className={`flex min-h-[44px] items-center gap-1 rounded-md px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wide transition-all ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-sm"
                  : isDark
                    ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
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
