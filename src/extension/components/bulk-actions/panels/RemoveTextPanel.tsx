import React, { useMemo } from "react";

import { BackButton } from "@/extension/components/bulk-actions/BackButton";

import type { RemoveTextPanelProps } from "@/extension/components/bulk-actions/types";

export const RemoveTextPanel: React.FC<RemoveTextPanelProps> = ({
  isDark,
  onBack,
  textToRemove,
  setTextToRemove,
  pendingCount,
  pendingItems,
}) => {
  const textMatchCount = useMemo(() => {
    if (!textToRemove.trim()) return 0;
    return pendingItems.filter((item) =>
      item.finalPrompt.toLowerCase().includes(textToRemove.toLowerCase())
    ).length;
  }, [pendingItems, textToRemove]);

  const matchingTextPrompts = useMemo(() => {
    if (!textToRemove.trim()) return [];
    return pendingItems
      .map((item, index) => ({ item, position: index + 1 }))
      .filter(({ item }) => item.finalPrompt.toLowerCase().includes(textToRemove.toLowerCase()));
  }, [pendingItems, textToRemove]);

  return (
    <div className="space-y-4">
      <BackButton isDark={isDark} onClick={onBack} />

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Text to Remove
        </label>
        <input
          type="text"
          value={textToRemove}
          onChange={(e) => setTextToRemove(e.target.value)}
          placeholder="Enter text to remove from all prompts..."
          className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-rose-500"
        />
      </div>

      {textToRemove.trim() && (
        <>
          <p className="text-[11px] text-muted-foreground">
            Found in {textMatchCount} of {pendingCount} pending prompt
            {pendingCount !== 1 ? "s" : ""}
          </p>
          {matchingTextPrompts.length > 0 && (
            <div className="max-h-[140px] space-y-1.5 overflow-y-auto">
              {matchingTextPrompts.map(({ item, position }) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2"
                >
                  <span className="flex-shrink-0 rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-500">
                    #{position}
                  </span>
                  <p className="line-clamp-2 text-[11px] leading-tight text-muted-foreground">
                    {item.finalPrompt}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
