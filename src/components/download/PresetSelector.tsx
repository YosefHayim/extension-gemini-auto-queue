import { Monitor, Smartphone, Square, Image } from "lucide-react";
import React from "react";

import { QUICK_PRESETS } from "@/utils/imagePresets";

interface PresetSelectorProps {
  selected: string;
  onSelect: (presetId: string) => void;
  isDark: boolean;
}

const ICON_MAP = {
  image: Image,
  monitor: Monitor,
  smartphone: Smartphone,
  square: Square,
} as const;

export const PresetSelector: React.FC<PresetSelectorProps> = ({ selected, onSelect, isDark }) => {
  return (
    <div className="space-y-2">
      <label
        className={`block text-xs font-semibold uppercase tracking-wide ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        Size
      </label>
      <div className="grid grid-cols-4 gap-2">
        {QUICK_PRESETS.map((preset) => {
          const Icon = ICON_MAP[preset.icon];
          const isSelected = selected === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => onSelect(preset.id)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-center transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-500/20 text-blue-500"
                  : isDark
                    ? "border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Icon size={16} />
              <span className="text-[10px] font-medium">{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PresetSelector;
