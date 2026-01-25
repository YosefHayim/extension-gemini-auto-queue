import { Image as ImageIcon, Loader2, Pencil, Plus, Trash2, Wand2 } from "lucide-react";
import React from "react";

import type { DisplayedTemplate } from "./types";

interface TemplateCardProps {
  template: DisplayedTemplate;
  isDark?: boolean;
  hasAIKey: boolean;
  isImproving: boolean;
  showFolderName: boolean;
  onImprove: (folderId: string, templateId: string, e: React.MouseEvent) => void;
  onEdit: (folderId: string, templateId: string, e: React.MouseEvent) => void;
  onDelete: (folderId: string, templateId: string, e: React.MouseEvent) => void;
  onUse: (folderId: string, templateId: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  hasAIKey,
  isImproving,
  showFolderName,
  onImprove,
  onEdit,
  onDelete,
  onUse,
}) => {
  return (
    <article className="space-y-3 rounded-lg border border-border bg-card p-4 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">{template.name}</h3>
          {showFolderName && (
            <span className="text-[10px] text-muted-foreground">{template.folderName}</span>
          )}
        </div>
        <div className="flex flex-shrink-0 gap-1">
          {template.images && template.images.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <ImageIcon size={10} />
              {template.images.length}
            </span>
          )}
          {template.timesUsed > 0 && (
            <span className="rounded-full bg-info/20 px-2 py-0.5 text-[10px] font-medium text-info">
              x{template.timesUsed}
            </span>
          )}
        </div>
      </div>

      <p className="line-clamp-2 text-xs text-muted-foreground">
        {template.text || "No prompt text"}
      </p>

      <div className="flex justify-end gap-1 pt-2">
        <button
          onClick={(e) => hasAIKey && onImprove(template.folderId, template.id, e)}
          disabled={!hasAIKey || isImproving}
          title={hasAIKey ? "Enhance with AI" : "Configure an AI API key in Settings"}
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
            !hasAIKey
              ? "cursor-not-allowed opacity-30"
              : isImproving
                ? "animate-pulse bg-info text-info-foreground"
                : "bg-info/20 text-info hover:bg-info/30"
          }`}
        >
          {isImproving ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
        </button>

        <button
          onClick={(e) => onEdit(template.folderId, template.id, e)}
          title="Edit template"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        >
          <Pencil size={14} />
        </button>

        <button
          onClick={(e) => onDelete(template.folderId, template.id, e)}
          title="Delete template"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-destructive/20 hover:text-destructive"
        >
          <Trash2 size={14} />
        </button>

        <button
          onClick={() => onUse(template.folderId, template.id)}
          title="Add to queue"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-success/20 hover:text-success"
        >
          <Plus size={14} />
        </button>
      </div>
    </article>
  );
};
