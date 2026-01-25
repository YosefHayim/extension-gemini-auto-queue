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
          className="max-h-[280px] min-h-[120px] w-full overflow-y-auto rounded-md border border-border bg-background p-3 pb-14 text-[13px] leading-relaxed text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring"
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

        {promptPreviewCount > 0 && (
          <div className="absolute bottom-2.5 right-2.5">
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {promptPreviewCount} prompt{promptPreviewCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <button
        data-onboarding="add-queue-btn"
        onClick={onEnqueue}
        disabled={promptPreviewCount === 0 && selectedImages.length === 0}
        title="Add prompt to processing queue (Ctrl+Enter)"
        className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Add to Queue
      </button>
    </>
  );
};
