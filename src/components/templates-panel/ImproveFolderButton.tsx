import { Loader2, Wand2 } from "lucide-react";
import React from "react";

import type { Folder } from "@/types";

interface ImproveFolderButtonProps {
  selectedFolder: Folder;
  isDark: boolean;
  isImproving: boolean;
  onImproveFolder: (folderId: string, e: React.MouseEvent) => void;
}

export const ImproveFolderButton: React.FC<ImproveFolderButtonProps> = ({
  selectedFolder,
  isDark,
  isImproving,
  onImproveFolder,
}) => {
  return (
    <div className="flex-shrink-0 px-2 pb-2">
      <button
        onClick={(e) => onImproveFolder(selectedFolder.id, e)}
        disabled={isImproving}
        title="Improve all templates in this folder with AI"
        className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
          isImproving
            ? "animate-pulse bg-amber-500 text-white"
            : isDark
              ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
              : "bg-amber-100 text-amber-600 hover:bg-amber-200"
        }`}
      >
        {isImproving ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
        Improve All in Folder
      </button>
    </div>
  );
};
