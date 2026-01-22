import React from "react";
import { BackButton } from "../BackButton";
import type { AIOptimizePanelProps } from "../types";

export const AIOptimizePanel: React.FC<AIOptimizePanelProps> = ({
  isDark,
  onBack,
  aiInstructions,
  setAiInstructions,
}) => {
  return (
    <div className="space-y-4">
      <BackButton isDark={isDark} onClick={onBack} />

      <div>
        <label
          className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          Instructions for AI
        </label>
        <textarea
          value={aiInstructions}
          onChange={(e) => setAiInstructions(e.target.value)}
          placeholder="e.g., Make more detailed, add cinematic lighting, improve composition..."
          className={`min-h-[100px] w-full rounded-lg border p-3 text-sm outline-none transition-colors ${
            isDark
              ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-violet-500"
              : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500"
          }`}
        />
        <p className={`mt-1.5 text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          AI will enhance each prompt based on these instructions
        </p>
      </div>
    </div>
  );
};
