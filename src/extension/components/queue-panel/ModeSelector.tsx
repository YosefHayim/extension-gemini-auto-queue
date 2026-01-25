import React from "react";

import { GEMINI_MODE_INFO, GeminiMode } from "@/backend/types";

import { MODE_ICONS, MODE_SELECTOR_STYLES } from "@/extension/components/queue-panel/constants";

interface ModeSelectorProps {
  selectedMode: GeminiMode;
  onModeChange: (mode: GeminiMode) => void;
  isDark?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onModeChange }) => {
  return (
    <div data-onboarding="mode-selector" className="inline-flex gap-1 rounded-md bg-muted p-1">
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
            className={`flex items-center gap-1.5 rounded px-3 py-2 text-xs font-medium transition-all ${
              isSelected ? styles.selected : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} />
            <span>{modeInfo.label}</span>
          </button>
        );
      })}
    </div>
  );
};
