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
  onCreateTemplate: () => void;
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
  onCreateTemplate,
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
        <EmptyState
          isDark={isDark}
          selectedFolderId={selectedFolderId}
          hasFolders={hasFolders}
          onCreateTemplate={onCreateTemplate}
        />
      )}

      {selectedFolderId !== null && templates.length > 0 && (
        <button
          onClick={onCreateNewTemplate}
          className={`w-full rounded-xl border-2 border-dashed p-4 text-xs font-semibold uppercase tracking-wide transition-all ${
            isDark
              ? "border-slate-700 text-slate-500 hover:border-blue-500/50 hover:text-blue-400"
              : "border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500"
          }`}
        >
          + New Template
        </button>
      )}
    </div>
  );
};
