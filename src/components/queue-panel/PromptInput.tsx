import React, { useRef } from "react";

import { ImagePreview } from "./ImagePreview";
import { PromptHeader } from "./PromptHeader";
import { WeightingToolbar } from "./WeightingToolbar";

import type { TextSelection } from "./types";

interface PromptInputProps {
  bulkInput: string;
  onBulkInputChange: (value: string) => void;
  selectedImages: string[];
  onImagesChange: (images: string[]) => void;
  selection: TextSelection | null;
  onSelectionChange: (selection: TextSelection | null) => void;
  promptPreviewCount: number;
  onEnqueue: () => void;
  onOpenCsvDialog: () => void;
  isDark: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  bulkInput,
  onBulkInputChange,
  selectedImages,
  onImagesChange,
  selection,
  onSelectionChange,
  promptPreviewCount,
  onEnqueue,
  onOpenCsvDialog,
  isDark,
  textareaRef,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = textareaRef.current.value.substring(start, end);
      if (text.trim().length > 0) {
        onSelectionChange({ start, end, text });
      } else {
        onSelectionChange(null);
      }
    }
  };

  const applyWeight = (mode: "standard" | "heavy" | "ultra" | "echo") => {
    if (!selection || !textareaRef.current) return;
    const { start, end, text } = selection;
    const currentVal = textareaRef.current.value;
    let newChunk = "";

    switch (mode) {
      case "standard":
        newChunk = `(${text}:1.2)`;
        break;
      case "heavy":
        newChunk = `((${text}:1.5))`;
        break;
      case "ultra":
        newChunk = `(((${text}:1.8)))`;
        break;
      case "echo":
        newChunk = `${text}... ${text}`;
        break;
    }

    const newVal = currentVal.substring(0, start) + newChunk + currentVal.substring(end);
    onBulkInputChange(newVal);
    onSelectionChange(null);
    textareaRef.current.focus();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const readPromises = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target?.result as string;
          resolve(data);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((newImages) => {
      onImagesChange([...selectedImages, ...newImages]);
    });

    e.target.value = "";
  };

  return (
    <>
      <PromptHeader
        isDark={isDark}
        hasImages={selectedImages.length > 0}
        onOpenImagePicker={() => imageInputRef.current?.click()}
        onOpenCsvDialog={onOpenCsvDialog}
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <div className="relative">
        <textarea
          data-onboarding="queue-textarea"
          ref={textareaRef}
          value={bulkInput}
          onChange={(e) => onBulkInputChange(e.target.value)}
          onSelect={handleTextSelection}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              onEnqueue();
            }
          }}
          placeholder="Enter your prompts here...

Separate multiple prompts with blank lines. Each paragraph becomes a separate queue item."
          className={`max-h-[280px] min-h-[120px] w-full overflow-y-auto rounded-md border p-3 pb-14 text-[13px] leading-relaxed outline-none transition-all ${
            isDark
              ? "border-slate-700 bg-slate-900 placeholder:text-slate-500 focus:border-slate-500"
              : "border-slate-200 bg-white placeholder:text-slate-400 focus:border-slate-400"
          }`}
        />

        <WeightingToolbar
          selection={selection}
          onApplyWeight={applyWeight}
          onClearSelection={() => onSelectionChange(null)}
        />

        <ImagePreview
          images={selectedImages}
          onRemoveImage={(index) => onImagesChange(selectedImages.filter((_, i) => i !== index))}
        />

        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
          {promptPreviewCount > 0 && (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
              }`}
            >
              {promptPreviewCount} prompt{promptPreviewCount !== 1 ? "s" : ""}
            </span>
          )}
          <button
            data-onboarding="add-queue-btn"
            onClick={onEnqueue}
            disabled={promptPreviewCount === 0 && selectedImages.length === 0}
            title="Add prompt to processing queue (Ctrl+Enter)"
            className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
              isDark
                ? "bg-slate-100 text-slate-900 hover:bg-white"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Add
          </button>
        </div>
      </div>
    </>
  );
};
