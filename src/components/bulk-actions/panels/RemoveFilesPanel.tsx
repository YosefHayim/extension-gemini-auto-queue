import { X } from "lucide-react";
import React, { useMemo } from "react";
import { BackButton } from "../BackButton";
import type { RemoveFilesPanelProps } from "../types";

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
        <label
          className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          Select Images to Remove
        </label>
        <div className="grid grid-cols-4 gap-2">
          {allUniqueImages.map((img, idx) => (
            <label
              key={idx}
              className={`relative cursor-pointer rounded-lg border-2 p-0.5 transition-all ${
                selectedImagesForRemoval.includes(idx)
                  ? "border-rose-500 bg-rose-500/10"
                  : isDark
                    ? "border-slate-700 hover:border-slate-600"
                    : "border-slate-200 hover:border-slate-300"
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
          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-all ${
            isDark
              ? "border-slate-700 text-slate-400 hover:border-rose-500 hover:text-rose-400"
              : "border-slate-200 text-slate-500 hover:border-rose-500 hover:text-rose-500"
          }`}
        >
          Select All
        </button>
        <button
          onClick={() => setSelectedImagesForRemoval([])}
          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-all ${
            isDark
              ? "border-slate-700 text-slate-400 hover:border-slate-600"
              : "border-slate-200 text-slate-500 hover:border-slate-300"
          }`}
        >
          Clear
        </button>
      </div>

      <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
        {selectedImagesForRemoval.length} of {allUniqueImages.length} image
        {allUniqueImages.length !== 1 ? "s" : ""} selected for removal
      </p>

      {matchingFilePrompts.length > 0 && (
        <div>
          <label
            className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Affected Prompts ({matchingFilePrompts.length})
          </label>
          <div className="max-h-[100px] space-y-1.5 overflow-y-auto">
            {matchingFilePrompts.map(({ item, position }) => (
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
        </div>
      )}
    </div>
  );
};
