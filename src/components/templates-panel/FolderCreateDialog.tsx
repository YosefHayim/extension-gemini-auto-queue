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
        className={`w-full max-w-md rounded-md border p-2 shadow-2xl ${isDark ? "glass-panel border-white/10" : "border-slate-200 bg-white"}`}
      >
        <div className="flex items-center justify-between p-2">
          <h2 className="text-sm font-black">New Folder</h2>
          <button
            onClick={onClose}
            title="Close"
            className="rounded-md p-1 transition-all hover:bg-white/5"
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
            className={`w-full rounded-md border p-2 text-xs font-bold outline-none ${
              isDark ? "border-white/10 bg-black/40" : "border-slate-200 bg-slate-50"
            }`}
          />
          <button
            onClick={onCreateFolder}
            className="w-full rounded-md bg-blue-600 p-2 text-xs font-black text-white hover:bg-blue-500"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
