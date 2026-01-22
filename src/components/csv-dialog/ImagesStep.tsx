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
  isDark,
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
      <div
        className={`rounded-md border p-3 ${
          isDark ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50"
        }`}
      >
        <div className="mb-2 text-[10px] font-bold">
          Found {parsedRows.length} prompts with local image references
        </div>

        {unmatchedFiles.length > 0 ? (
          <div className="space-y-1">
            <div className="text-[9px] font-bold text-amber-400">
              Missing images ({unmatchedFiles.length}):
            </div>
            <div className="max-h-[100px] overflow-auto rounded bg-black/20 p-2">
              {unmatchedFiles.map((file, i) => (
                <div key={i} className="text-[9px] text-red-400">
                  • {file}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-[9px] text-emerald-400">
            All image references matched ({imageMap.size} images loaded)
          </div>
        )}
      </div>

      <button
        onClick={() => imageInputRef.current?.click()}
        className={`flex w-full items-center justify-center gap-2 rounded-md border p-2.5 text-xs font-black transition-all ${
          isDark
            ? "border-white/10 bg-white/5 hover:bg-white/10"
            : "border-slate-200 bg-white hover:bg-slate-50"
        }`}
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
          className={`flex-1 rounded-md border p-2 text-xs font-black ${
            isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
          }`}
        >
          Back
        </button>
        <button
          onClick={onFinish}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 p-2 text-xs font-black text-white shadow-lg transition-all hover:bg-blue-500"
        >
          <Upload size={14} />
          Import {parsedRows.length} Prompts
        </button>
      </div>

      {unmatchedFiles.length > 0 && (
        <div className="text-center text-[9px] opacity-50">
          Prompts with missing images will be imported without attachments
        </div>
      )}
    </div>
  );
};
