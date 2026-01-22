import { BookMarked } from "lucide-react";
import React from "react";

interface EmptyStateProps {
  isDark: boolean;
  selectedFolderId: string | null;
  hasFolders: boolean;
  onCreateTemplate: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isDark,
  selectedFolderId,
  hasFolders,
  onCreateTemplate,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 ${isDark ? "opacity-30" : "opacity-40"}`}
    >
      <BookMarked size={32} className={isDark ? "text-slate-400" : "text-slate-500"} />
      <span
        className={`mt-2 text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}
      >
        No Templates
      </span>
      {selectedFolderId !== null && hasFolders && (
        <button
          onClick={onCreateTemplate}
          className={`mt-4 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            isDark
              ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
          }`}
        >
          Create First Template
        </button>
      )}
    </div>
  );
};
