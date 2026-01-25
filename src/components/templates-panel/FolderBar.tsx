import { Folder as FolderIcon, FolderPlus, Layers, X } from "lucide-react";
import React from "react";

import type { Folder } from "@/types";

interface FolderBarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  totalTemplateCount: number;
  isDark?: boolean;
  onCreateFolderClick: () => void;
  onSelectFolder: (folderId: string | null) => void;
  onToggleFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string, e: React.MouseEvent) => void;
}

export const FolderBar: React.FC<FolderBarProps> = ({
  folders,
  selectedFolderId,
  totalTemplateCount,
  onCreateFolderClick,
  onSelectFolder,
  onToggleFolder,
  onDeleteFolder,
}) => {
  return (
    <div className="no-scrollbar flex-shrink-0 overflow-x-auto">
      <div className="flex flex-nowrap gap-2 p-2">
        <button
          onClick={onCreateFolderClick}
          title="Create new folder"
          className="flex flex-shrink-0 flex-col items-center gap-1 rounded-lg border-2 border-dashed border-border bg-muted px-4 py-3 transition-all hover:border-muted-foreground hover:bg-secondary"
        >
          <FolderPlus size={18} className="text-muted-foreground" />
          <span className="text-[10px] font-medium text-muted-foreground">New</span>
        </button>

        <button
          onClick={() => onSelectFolder(null)}
          className={`flex flex-shrink-0 flex-col items-center gap-1 rounded-lg px-4 py-3 transition-all ${
            selectedFolderId === null
              ? "bg-card shadow-sm"
              : "bg-muted opacity-60 hover:opacity-100"
          }`}
        >
          <Layers size={18} className="text-info" />
          <span className="max-w-[60px] truncate text-[10px] font-medium text-muted-foreground">
            All ({totalTemplateCount})
          </span>
        </button>

        {folders.map((folder) => (
          <div key={folder.id} className="group/folder relative flex-shrink-0">
            <button
              onClick={() => {
                onSelectFolder(folder.id);
                onToggleFolder(folder.id);
              }}
              className={`flex flex-col items-center gap-1 rounded-lg px-4 py-3 transition-all ${
                selectedFolderId === folder.id
                  ? "bg-card shadow-sm"
                  : "bg-muted opacity-60 hover:opacity-100"
              }`}
            >
              <FolderIcon size={18} className="text-amber-500" />
              <span className="max-w-[60px] truncate text-[10px] font-medium text-muted-foreground">
                {folder.name}
              </span>
            </button>
            <button
              onClick={(e) => onDeleteFolder(folder.id, e)}
              title="Delete folder"
              className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-sm transition-all hover:bg-red-600 group-hover/folder:opacity-100"
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
