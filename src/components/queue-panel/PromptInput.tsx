import { Camera, Upload } from "lucide-react";
import React, { useRef } from "react";

import { Tooltip } from "../Tooltip";

import { ImagePreview } from "./ImagePreview";
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

  const handleRemoveImage = (index: number) => {
    onImagesChange(selectedImages.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="flex items-center text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          New Prompt
          <Tooltip
            text="Enter prompts separated by blank lines. Each paragraph (text between blank lines) becomes one prompt. Multi-line paragraphs are joined into a single prompt."
            isDark={isDark}
          />
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={() => imageInputRef.current?.click()}
            title="Attach reference images"
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-all ${
              selectedImages.length > 0
                ? "text-indigo-500 dark:text-indigo-400"
                : isDark
                  ? "text-slate-500 hover:text-slate-300"
                  : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Camera size={16} />
          </button>
          <button
            onClick={onOpenCsvDialog}
            title="Import prompts from CSV"
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-all ${
              isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Upload size={16} />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      <div className="relative">
        <textarea
          data-onboarding="queue-textarea"
          ref={textareaRef}
          value={bulkInput}
          onChange={(e) => {
            onBulkInputChange(e.target.value);
          }}
          onSelect={handleTextSelection}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              onEnqueue();
            }
          }}
          placeholder="Enter prompts separated by blank lines..."
          className={`max-h-[280px] min-h-[120px] w-full overflow-y-auto rounded-lg border p-3 pb-14 text-sm leading-relaxed outline-none transition-all ${
            isDark
              ? "border-slate-700 bg-slate-900 placeholder:text-slate-600 focus:border-indigo-500/60"
              : "border-slate-200 bg-white placeholder:text-slate-400 focus:border-indigo-500/60"
          }`}
        />

        <WeightingToolbar
          selection={selection}
          onApplyWeight={applyWeight}
          onClearSelection={() => onSelectionChange(null)}
        />

        <ImagePreview images={selectedImages} onRemoveImage={handleRemoveImage} />

        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
          {promptPreviewCount > 0 && (
            <span
              className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
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
            className="min-h-[44px] rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-indigo-600/25 transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to Queue
          </button>
        </div>
      </div>
    </>
  );
};
