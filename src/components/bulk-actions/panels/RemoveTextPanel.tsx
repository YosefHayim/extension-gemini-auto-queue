import React, { useMemo } from "react";

import { BackButton } from "../BackButton";

import type { RemoveTextPanelProps } from "../types";

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
        <label
          className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          Text to Remove
        </label>
        <input
          type="text"
          value={textToRemove}
          onChange={(e) => setTextToRemove(e.target.value)}
          placeholder="Enter text to remove from all prompts..."
          className={`w-full rounded-lg border p-3 text-sm outline-none transition-colors ${
            isDark
              ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-rose-500"
              : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-rose-500"
          }`}
        />
      </div>

      {textToRemove.trim() && (
        <>
          <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Found in {textMatchCount} of {pendingCount} pending prompt
            {pendingCount !== 1 ? "s" : ""}
          </p>
          {matchingTextPrompts.length > 0 && (
            <div className="max-h-[140px] space-y-1.5 overflow-y-auto">
              {matchingTextPrompts.map(({ item, position }) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-2 rounded-lg border p-2 ${
                    isDark ? "border-rose-500/30 bg-rose-500/10" : "border-rose-200 bg-rose-50"
                  }`}
                >
                  <span
                    className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      isDark ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    #{position}
                  </span>
                  <p
                    className={`line-clamp-2 text-[11px] leading-tight ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
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
