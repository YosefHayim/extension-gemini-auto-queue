import React from "react";

import { BackButton } from "../BackButton";

import type { ModifyPanelProps } from "../types";

export const ModifyPanel: React.FC<ModifyPanelProps> = ({
  isDark,
  onBack,
  modifyText,
  setModifyText,
  modifyPosition,
  setModifyPosition,
}) => {
  return (
    <div className="space-y-4">
      <BackButton isDark={isDark} onClick={onBack} />

      <div>
        <label
          className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          Text to Add
        </label>
        <textarea
          value={modifyText}
          onChange={(e) => setModifyText(e.target.value)}
          placeholder="e.g., 4K, cinematic, dramatic lighting..."
          className={`min-h-[80px] w-full rounded-lg border p-3 text-sm outline-none transition-colors ${
            isDark
              ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500"
              : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500"
          }`}
        />
      </div>

      <div>
        <label
          className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          Position
        </label>
        <div className="flex gap-2">
          {(["prepend", "append"] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setModifyPosition(pos)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-all ${
                modifyPosition === pos
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-500"
                  : isDark
                    ? "border-slate-700 text-slate-400 hover:border-slate-600"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {pos === "prepend" ? "Before" : "After"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
