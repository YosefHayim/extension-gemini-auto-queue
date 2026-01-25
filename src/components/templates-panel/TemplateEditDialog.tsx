import { ChevronDown, FilePlus, Folder, ImagePlus, Plus, X } from "lucide-react";
import React, { useRef, useState } from "react";

import { GeminiTool, GEMINI_TOOL_INFO } from "@/types";

import type { EditingTemplateState } from "./types";
import type { Folder as FolderType } from "@/types";

interface TemplateEditDialogProps {
  editingTemplate: EditingTemplateState | null;
  folders: FolderType[];
  isDark: boolean;
  onTemplateChange: (template: EditingTemplateState | null) => void;
  onSave: () => void;
  onClose: () => void;
}

export const TemplateEditDialog: React.FC<TemplateEditDialogProps> = ({
  editingTemplate,
  folders,
  isDark: _isDark,
  onTemplateChange,
  onSave,
  onClose,
}) => {
  const templateImageInputRef = useRef<HTMLInputElement>(null);
  const [activeImageTab, setActiveImageTab] = useState<"upload" | "icon">("upload");
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [showToolDropdown, setShowToolDropdown] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!editingTemplate) return null;

  const isNewTemplate = !editingTemplate.template.createdAt;
  const selectedFolder = folders.find((f) => f.id === editingTemplate.folderId);
  const selectedTool = editingTemplate.template.tool ?? GeminiTool.NONE;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const readPromises = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target?.result as string;
          resolve(data);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((newImages) => {
      onTemplateChange({
        ...editingTemplate,
        template: {
          ...editingTemplate.template,
          images: [...(editingTemplate.template.images ?? []), ...newImages],
        },
      });
    });

    e.target.value = "";
  };

  const handleRemoveImage = (idx: number) => {
    onTemplateChange({
      ...editingTemplate,
      template: {
        ...editingTemplate.template,
        images: editingTemplate.template.images?.filter((_, i) => i !== idx),
      },
    });
  };

  const handleFolderSelect = (folderId: string) => {
    onTemplateChange({
      ...editingTemplate,
      folderId,
    });
    setShowFolderDropdown(false);
  };

  const handleToolSelect = (tool: GeminiTool) => {
    onTemplateChange({
      ...editingTemplate,
      template: {
        ...editingTemplate.template,
        tool,
      },
    });
    setShowToolDropdown(false);
  };

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-[380px] overflow-hidden rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100">
              <FilePlus size={20} className="text-blue-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-semibold text-card-foreground">
                {isNewTemplate ? "New Template" : "Edit Template"}
              </span>
              <span className="text-[13px] text-muted-foreground">
                {isNewTemplate ? "Save prompt for reuse" : "Modify template details"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded bg-secondary p-1.5 transition-colors hover:bg-secondary/80"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">Template Name</label>
            <input
              autoFocus
              value={editingTemplate.template.name ?? ""}
              onChange={(e) =>
                onTemplateChange({
                  ...editingTemplate,
                  template: { ...editingTemplate.template, name: e.target.value },
                })
              }
              onKeyDown={(e) => e.key === "Enter" && onSave()}
              placeholder="Neon City Night Scene"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
            />
          </div>

          <div className="relative flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">Folder</label>
            <button
              type="button"
              onClick={() => setShowFolderDropdown(!showFolderDropdown)}
              className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:border-ring"
            >
              <div className="flex items-center gap-2">
                <Folder size={16} className="text-muted-foreground" />
                <span>{selectedFolder?.name ?? "Select folder"}</span>
              </div>
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
            {showFolderDropdown && (
              <div className="bg-popover absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border shadow-lg">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => handleFolderSelect(folder.id)}
                    className={`text-popover-foreground flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted ${folder.id === editingTemplate.folderId ? "bg-muted" : ""}`}
                  >
                    <Folder
                      size={14}
                      style={{ color: folder.color ?? "var(--muted-foreground)" }}
                    />
                    <span>{folder.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">Prompt</label>
            <textarea
              value={editingTemplate.template.text ?? ""}
              onChange={(e) =>
                onTemplateChange({
                  ...editingTemplate,
                  template: { ...editingTemplate.template, text: e.target.value },
                })
              }
              placeholder="A cyberpunk city at night with neon lights reflecting on wet streets, flying cars overhead, and holographic advertisements..."
              rows={4}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
            />
          </div>

          <div className="relative flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">Default Tool</label>
            <button
              type="button"
              onClick={() => setShowToolDropdown(!showToolDropdown)}
              className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:border-ring"
            >
              <div className="flex items-center gap-2">
                {React.createElement(GEMINI_TOOL_INFO[selectedTool].icon, {
                  size: 16,
                  className: "text-muted-foreground",
                })}
                <span>{GEMINI_TOOL_INFO[selectedTool].label}</span>
              </div>
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
            {showToolDropdown && (
              <div className="bg-popover absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border shadow-lg">
                {Object.entries(GEMINI_TOOL_INFO).map(([tool, config]) => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => handleToolSelect(tool as GeminiTool)}
                    className={`text-popover-foreground flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted ${(tool as GeminiTool) === selectedTool ? "bg-muted" : ""}`}
                  >
                    {React.createElement(config.icon, {
                      size: 14,
                      className: "text-muted-foreground",
                    })}
                    <span>{config.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">
              Default Images (optional)
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveImageTab("upload")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition-colors ${
                  activeImageTab === "upload"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-muted-foreground"
                }`}
              >
                <ImagePlus size={14} />
                <span>Upload</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveImageTab("icon")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition-colors ${
                  activeImageTab === "icon"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-muted-foreground"
                }`}
              >
                <Folder size={14} />
                <span>From Folder</span>
              </button>
            </div>

            <div
              onClick={() => templateImageInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-4 transition-colors hover:border-ring"
            >
              <input
                ref={templateImageInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {!editingTemplate.template.images || editingTemplate.template.images.length === 0 ? (
                <>
                  <ImagePlus size={24} className="text-muted-foreground" />
                  <span className="text-[13px] text-muted-foreground">
                    Click or drag images here
                  </span>
                </>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {editingTemplate.template.images.map((img, idx) => (
                    <div key={idx} className="group relative" onClick={(e) => e.stopPropagation()}>
                      <img
                        src={img}
                        className="h-14 w-14 rounded-md border border-border object-cover"
                        alt="ref"
                      />
                      <button
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white shadow-md transition-transform hover:scale-110"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <span className="text-xs text-muted-foreground">
              Choose from presets or upload custom images
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} />
            <span>{isNewTemplate ? "Create Template" : "Save Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
