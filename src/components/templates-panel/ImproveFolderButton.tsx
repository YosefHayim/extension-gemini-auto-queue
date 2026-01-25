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
        className={`flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all ${
          isImproving
            ? "animate-pulse bg-blue-500 text-white"
            : isDark
              ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
        }`}
      >
        {isImproving ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
        Improve All in Folder
      </button>
    </div>
  );
};
