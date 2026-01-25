import { X } from "lucide-react";
import React, { useState } from "react";

interface StylePresetDialogProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onApply: (preset: string) => void;
  presets?: string[];
}

export const StylePresetDialog: React.FC<StylePresetDialogProps> = ({
  isOpen,
  isDark,
  onClose,
  onApply,
  presets = ["Photorealistic", "Anime", "Oil Painting", "Watercolor", "Sketch", "3D Render"],
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(presets[0] || "");

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(selectedPreset);
    setSelectedPreset(presets[0] || "");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`mx-4 w-full max-w-sm rounded-lg border shadow-2xl ${
          isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b p-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}
        >
          <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Select Style Preset
          </h3>
          <button
            onClick={onClose}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <label
              className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Style Preset
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className={`mt-1 w-full rounded-md border p-2.5 text-sm ${
                isDark
                  ? "border-slate-600 bg-slate-800 text-white"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            >
              {presets.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className={`flex justify-end gap-2 border-t p-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}
        >
          <button
            onClick={onClose}
            className={`rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
              isDark
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
