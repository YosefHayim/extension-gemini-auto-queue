import React from "react";

import { BackButton } from "@/extension/components/bulk-actions/BackButton";

import type { AIOptimizePanelProps } from "@/extension/components/bulk-actions/types";

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
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Instructions for AI
        </label>
        <textarea
          value={aiInstructions}
          onChange={(e) => setAiInstructions(e.target.value)}
          placeholder="e.g., Make more detailed, add cinematic lighting, improve composition..."
          className="min-h-[100px] w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-violet-500"
        />
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          AI will enhance each prompt based on these instructions
        </p>
      </div>
    </div>
  );
};
