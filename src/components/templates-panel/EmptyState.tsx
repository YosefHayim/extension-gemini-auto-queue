import { BookMarked } from "lucide-react";
import React from "react";

interface EmptyStateProps {
  isDark?: boolean;
  selectedFolderId: string | null;
  hasFolders: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ selectedFolderId, hasFolders }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 opacity-40">
      <BookMarked size={32} className="text-muted-foreground" />
      <span className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        No Templates
      </span>
      {selectedFolderId !== null && hasFolders && (
        <span className="mt-2 text-[10px] text-muted-foreground">
          Hover over a folder and click + to add
        </span>
      )}
    </div>
  );
};
