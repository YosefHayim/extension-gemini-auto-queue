import { X } from "lucide-react";
import React from "react";

interface FolderCreateDialogProps {
  isOpen: boolean;
  isDark: boolean;
  newFolderName: string;
  onFolderNameChange: (name: string) => void;
  onCreateFolder: () => void;
  onClose: () => void;
}

export const FolderCreateDialog: React.FC<FolderCreateDialogProps> = ({
  isOpen,
  isDark,
  newFolderName,
  onFolderNameChange,
  onCreateFolder,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md">
      <div
        className={`w-full max-w-md rounded-lg border p-4 shadow-2xl ${isDark ? "glass-panel border-border" : "border-border bg-card"}`}
      >
        <div className="flex items-center justify-between p-2">
          <h2 className="text-sm font-black text-foreground">New Folder</h2>
          <button
            onClick={onClose}
            title="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md text-foreground transition-all hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-2 p-2">
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => {
              onFolderNameChange(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && onCreateFolder()}
            placeholder="Folder Name"
            className={`w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring`}
          />
          <button
            onClick={onCreateFolder}
            className="w-full rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:bg-emerald-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
