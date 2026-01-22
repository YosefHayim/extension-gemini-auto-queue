import { Folder as FolderIcon, FolderPlus, Layers, X } from "lucide-react";
import React from "react";

import type { Folder } from "@/types";

interface FolderBarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  totalTemplateCount: number;
  isDark: boolean;
  onCreateFolderClick: () => void;
  onSelectFolder: (folderId: string | null) => void;
  onToggleFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string, e: React.MouseEvent) => void;
}

export const FolderBar: React.FC<FolderBarProps> = ({
  folders,
  selectedFolderId,
  totalTemplateCount,
  isDark,
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
          className={`flex flex-shrink-0 flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-3 transition-all ${
            isDark
              ? "border-slate-600 bg-slate-800/50 hover:border-blue-500/50 hover:bg-slate-800"
              : "border-slate-300 bg-slate-100/50 hover:border-blue-400 hover:bg-slate-100"
          }`}
        >
          <FolderPlus size={20} className={isDark ? "text-slate-400" : "text-slate-500"} />
          <span
            className={`text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            New
          </span>
        </button>

        <button
          onClick={() => onSelectFolder(null)}
          className={`flex flex-shrink-0 flex-col items-center gap-1 rounded-xl px-4 py-3 transition-all ${
            selectedFolderId === null
              ? isDark
                ? "bg-slate-700 shadow-md"
                : "bg-slate-200 shadow-md"
              : isDark
                ? "bg-slate-800/50 opacity-60 hover:opacity-100"
                : "bg-slate-100/50 opacity-60 hover:opacity-100"
          }`}
        >
          <Layers size={20} className={isDark ? "text-blue-400" : "text-blue-500"} />
          <span
            className={`max-w-[60px] truncate text-[10px] font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
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
              className={`flex flex-col items-center gap-1 rounded-xl px-4 py-3 transition-all ${
                selectedFolderId === folder.id
                  ? isDark
                    ? "bg-slate-700 shadow-md"
                    : "bg-slate-200 shadow-md"
                  : isDark
                    ? "bg-slate-800/50 opacity-60 hover:opacity-100"
                    : "bg-slate-100/50 opacity-60 hover:opacity-100"
              }`}
            >
              <FolderIcon size={20} className={isDark ? "text-amber-400" : "text-amber-500"} />
              <span
                className={`max-w-[60px] truncate text-[10px] font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                {folder.name}
              </span>
            </button>
            <button
              onClick={(e) => onDeleteFolder(folder.id, e)}
              title="Delete folder"
              className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-lg transition-all hover:bg-red-600 group-hover/folder:opacity-100"
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
