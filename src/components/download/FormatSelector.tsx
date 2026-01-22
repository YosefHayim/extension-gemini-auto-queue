import React from "react";

import { FORMAT_INFO } from "@/utils/imagePresets";

import type { ImageFormat } from "@/types/imageProcessing";

interface FormatSelectorProps {
  selected: ImageFormat;
  onSelect: (format: ImageFormat) => void;
  isDark: boolean;
}

const FORMATS: ImageFormat[] = ["png", "jpeg", "webp"];

export const FormatSelector: React.FC<FormatSelectorProps> = ({ selected, onSelect, isDark }) => {
  return (
    <div className="space-y-2">
      <label
        className={`block text-xs font-semibold uppercase tracking-wide ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        Format
      </label>
      <div className="flex gap-2">
        {FORMATS.map((format) => {
          const info = FORMAT_INFO[format];
          const isSelected = selected === format;

          return (
            <button
              key={format}
              onClick={() => onSelect(format)}
              className={`flex-1 rounded-lg border px-3 py-2 text-center transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-500/20 text-blue-500"
                  : isDark
                    ? "border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="text-xs font-bold">{info.name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FormatSelector;
