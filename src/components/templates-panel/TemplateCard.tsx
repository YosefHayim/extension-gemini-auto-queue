import { Image as ImageIcon, Loader2, Pencil, Plus, Trash2, Wand2 } from "lucide-react";
import React from "react";

import type { DisplayedTemplate } from "./types";

interface TemplateCardProps {
  template: DisplayedTemplate;
  isDark: boolean;
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
  isDark,
  hasAIKey,
  isImproving,
  showFolderName,
  onImprove,
  onEdit,
  onDelete,
  onUse,
}) => {
  return (
    <article
      className={`space-y-3 rounded-2xl p-4 transition-all ${
        isDark ? "bg-slate-800" : "border border-slate-200 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3
            className={`truncate text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {template.name}
          </h3>
          {showFolderName && (
            <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {template.folderName}
            </span>
          )}
        </div>
        <div className="flex flex-shrink-0 gap-1">
          {template.images && template.images.length > 0 && (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
                isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
              }`}
            >
              <ImageIcon size={10} />
              {template.images.length}
            </span>
          )}
          {template.timesUsed > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] ${
                isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
              }`}
            >
              x{template.timesUsed}
            </span>
          )}
        </div>
      </div>

      <p className={`line-clamp-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        {template.text || "No prompt text"}
      </p>

      <div className="flex justify-end gap-1 pt-2">
        <button
          onClick={(e) => hasAIKey && onImprove(template.folderId, template.id, e)}
          disabled={!hasAIKey || isImproving}
          title={hasAIKey ? "Enhance with AI" : "Configure an AI API key in Settings"}
          className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
            !hasAIKey
              ? "cursor-not-allowed opacity-30"
              : isImproving
                ? "animate-pulse bg-amber-500 text-white"
                : isDark
                  ? "text-slate-400 hover:bg-amber-500/20 hover:text-amber-400"
                  : "text-slate-500 hover:bg-amber-100 hover:text-amber-600"
          }`}
        >
          {isImproving ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          <span className="text-[9px] font-medium uppercase tracking-wide">AI</span>
        </button>

        <button
          onClick={(e) => onEdit(template.folderId, template.id, e)}
          title="Edit template"
          className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
            isDark
              ? "text-slate-400 hover:bg-slate-700 hover:text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Pencil size={16} />
          <span className="text-[9px] font-medium uppercase tracking-wide">Edit</span>
        </button>

        <button
          onClick={(e) => onDelete(template.folderId, template.id, e)}
          title="Delete template"
          className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
            isDark
              ? "text-slate-400 hover:bg-red-500/20 hover:text-red-400"
              : "text-slate-500 hover:bg-red-100 hover:text-red-600"
          }`}
        >
          <Trash2 size={16} />
          <span className="text-[9px] font-medium uppercase tracking-wide">Delete</span>
        </button>

        <button
          onClick={() => onUse(template.folderId, template.id)}
          title="Add to queue"
          className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
            isDark
              ? "text-slate-400 hover:bg-blue-500/20 hover:text-blue-400"
              : "text-slate-500 hover:bg-blue-100 hover:text-blue-600"
          }`}
        >
          <Plus size={16} />
          <span className="text-[9px] font-medium uppercase tracking-wide">Use</span>
        </button>
      </div>
    </article>
  );
};
