import { Loader2, Wand2 } from "lucide-react";
import React from "react";

import type { Folder } from "@/types";

interface ImproveFolderButtonProps {
  selectedFolder: Folder;
  isDark?: boolean;
  isImproving: boolean;
  onImproveFolder: (folderId: string, e: React.MouseEvent) => void;
}

export const ImproveFolderButton: React.FC<ImproveFolderButtonProps> = ({
  selectedFolder,
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
            ? "animate-pulse bg-info text-info-foreground"
            : "bg-info/20 text-info hover:bg-info/30"
        }`}
      >
        {isImproving ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
        Improve All in Folder
      </button>
    </div>
  );
};
