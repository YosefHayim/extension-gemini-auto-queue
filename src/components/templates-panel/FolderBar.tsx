import {
  Briefcase,
  Camera,
  Coffee,
  Folder as FolderIcon,
  FolderPlus,
  Gamepad2,
  Heart,
  Layers,
  Music,
  Palette,
  Pencil,
  Plus,
  Rocket,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";
import React from "react";

import type { Folder, FolderIcon as FolderIconType } from "@/types";
import type { LucideIcon } from "lucide-react";

const ICON_COMPONENTS: Record<FolderIconType, LucideIcon> = {
  folder: FolderIcon,
  star: Star,
  heart: Heart,
  zap: Zap,
  rocket: Rocket,
  sparkles: Sparkles,
  briefcase: Briefcase,
  palette: Palette,
  camera: Camera,
  music: Music,
  "gamepad-2": Gamepad2,
  coffee: Coffee,
};

interface FolderBarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  totalTemplateCount: number;
  isDark?: boolean;
  onCreateFolderClick: () => void;
  onSelectFolder: (folderId: string | null) => void;
  onToggleFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string, e: React.MouseEvent) => void;
  onEditFolder?: (folder: Folder) => void;
  onCreateTemplate?: (folderId: string) => void;
}

export const FolderBar: React.FC<FolderBarProps> = ({
  folders,
  selectedFolderId,
  totalTemplateCount,
  onCreateFolderClick,
  onSelectFolder,
  onToggleFolder,
  onDeleteFolder,
  onEditFolder,
  onCreateTemplate,
}) => {
  const getFolderIcon = (folder: Folder) => {
    const iconName = (folder.icon ?? "folder") as FolderIconType;
    const IconComponent = ICON_COMPONENTS[iconName];
    const iconColor = folder.color ?? "#F59E0B";
    return <IconComponent size={18} style={{ color: iconColor }} />;
  };

  return (
    <div className="flex-shrink-0 overflow-y-auto" style={{ maxHeight: "180px" }}>
      <div className="flex flex-wrap gap-2 p-2">
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
              {getFolderIcon(folder)}
              <span className="max-w-[60px] truncate text-[10px] font-medium text-muted-foreground">
                {folder.name}
              </span>
            </button>
            <div className="absolute -right-1 -top-1 flex gap-0.5 opacity-0 transition-all group-hover/folder:opacity-100">
              {onCreateTemplate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateTemplate(folder.id);
                  }}
                  title="Add template"
                  className="rounded-full bg-emerald-500 p-1 text-white shadow-sm transition-all hover:bg-emerald-600"
                >
                  <Plus size={10} />
                </button>
              )}
              {onEditFolder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditFolder(folder);
                  }}
                  title="Edit folder"
                  className="rounded-full bg-blue-500 p-1 text-white shadow-sm transition-all hover:bg-blue-600"
                >
                  <Pencil size={10} />
                </button>
              )}
              <button
                onClick={(e) => onDeleteFolder(folder.id, e)}
                title="Delete folder"
                className="rounded-full bg-red-500 p-1 text-white shadow-sm transition-all hover:bg-red-600"
              >
                <X size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
