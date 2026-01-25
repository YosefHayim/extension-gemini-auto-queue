import React from "react";

import { GEMINI_TOOL_INFO, GeminiTool } from "@/backend/types";

interface ToolSelectorProps {
  selectedTool: GeminiTool;
  onToolChange: (tool: GeminiTool) => void;
  isDark?: boolean;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({ selectedTool, onToolChange }) => {
  return (
    <div data-onboarding="tool-selector" className="inline-flex gap-1 rounded-md bg-muted p-1">
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
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
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
