import { FolderOpen, Upload } from "lucide-react";
import React from "react";

import type { ParsedRow } from "./types";

interface ImagesStepProps {
  isDark: boolean;
  parsedRows: ParsedRow[];
  imageMap: Map<string, string>;
  imageInputRef: React.RefObject<HTMLInputElement>;
  unmatchedFiles: string[];
  onBack: () => void;
  onFinish: () => void;
  onImageFilesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImagesStep: React.FC<ImagesStepProps> = ({
  parsedRows,
  imageMap,
  imageInputRef,
  unmatchedFiles,
  onBack,
  onFinish,
  onImageFilesUpload,
}) => {
  return (
    <div className="space-y-2 p-2">
      <div className="rounded-md border border-border bg-muted p-3">
        <div className="mb-2 text-[10px] font-bold text-foreground">
          Found {parsedRows.length} prompts with local image references
        </div>

        {unmatchedFiles.length > 0 ? (
          <div className="space-y-1">
            <div className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
              Missing images ({unmatchedFiles.length}):
            </div>
            <div className="max-h-[100px] overflow-auto rounded bg-destructive/10 p-2">
              {unmatchedFiles.map((file, i) => (
                <div key={i} className="text-[9px] text-destructive">
                  • {file}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-[9px] text-emerald-600 dark:text-emerald-400">
            All image references matched ({imageMap.size} images loaded)
          </div>
        )}
      </div>

      <button
        onClick={() => imageInputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-muted p-2.5 text-xs font-black text-foreground transition-all hover:bg-muted/80"
      >
        <FolderOpen size={16} />
        {imageMap.size > 0 ? `Add More Images (${imageMap.size} loaded)` : "Select Image Files"}
      </button>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onImageFilesUpload}
      />

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 rounded-md border border-border bg-muted p-2 text-xs font-black text-foreground transition-all hover:bg-muted/80"
        >
          Back
        </button>
        <button
          onClick={onFinish}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary p-2 text-xs font-black text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
        >
          <Upload size={14} />
          Import {parsedRows.length} Prompts
        </button>
      </div>

      {unmatchedFiles.length > 0 && (
        <div className="text-center text-[9px] text-muted-foreground">
          Prompts with missing images will be imported without attachments
        </div>
      )}
    </div>
  );
};
