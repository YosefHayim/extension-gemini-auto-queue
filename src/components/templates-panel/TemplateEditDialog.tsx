import React, { useRef, useState } from "react";
import { ChevronDown, FilePlus, Folder, ImagePlus, Plus, X } from "lucide-react";

import { GeminiTool, GEMINI_TOOL_INFO } from "@/types";
import type { Folder as FolderType } from "@/types";

import type { EditingTemplateState } from "./types";

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
  isDark,
  onTemplateChange,
  onSave,
  onClose,
}) => {
  const templateImageInputRef = useRef<HTMLInputElement>(null);
  const [activeImageTab, setActiveImageTab] = useState<"upload" | "icon">("upload");
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [showToolDropdown, setShowToolDropdown] = useState(false);

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
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-[380px] overflow-hidden rounded-lg border shadow-lg ${
          isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-white"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b p-5 ${
            isDark ? "border-zinc-700" : "border-zinc-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100">
              <FilePlus size={20} className="text-blue-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span
                className={`text-base font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}
              >
                {isNewTemplate ? "New Template" : "Edit Template"}
              </span>
              <span className={`text-[13px] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                {isNewTemplate ? "Save prompt for reuse" : "Modify template details"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`rounded p-1.5 transition-colors ${
              isDark ? "bg-zinc-800 hover:bg-zinc-700" : "bg-zinc-100 hover:bg-zinc-200"
            }`}
          >
            <X size={16} className={isDark ? "text-zinc-400" : "text-zinc-500"} />
          </button>
        </div>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto p-5">
          <div className="flex flex-col gap-1.5">
            <label className={`text-sm font-medium ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
              Template Name
            </label>
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
              className={`w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-colors ${
                isDark
                  ? "border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:border-zinc-500"
                  : "border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:border-zinc-400"
              }`}
            />
          </div>

          <div className="relative flex flex-col gap-1.5">
            <label className={`text-sm font-medium ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
              Folder
            </label>
            <button
              type="button"
              onClick={() => setShowFolderDropdown(!showFolderDropdown)}
              className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors ${
                isDark
                  ? "border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-600"
                  : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder size={16} className={isDark ? "text-zinc-400" : "text-zinc-500"} />
                <span>{selectedFolder?.name ?? "Select folder"}</span>
              </div>
              <ChevronDown size={16} className={isDark ? "text-zinc-400" : "text-zinc-500"} />
            </button>
            {showFolderDropdown && (
              <div
                className={`absolute left-0 top-full z-10 mt-1 w-full rounded-md border shadow-lg ${
                  isDark ? "border-zinc-700 bg-zinc-800" : "border-zinc-200 bg-white"
                }`}
              >
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => handleFolderSelect(folder.id)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      isDark ? "text-zinc-100 hover:bg-zinc-700" : "text-zinc-900 hover:bg-zinc-100"
                    } ${folder.id === editingTemplate.folderId ? (isDark ? "bg-zinc-700" : "bg-zinc-100") : ""}`}
                  >
                    <Folder
                      size={14}
                      style={{ color: folder.color ?? (isDark ? "#71717a" : "#a1a1aa") }}
                    />
                    <span>{folder.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`text-sm font-medium ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
              Prompt
            </label>
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
              className={`w-full resize-none rounded-md border px-3 py-3 text-sm leading-relaxed outline-none transition-colors ${
                isDark
                  ? "border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:border-zinc-500"
                  : "border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:border-zinc-400"
              }`}
            />
          </div>

          <div className="relative flex flex-col gap-1.5">
            <label className={`text-sm font-medium ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
              Default Tool
            </label>
            <button
              type="button"
              onClick={() => setShowToolDropdown(!showToolDropdown)}
              className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors ${
                isDark
                  ? "border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-600"
                  : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {React.createElement(GEMINI_TOOL_INFO[selectedTool].icon, {
                  size: 16,
                  className: isDark ? "text-zinc-400" : "text-zinc-500",
                })}
                <span>{GEMINI_TOOL_INFO[selectedTool].label}</span>
              </div>
              <ChevronDown size={16} className={isDark ? "text-zinc-400" : "text-zinc-500"} />
            </button>
            {showToolDropdown && (
              <div
                className={`absolute left-0 top-full z-10 mt-1 w-full rounded-md border shadow-lg ${
                  isDark ? "border-zinc-700 bg-zinc-800" : "border-zinc-200 bg-white"
                }`}
              >
                {Object.entries(GEMINI_TOOL_INFO).map(([tool, config]) => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => handleToolSelect(tool as GeminiTool)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      isDark ? "text-zinc-100 hover:bg-zinc-700" : "text-zinc-900 hover:bg-zinc-100"
                    } ${tool === selectedTool ? (isDark ? "bg-zinc-700" : "bg-zinc-100") : ""}`}
                  >
                    {React.createElement(config.icon, {
                      size: 14,
                      className: isDark ? "text-zinc-400" : "text-zinc-500",
                    })}
                    <span>{config.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`text-sm font-medium ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
              Default Images (optional)
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveImageTab("upload")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition-colors ${
                  activeImageTab === "upload"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : isDark
                      ? "border border-zinc-700 bg-zinc-900 text-zinc-300"
                      : "border border-zinc-200 bg-white text-zinc-600"
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
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : isDark
                      ? "border border-zinc-700 bg-zinc-900 text-zinc-300"
                      : "border border-zinc-200 bg-white text-zinc-600"
                }`}
              >
                <Folder size={14} />
                <span>From Folder</span>
              </button>
            </div>

            <div
              onClick={() => templateImageInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border px-4 py-4 transition-colors ${
                isDark
                  ? "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              }`}
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
                  <ImagePlus size={24} className={isDark ? "text-zinc-500" : "text-zinc-400"} />
                  <span className={`text-[13px] ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                    Click or drag images here
                  </span>
                </>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {editingTemplate.template.images.map((img, idx) => (
                    <div key={idx} className="group relative" onClick={(e) => e.stopPropagation()}>
                      <img
                        src={img}
                        className={`h-14 w-14 rounded-md border object-cover ${
                          isDark ? "border-zinc-700" : "border-zinc-200"
                        }`}
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

            <span className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
              Choose from presets or upload custom images
            </span>
          </div>
        </div>

        <div
          className={`flex items-center justify-end gap-3 border-t p-5 ${
            isDark ? "border-zinc-700" : "border-zinc-200"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
              isDark
                ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus size={16} />
            <span>{isNewTemplate ? "Create Template" : "Save Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
