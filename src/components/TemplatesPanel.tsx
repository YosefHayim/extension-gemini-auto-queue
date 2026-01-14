import {
  BookMarked,
  ChevronDown,
  Folder as FolderIcon,
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import React, { useRef, useState } from "react";

import type { Folder, PromptTemplate } from "@/types";

import { Tooltip } from "./Tooltip";

interface TemplatesPanelProps {
  folders: Folder[];
  isDark: boolean;
  hasAIKey: boolean; // Whether any AI API key is configured
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onUseTemplate: (folderId: string, templateId: string) => void;
  onDeleteTemplate: (folderId: string, templateId: string) => void;
  onSaveTemplate: (folderId: string, template: Partial<PromptTemplate>) => void;
  onImproveTemplate: (folderId: string, templateId: string) => Promise<void>;
  onImproveFolder: (folderId: string) => Promise<void>;
}

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  folders,
  isDark,
  hasAIKey,
  onCreateFolder,
  onDeleteFolder,
  onToggleFolder,
  onUseTemplate,
  onDeleteTemplate,
  onSaveTemplate,
  onImproveTemplate,
  onImproveFolder,
}) => {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [improvingIds, setImprovingIds] = useState<Set<string>>(new Set());
  const [editingTemplate, setEditingTemplate] = useState<{
    folderId: string;
    template: Partial<PromptTemplate>;
  } | null>(null);

  const templateImageInputRef = useRef<HTMLInputElement>(null);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim());
    setNewFolderName("");
    setIsCreatingFolder(false);
  };

  const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete folder and all templates inside?")) return;
    onDeleteFolder(id);
  };

  const handleDeleteTemplate = (folderId: string, templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this template?")) return;
    onDeleteTemplate(folderId, templateId);
  };

  const handleStartTemplateEdit = (folderId: string, templateId?: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (templateId) {
      const folder = folders.find((f) => f.id === folderId);
      const template = folder?.templates.find((t) => t.id === templateId);
      if (template) setEditingTemplate({ folderId, template: { ...template } });
    } else {
      setEditingTemplate({
        folderId,
        template: {
          id: Math.random().toString(36).substring(2, 9),
          name: "",
          text: "",
          createdAt: Date.now(),
          lastEditedAt: Date.now(),
          timesUsed: 0,
          images: [],
        },
      });
    }
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate?.template.name) return;
    onSaveTemplate(editingTemplate.folderId, editingTemplate.template);
    setEditingTemplate(null);
  };

  const handleImproveTemplate = async (
    folderId: string,
    templateId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setImprovingIds((prev) => new Set(prev).add(templateId));
    try {
      await onImproveTemplate(folderId, templateId);
    } finally {
      setImprovingIds((prev) => {
        const next = new Set(prev);
        next.delete(templateId);
        return next;
      });
    }
  };

  const handleImproveFolder = async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    const idsToImprove = folder.templates.map((t) => t.id);
    setImprovingIds((prev) => new Set([...Array.from(prev), ...idsToImprove, folderId]));

    try {
      await onImproveFolder(folderId);
    } finally {
      setImprovingIds((prev) => {
        const next = new Set(prev);
        idsToImprove.forEach((id) => next.delete(id));
        next.delete(folderId);
        return next;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    // Read all files in parallel and collect results before updating state
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
      if (editingTemplate) {
        setEditingTemplate((prev) =>
          prev
            ? {
                ...prev,
                template: {
                  ...prev.template,
                  images: [...(prev.template.images ?? []), ...newImages],
                },
              }
            : null
        );
      }
    });

    e.target.value = "";
  };

  return (
    <>
      <div className="animate-in fade-in space-y-2 duration-300">
        <div className="flex items-center justify-between px-1">
          <span className="flex items-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Collections
            <Tooltip
              text="Organize your favorite prompts into folders. Use AI to improve them!"
              isDark={isDark}
            />
          </span>
          <button
            onClick={() => {
              setIsCreatingFolder(true);
            }}
            title="Create new folder"
            className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500 transition-colors duration-150 hover:bg-indigo-500 hover:text-white"
          >
            <FolderPlus size={14} />
          </button>
        </div>

        <div className="space-y-2">
          {folders.map((folder) => (
            <div key={folder.id} className="space-y-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onToggleFolder(folder.id);
                  }}
                  className={`flex min-h-[44px] flex-1 items-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-colors duration-150 ${
                    isDark
                      ? "border-slate-700 bg-slate-800/50 hover:bg-slate-800"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <FolderIcon size={14} className="text-indigo-500" />
                  <span className="flex-1 text-left">{folder.name}</span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${folder.isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <button
                  onClick={(e) => hasAIKey && handleImproveFolder(folder.id, e)}
                  disabled={!hasAIKey || improvingIds.has(folder.id)}
                  title={
                    hasAIKey
                      ? "Improve all prompts in folder"
                      : "Configure an AI API key in Settings to enable prompt optimization"
                  }
                  className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 transition-colors duration-150 ${
                    !hasAIKey
                      ? "cursor-not-allowed bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600"
                      : improvingIds.has(folder.id)
                        ? "animate-pulse bg-amber-500 text-white"
                        : "bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white"
                  }`}
                >
                  {improvingIds.has(folder.id) ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Wand2 size={14} />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    handleDeleteFolder(folder.id, e);
                  }}
                  title="Delete folder"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-red-500/10 p-2 text-red-500 transition-colors duration-150 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {folder.isOpen && (
                <div className="animate-in slide-in-from-top-1 mt-1.5 space-y-1.5">
                  {folder.templates.map((template) => (
                    <div
                      key={template.id}
                      className={`group flex flex-col rounded-lg border p-3 transition-colors duration-150 ${
                        isDark
                          ? "border-slate-700 bg-slate-800/30 hover:border-indigo-500/30"
                          : "border-slate-100 bg-white hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="min-w-0 flex-1 cursor-pointer"
                          onClick={() => {
                            onUseTemplate(folder.id, template.id);
                          }}
                        >
                          <p className="truncate text-xs font-semibold text-indigo-500">
                            {template.name}
                          </p>
                          <p className="truncate text-[11px] text-slate-400">"{template.text}"</p>
                        </div>
                        <div className="flex gap-1 opacity-0 transition-all group-hover:opacity-100">
                          <button
                            onClick={(e) =>
                              hasAIKey && handleImproveTemplate(folder.id, template.id, e)
                            }
                            disabled={!hasAIKey || improvingIds.has(template.id)}
                            title={
                              hasAIKey
                                ? "Enhance with AI"
                                : "Configure an AI API key in Settings to enable prompt optimization"
                            }
                            className={`rounded-md p-1 transition-all ${
                              !hasAIKey
                                ? "cursor-not-allowed text-white/20"
                                : improvingIds.has(template.id)
                                  ? "animate-pulse bg-amber-500 text-white"
                                  : "text-amber-500 hover:bg-amber-500/20"
                            }`}
                          >
                            {improvingIds.has(template.id) ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Wand2 size={12} />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              handleStartTemplateEdit(folder.id, template.id, e);
                            }}
                            title="Edit template"
                            className="rounded-md p-1 hover:bg-blue-500/20"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              handleDeleteTemplate(folder.id, template.id, e);
                            }}
                            title="Delete template"
                            className="rounded-md p-1 text-red-500 hover:bg-red-500/20"
                          >
                            <Trash2 size={12} />
                          </button>
                          <button
                            onClick={() => {
                              onUseTemplate(folder.id, template.id);
                            }}
                            title="Add to queue"
                            className="rounded-md bg-blue-600 p-1 text-white shadow-lg"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={(e) => {
                      handleStartTemplateEdit(folder.id, undefined, e);
                    }}
                    title="Create new template"
                    className="min-h-[44px] w-full rounded-md border-2 border-dashed border-white/5 p-2 text-xs font-black uppercase opacity-20 transition-all hover:opacity-100"
                  >
                    New Style
                  </button>
                </div>
              )}
            </div>
          ))}
          {folders.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-white/5 py-12 opacity-10">
              <BookMarked size={24} />
              <span className="text-xs font-black uppercase tracking-widest">Library Empty</span>
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {isCreatingFolder && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md">
          <div
            className={`w-full max-w-md rounded-md border p-2 shadow-2xl ${isDark ? "glass-panel border-white/10" : "border-slate-200 bg-white"}`}
          >
            <div className="flex items-center justify-between p-2">
              <h2 className="text-sm font-black">New Folder</h2>
              <button
                onClick={() => {
                  setIsCreatingFolder(false);
                }}
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
                  setNewFolderName(e.target.value);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                placeholder="Folder Name"
                className={`w-full rounded-md border p-2 text-xs font-bold outline-none ${
                  isDark ? "border-white/10 bg-black/40" : "border-slate-200 bg-slate-50"
                }`}
              />
              <button
                onClick={handleCreateFolder}
                className="w-full rounded-md bg-blue-600 p-2 text-xs font-black text-white hover:bg-blue-500"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md">
          <div
            className={`w-full max-w-xl rounded-md border p-2 shadow-2xl ${isDark ? "glass-panel border-white/10" : "border-slate-200 bg-white"}`}
          >
            <div className="flex items-center justify-between p-2">
              <h2 className="text-sm font-black">
                {editingTemplate.template.createdAt ? "Refine Prompt" : "New Library Entry"}
              </h2>
              <button
                onClick={() => {
                  setEditingTemplate(null);
                }}
                title="Close"
                className="rounded-md p-1 hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 p-2">
              <div className="space-y-1">
                <label className="ml-1 text-xs font-black uppercase opacity-40">
                  Template Title
                </label>
                <input
                  autoFocus
                  value={editingTemplate.template.name}
                  onChange={(e) => {
                    setEditingTemplate({
                      ...editingTemplate,
                      template: { ...editingTemplate.template, name: e.target.value },
                    });
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveTemplate()}
                  placeholder="e.g. Dreamy Portrait"
                  className={`w-full rounded-md border p-2 text-xs font-bold outline-none ${
                    isDark ? "border-white/10 bg-black/40" : "border-slate-200 bg-slate-50"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="ml-1 text-xs font-black uppercase opacity-40">
                  Logic / Modifiers
                </label>
                <textarea
                  value={editingTemplate.template.text}
                  onChange={(e) => {
                    setEditingTemplate({
                      ...editingTemplate,
                      template: { ...editingTemplate.template, text: e.target.value },
                    });
                  }}
                  placeholder="Add instructions..."
                  className={`min-h-[100px] w-full rounded-md border p-2 text-xs outline-none ${
                    isDark ? "border-white/10 bg-black/40" : "border-slate-200 bg-slate-50"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="ml-1 text-xs font-black uppercase opacity-40">Assets</label>
                <div
                  onClick={() => templateImageInputRef.current?.click()}
                  className={`flex min-h-[80px] cursor-pointer flex-wrap items-center justify-center gap-1 rounded-md border-2 border-dashed p-2 transition-all ${
                    isDark
                      ? "border-white/10 bg-white/5 hover:border-blue-500/50"
                      : "border-slate-200 bg-slate-50 hover:border-blue-500/50"
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
                  {!editingTemplate.template.images ||
                  editingTemplate.template.images.length === 0 ? (
                    <div className="flex flex-col items-center gap-1 opacity-20">
                      <Upload size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">
                        Select Files
                      </span>
                    </div>
                  ) : (
                    editingTemplate.template.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="group/asset relative"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <img
                          src={img}
                          className="h-12 w-12 rounded-md border border-white/10 object-cover shadow-md"
                          alt="ref"
                        />
                        <button
                          onClick={() => {
                            setEditingTemplate({
                              ...editingTemplate,
                              template: {
                                ...editingTemplate.template,
                                images: editingTemplate.template.images?.filter(
                                  (_, i) => i !== idx
                                ),
                              },
                            });
                          }}
                          title="Remove image"
                          className="absolute -right-1.5 -top-1.5 scale-75 rounded-md bg-red-600 p-1 text-white shadow-lg transition-transform hover:scale-100"
                        >
                          <X size={8} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={handleSaveTemplate}
                title="Save template"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 p-2 text-xs font-black text-white shadow-lg hover:bg-blue-500"
              >
                <Save size={14} /> Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplatesPanel;
