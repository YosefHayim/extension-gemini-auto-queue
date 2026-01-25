import { X } from "lucide-react";
import React, { useMemo } from "react";

import { BackButton } from "@/extension/components/bulk-actions/BackButton";

import type { RemoveFilesPanelProps } from "@/extension/components/bulk-actions/types";

export const RemoveFilesPanel: React.FC<RemoveFilesPanelProps> = ({
  isDark,
  onBack,
  allUniqueImages,
  selectedImagesForRemoval,
  setSelectedImagesForRemoval,
  pendingItems,
}) => {
  const matchingFilePrompts = useMemo(() => {
    if (selectedImagesForRemoval.length === 0) return [];
    const selectedImageSet = new Set(selectedImagesForRemoval.map((idx) => allUniqueImages[idx]));
    return pendingItems
      .map((item, index) => ({ item, position: index + 1 }))
      .filter(({ item }) => item.images?.some((img) => selectedImageSet.has(img)));
  }, [pendingItems, selectedImagesForRemoval, allUniqueImages]);

  return (
    <div className="space-y-4">
      <BackButton isDark={isDark} onClick={onBack} />

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Select Images to Remove
        </label>
        <div className="grid grid-cols-4 gap-2">
          {allUniqueImages.map((img, idx) => (
            <label
              key={idx}
              className={`relative cursor-pointer rounded-lg border-2 p-0.5 transition-all ${
                selectedImagesForRemoval.includes(idx)
                  ? "border-rose-500 bg-rose-500/10"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedImagesForRemoval.includes(idx)}
                onChange={() => {
                  setSelectedImagesForRemoval((prev) =>
                    prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                  );
                }}
              />
              <img
                src={img}
                className="h-14 w-full rounded object-cover"
                alt={`Attached image ${idx + 1}`}
              />
              {selectedImagesForRemoval.includes(idx) && (
                <div className="absolute inset-0 flex items-center justify-center rounded bg-rose-500/30">
                  <X size={20} className="text-white" />
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSelectedImagesForRemoval(allUniqueImages.map((_, i) => i))}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold uppercase text-muted-foreground transition-all hover:border-rose-500 hover:text-rose-500"
        >
          Select All
        </button>
        <button
          onClick={() => setSelectedImagesForRemoval([])}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold uppercase text-muted-foreground transition-all hover:border-muted-foreground/50"
        >
          Clear
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        {selectedImagesForRemoval.length} of {allUniqueImages.length} image
        {allUniqueImages.length !== 1 ? "s" : ""} selected for removal
      </p>

      {matchingFilePrompts.length > 0 && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Affected Prompts ({matchingFilePrompts.length})
          </label>
          <div className="max-h-[100px] space-y-1.5 overflow-y-auto">
            {matchingFilePrompts.map(({ item, position }) => (
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
        </div>
      )}
    </div>
  );
};
