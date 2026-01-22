import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";

import { ASPECT_RATIOS, FORMAT_INFO, SIZE_PRESETS } from "@/utils/imagePresets";

import type { ProcessingOptions } from "@/types/imageProcessing";

interface AdvancedOptionsPanelProps {
  options: ProcessingOptions;
  onChange: (options: ProcessingOptions) => void;
  isDark: boolean;
}

export const AdvancedOptionsPanel: React.FC<AdvancedOptionsPanelProps> = ({
  options,
  onChange,
  isDark,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const formatInfo = FORMAT_INFO[options.format];

  const handleCustomWidth = (value: string) => {
    const width = parseInt(value, 10) || 0;
    onChange({
      ...options,
      size: { ...options.size, type: "custom", width, height: options.size.height ?? 0 },
    });
  };

  const handleCustomHeight = (value: string) => {
    const height = parseInt(value, 10) || 0;
    onChange({
      ...options,
      size: { ...options.size, type: "custom", width: options.size.width ?? 0, height },
    });
  };

  const handleAspectRatio = (ratioId: string) => {
    onChange({
      ...options,
      size: { type: "aspectRatio", aspectRatioId: ratioId },
    });
  };

  const handlePresetChange = (presetId: string) => {
    onChange({
      ...options,
      size: { type: "preset", presetId },
    });
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-wide ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        Advanced Options
      </button>

      {isOpen && (
        <div
          className={`space-y-4 rounded-lg border p-3 ${
            isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="space-y-2">
            <label
              className={`block text-[10px] font-semibold uppercase tracking-wide ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Custom Dimensions
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Width"
                value={options.size.type === "custom" ? options.size.width || "" : ""}
                onChange={(e) => handleCustomWidth(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-xs outline-none transition-colors ${
                  isDark
                    ? "border-slate-600 bg-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500"
                }`}
              />
              <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>×</span>
              <input
                type="number"
                placeholder="Height"
                value={options.size.type === "custom" ? options.size.height || "" : ""}
                onChange={(e) => handleCustomHeight(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-xs outline-none transition-colors ${
                  isDark
                    ? "border-slate-600 bg-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500"
                }`}
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.maintainAspectRatio}
                onChange={(e) => onChange({ ...options, maintainAspectRatio: e.target.checked })}
                className="rounded border-slate-300"
              />
              <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Maintain aspect ratio
              </span>
            </label>
          </div>

          <div className="space-y-2">
            <label
              className={`block text-[10px] font-semibold uppercase tracking-wide ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Aspect Ratio
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => handleAspectRatio(ratio.id)}
                  className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${
                    options.size.type === "aspectRatio" && options.size.aspectRatioId === ratio.id
                      ? "border-blue-500 bg-blue-500/20 text-blue-500"
                      : isDark
                        ? "border-slate-600 text-slate-400 hover:border-slate-500"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {ratio.id}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label
              className={`block text-[10px] font-semibold uppercase tracking-wide ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              All Presets
            </label>
            <select
              value={options.size.type === "preset" ? options.size.presetId : ""}
              onChange={(e) => handlePresetChange(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-xs outline-none transition-colors ${
                isDark
                  ? "border-slate-600 bg-slate-700 text-white focus:border-blue-500"
                  : "border-slate-200 bg-white text-slate-900 focus:border-blue-500"
              }`}
            >
              <option value="">Select preset...</option>
              {SIZE_PRESETS.filter((p) => p.id !== "original").map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} ({preset.width}×{preset.height})
                </option>
              ))}
            </select>
          </div>

          {formatInfo.supportsQuality && (
            <div className="space-y-2">
              <label
                className={`block text-[10px] font-semibold uppercase tracking-wide ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Quality: {options.quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={options.quality}
                onChange={(e) => onChange({ ...options, quality: parseInt(e.target.value, 10) })}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedOptionsPanel;
