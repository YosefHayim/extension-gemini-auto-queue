import { CheckCircle, Video } from "lucide-react";
import React from "react";

import type { DownloadableFile } from "@/types/imageProcessing";

interface FileGridProps {
  files: DownloadableFile[];
  isDark: boolean;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (fileId: string) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({
  files,
  isDark,
  selectable = false,
  selectedIds,
  onToggleSelection,
}) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {files.map((file) => {
        const isSelected = selectedIds?.has(file.id);

        if (selectable && onToggleSelection) {
          return (
            <button
              key={file.id}
              onClick={() => onToggleSelection(file.id)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-blue-500 ring-2 ring-blue-500/30"
                  : isDark
                    ? "border-slate-700 hover:border-slate-600"
                    : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <FileContent file={file} isDark={isDark} />
              {isSelected && (
                <div className="absolute right-1 top-1 rounded-full bg-blue-500 p-0.5">
                  <CheckCircle size={12} className="text-white" />
                </div>
              )}
            </button>
          );
        }

        return (
          <div
            key={file.id}
            className={`relative aspect-square overflow-hidden rounded-lg border ${
              isDark ? "border-slate-700" : "border-slate-200"
            }`}
          >
            <FileContent file={file} isDark={isDark} />
          </div>
        );
      })}
    </div>
  );
};

interface FileContentProps {
  file: DownloadableFile;
  isDark: boolean;
}

const FileContent: React.FC<FileContentProps> = ({ file, isDark }) => {
  if (file.type === "image") {
    return (
      <img
        src={file.thumbnail ?? file.url}
        alt={file.promptPreview}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center ${
        isDark ? "bg-slate-800" : "bg-slate-100"
      }`}
    >
      <Video size={24} className={isDark ? "text-slate-500" : "text-slate-400"} />
    </div>
  );
};
