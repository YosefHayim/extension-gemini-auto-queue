import React from "react";

import { EmptyState } from "./EmptyState";
import { TemplateCard } from "./TemplateCard";

import type { DisplayedTemplate } from "./types";

interface TemplateListProps {
  templates: DisplayedTemplate[];
  isDark: boolean;
  hasAIKey: boolean;
  improvingIds: Set<string>;
  selectedFolderId: string | null;
  hasFolders: boolean;
  onImprove: (folderId: string, templateId: string, e: React.MouseEvent) => void;
  onEdit: (folderId: string, templateId: string, e: React.MouseEvent) => void;
  onDelete: (folderId: string, templateId: string, e: React.MouseEvent) => void;
  onUse: (folderId: string, templateId: string) => void;
  onCreateNewTemplate: (e: React.MouseEvent) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  isDark,
  hasAIKey,
  improvingIds,
  selectedFolderId,
  hasFolders,
  onImprove,
  onEdit,
  onDelete,
  onUse,
  onCreateNewTemplate,
}) => {
  return (
    <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-2 py-3">
      {templates.length > 0 ? (
        templates.map((template) => (
          <TemplateCard
            key={`${template.folderId}-${template.id}`}
            template={template}
            isDark={isDark}
            hasAIKey={hasAIKey}
            isImproving={improvingIds.has(template.id)}
            showFolderName={selectedFolderId === null}
            onImprove={onImprove}
            onEdit={onEdit}
            onDelete={onDelete}
            onUse={onUse}
          />
        ))
      ) : (
        <EmptyState isDark={isDark} selectedFolderId={selectedFolderId} hasFolders={hasFolders} />
      )}

      {selectedFolderId !== null && templates.length > 0 && (
        <button
          onClick={onCreateNewTemplate}
          className="w-full rounded-lg border-2 border-dashed border-border p-3 text-xs font-medium text-muted-foreground transition-all hover:border-muted-foreground hover:text-foreground"
        >
          + New Template
        </button>
      )}
    </div>
  );
};
