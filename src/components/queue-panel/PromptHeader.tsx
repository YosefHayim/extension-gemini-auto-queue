import { Camera, Upload } from "lucide-react";
import React from "react";

import { Tooltip } from "../Tooltip";

interface PromptHeaderProps {
  isDark: boolean;
  hasImages: boolean;
  onOpenImagePicker: () => void;
  onOpenCsvDialog: () => void;
}

export const PromptHeader: React.FC<PromptHeaderProps> = ({
  isDark,
  hasImages,
  onOpenImagePicker,
  onOpenCsvDialog,
}) => {
  return (
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
          onClick={onOpenImagePicker}
          title="Attach reference images"
          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-all ${
            hasImages
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
      </div>
    </div>
  );
};
