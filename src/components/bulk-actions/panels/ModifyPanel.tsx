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
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Text to Add
        </label>
        <textarea
          value={modifyText}
          onChange={(e) => setModifyText(e.target.value)}
          placeholder="e.g., 4K, cinematic, dramatic lighting..."
          className="min-h-[80px] w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-zinc-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Position
        </label>
        <div className="flex gap-2">
          {(["prepend", "append"] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setModifyPosition(pos)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-all ${
                modifyPosition === pos
                  ? "border-zinc-500 bg-zinc-500/20 text-zinc-700 dark:text-zinc-300"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50"
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
