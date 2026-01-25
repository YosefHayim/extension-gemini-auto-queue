import { BookMarked } from "lucide-react";
import React from "react";

interface EmptyStateProps {
  isDark?: boolean;
  selectedFolderId: string | null;
  hasFolders: boolean;
  onCreateTemplate: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  selectedFolderId,
  hasFolders,
  onCreateTemplate,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 opacity-40">
      <BookMarked size={32} className="text-muted-foreground" />
      <span className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        No Templates
      </span>
      {selectedFolderId !== null && hasFolders && (
        <button
          onClick={onCreateTemplate}
          className="mt-4 rounded-lg bg-info/20 px-4 py-2 text-xs font-semibold text-info transition-all hover:bg-info/30"
        >
          Create First Template
        </button>
      )}
    </div>
  );
};
