import React from "react";

import { GEMINI_MODE_INFO, GeminiMode } from "@/types";

import { MODE_ICONS, MODE_SELECTOR_STYLES } from "./constants";

interface ModeSelectorProps {
  selectedMode: GeminiMode;
  onModeChange: (mode: GeminiMode) => void;
  isDark: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onModeChange,
  isDark,
}) => {
  return (
    <div
      data-onboarding="mode-selector"
      className={`inline-flex rounded-lg p-0.5 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
    >
      {Object.values(GeminiMode).map((mode) => {
        const modeInfo = GEMINI_MODE_INFO[mode];
        const isSelected = selectedMode === mode;
        const styles = MODE_SELECTOR_STYLES[mode];
        const Icon = MODE_ICONS[mode];
        return (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            title={modeInfo.description}
            className={`flex min-h-[36px] items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-all ${
              isSelected
                ? styles.selected
                : `${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`
            }`}
          >
            <Icon size={12} />
            <span>{modeInfo.label}</span>
          </button>
        );
      })}
    </div>
  );
};
