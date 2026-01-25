import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Camera,
  Coffee,
  Folder,
  FolderPlus,
  Gamepad2,
  Heart,
  Music,
  Palette,
  Pencil,
  Rocket,
  Sparkles,
  Star,
  Upload,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { FOLDER_COLORS, FOLDER_ICONS } from "@/types";
import type { Folder as FolderType, FolderIcon } from "@/types";

interface FolderCreateDialogProps {
  isOpen: boolean;
  isDark?: boolean;
  newFolderName: string;
  onFolderNameChange: (name: string) => void;
  onCreateFolder: (color?: string, icon?: string) => void;
  onClose: () => void;
  editingFolder?: FolderType | null;
  onUpdateFolder?: (folderId: string, name: string, color?: string, icon?: string) => void;
}

const ICON_COMPONENTS: Record<FolderIcon, LucideIcon> = {
  folder: Folder,
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

export const FolderCreateDialog: React.FC<FolderCreateDialogProps> = ({
  isOpen,
  newFolderName,
  onFolderNameChange,
  onCreateFolder,
  onClose,
  editingFolder,
  onUpdateFolder,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(FOLDER_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<FolderIcon | null>(null);
  const [iconTab, setIconTab] = useState<"upload" | "choose">("choose");

  const isEditMode = Boolean(editingFolder);

  useEffect(() => {
    if (editingFolder) {
      setSelectedColor(editingFolder.color ?? FOLDER_COLORS[0]);
      setSelectedIcon((editingFolder.icon as FolderIcon) ?? null);
    } else {
      setSelectedColor(FOLDER_COLORS[0]);
      setSelectedIcon(null);
    }
  }, [editingFolder]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (isEditMode && editingFolder && onUpdateFolder) {
      onUpdateFolder(editingFolder.id, newFolderName, selectedColor, selectedIcon ?? undefined);
    } else {
      onCreateFolder(selectedColor, selectedIcon ?? undefined);
    }
    resetState();
  };

  const resetState = () => {
    setSelectedColor(FOLDER_COLORS[0]);
    setSelectedIcon(null);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md">
      <div className="flex w-[340px] flex-col rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
              {isEditMode ? (
                <Pencil size={20} className="text-foreground" />
              ) : (
                <FolderPlus size={20} className="text-foreground" />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-semibold text-foreground">
                {isEditMode ? "Edit Folder" : "New Folder"}
              </span>
              <span className="text-[13px] text-muted-foreground">
                {isEditMode ? "Modify folder settings" : "Organize your templates"}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            title="Close"
            className="flex h-7 w-7 items-center justify-center rounded-sm bg-secondary text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Folder Name</label>
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => onFolderNameChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && newFolderName.trim() && handleSubmit()}
              placeholder="Enter folder name..."
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Folder Color</label>
            <div className="flex w-full gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  title={`Select color ${color}`}
                  className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    boxShadow:
                      selectedColor === color ? `0 0 0 2px ${color}, 0 0 0 4px white` : "none",
                    border: selectedColor === color ? "2px solid white" : "none",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Folder Icon (optional)</label>
            <div className="flex w-full gap-2">
              <button
                onClick={() => setIconTab("upload")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-[13px] font-medium transition-colors ${
                  iconTab === "upload"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                <Upload size={14} />
                Upload Image
              </button>
              <button
                onClick={() => setIconTab("choose")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-[13px] font-medium transition-colors ${
                  iconTab === "choose"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                <Sparkles size={14} />
                Choose Icon
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Choose from presets or upload custom image
            </p>

            {iconTab === "choose" && (
              <div className="rounded-md border border-border bg-background p-3">
                <div className="grid grid-cols-6 gap-2">
                  {FOLDER_ICONS.map((iconName) => {
                    const IconComponent = ICON_COMPONENTS[iconName];
                    const isSelected = selectedIcon === iconName;
                    return (
                      <button
                        key={iconName}
                        onClick={() => setSelectedIcon(isSelected ? null : iconName)}
                        title={`Select ${iconName} icon`}
                        className={`flex h-11 w-11 items-center justify-center rounded-sm transition-colors ${
                          isSelected
                            ? "border-2 border-primary bg-primary text-primary-foreground"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        }`}
                      >
                        <IconComponent size={20} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {iconTab === "upload" && (
              <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border bg-background">
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Upload size={20} />
                  <span className="text-xs">Click to upload image</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border p-5">
          <button
            onClick={handleClose}
            className="rounded-md bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!newFolderName.trim()}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:bg-primary/90 disabled:opacity-50"
          >
            {isEditMode ? <Pencil size={16} /> : <FolderPlus size={16} />}
            {isEditMode ? "Save Changes" : "Create Folder"}
          </button>
        </div>
      </div>
    </div>
  );
};
