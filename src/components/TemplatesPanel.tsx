import {
  BookMarked,
  Folder as FolderIcon,
  FolderPlus,
  Image as ImageIcon,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import React, { useMemo, useRef, useState } from "react";

import type { Folder, PromptTemplate } from "@/types";

interface TemplatesPanelProps {
  folders: Folder[];
  isDark: boolean;
  hasAIKey: boolean;
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
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const templateImageInputRef = useRef<HTMLInputElement>(null);

  const displayedTemplates = useMemo(() => {
    if (selectedFolderId === null) {
      return folders.flatMap((folder) =>
        folder.templates.map((template) => ({
          ...template,
          folderId: folder.id,
          folderName: folder.name,
        }))
      );
    }
    const folder = folders.find((f) => f.id === selectedFolderId);
    return (
      folder?.templates.map((template) => ({
        ...template,
        folderId: folder.id,
        folderName: folder.name,
      })) ?? []
    );
  }, [folders, selectedFolderId]);

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
    if (selectedFolderId === id) {
      setSelectedFolderId(null);
    }
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

  const totalTemplateCount = folders.reduce((sum, f) => sum + f.templates.length, 0);
  const selectedFolder = selectedFolderId ? folders.find((f) => f.id === selectedFolderId) : null;
  const isImprovingFolder = selectedFolderId ? improvingIds.has(selectedFolderId) : false;

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="no-scrollbar flex-shrink-0 overflow-x-auto">
          <div className="flex flex-nowrap gap-2 p-2">
            <button
              onClick={() => setIsCreatingFolder(true)}
              title="Create new folder"
              className={`flex flex-shrink-0 flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-3 transition-all ${
                isDark
                  ? "border-slate-600 bg-slate-800/50 hover:border-blue-500/50 hover:bg-slate-800"
                  : "border-slate-300 bg-slate-100/50 hover:border-blue-400 hover:bg-slate-100"
              }`}
            >
              <FolderPlus size={20} className={isDark ? "text-slate-400" : "text-slate-500"} />
              <span
                className={`text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                New
              </span>
            </button>

            <button
              onClick={() => setSelectedFolderId(null)}
              className={`flex flex-shrink-0 flex-col items-center gap-1 rounded-xl px-4 py-3 transition-all ${
                selectedFolderId === null
                  ? isDark
                    ? "bg-slate-700 shadow-md"
                    : "bg-slate-200 shadow-md"
                  : isDark
                    ? "bg-slate-800/50 opacity-60 hover:opacity-100"
                    : "bg-slate-100/50 opacity-60 hover:opacity-100"
              }`}
            >
              <Layers size={20} className={isDark ? "text-blue-400" : "text-blue-500"} />
              <span
                className={`max-w-[60px] truncate text-[10px] font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                All ({totalTemplateCount})
              </span>
            </button>

            {folders.map((folder) => (
              <div key={folder.id} className="group/folder relative flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedFolderId(folder.id);
                    onToggleFolder(folder.id);
                  }}
                  className={`flex flex-col items-center gap-1 rounded-xl px-4 py-3 transition-all ${
                    selectedFolderId === folder.id
                      ? isDark
                        ? "bg-slate-700 shadow-md"
                        : "bg-slate-200 shadow-md"
                      : isDark
                        ? "bg-slate-800/50 opacity-60 hover:opacity-100"
                        : "bg-slate-100/50 opacity-60 hover:opacity-100"
                  }`}
                >
                  <FolderIcon size={20} className={isDark ? "text-amber-400" : "text-amber-500"} />
                  <span
                    className={`max-w-[60px] truncate text-[10px] font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}
                  >
                    {folder.name}
                  </span>
                </button>
                <button
                  onClick={(e) => handleDeleteFolder(folder.id, e)}
                  title="Delete folder"
                  className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-lg transition-all hover:bg-red-600 group-hover/folder:opacity-100"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {selectedFolder && selectedFolder.templates.length > 0 && hasAIKey && (
          <div className="flex-shrink-0 px-2 pb-2">
            <button
              onClick={(e) => handleImproveFolder(selectedFolder.id, e)}
              disabled={isImprovingFolder}
              title="Improve all templates in this folder with AI"
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                isImprovingFolder
                  ? "animate-pulse bg-amber-500 text-white"
                  : isDark
                    ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                    : "bg-amber-100 text-amber-600 hover:bg-amber-200"
              }`}
            >
              {isImprovingFolder ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Wand2 size={14} />
              )}
              Improve All in Folder
            </button>
          </div>
        )}

        <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-2 py-3">
          {displayedTemplates.length > 0 ? (
            displayedTemplates.map((template) => (
              <article
                key={`${template.folderId}-${template.id}`}
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
                    {selectedFolderId === null && (
                      <span
                        className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      >
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

                <p
                  className={`line-clamp-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  {template.text || "No prompt text"}
                </p>

                <div className="flex justify-end gap-1 pt-2">
                  <button
                    onClick={(e) =>
                      hasAIKey && handleImproveTemplate(template.folderId, template.id, e)
                    }
                    disabled={!hasAIKey || improvingIds.has(template.id)}
                    title={hasAIKey ? "Enhance with AI" : "Configure an AI API key in Settings"}
                    className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
                      !hasAIKey
                        ? "cursor-not-allowed opacity-30"
                        : improvingIds.has(template.id)
                          ? "animate-pulse bg-amber-500 text-white"
                          : isDark
                            ? "text-slate-400 hover:bg-amber-500/20 hover:text-amber-400"
                            : "text-slate-500 hover:bg-amber-100 hover:text-amber-600"
                    }`}
                  >
                    {improvingIds.has(template.id) ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Wand2 size={16} />
                    )}
                    <span className="text-[9px] font-medium uppercase tracking-wide">AI</span>
                  </button>

                  <button
                    onClick={(e) => handleStartTemplateEdit(template.folderId, template.id, e)}
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
                    onClick={(e) => handleDeleteTemplate(template.folderId, template.id, e)}
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
                    onClick={() => onUseTemplate(template.folderId, template.id)}
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
            ))
          ) : (
            <div
              className={`flex flex-col items-center justify-center py-16 ${isDark ? "opacity-30" : "opacity-40"}`}
            >
              <BookMarked size={32} className={isDark ? "text-slate-400" : "text-slate-500"} />
              <span
                className={`mt-2 text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                No Templates
              </span>
              {selectedFolderId !== null && folders.length > 0 && (
                <button
                  onClick={(e) => {
                    const folder = folders.find((f) => f.id === selectedFolderId);
                    if (folder) handleStartTemplateEdit(folder.id, undefined, e);
                  }}
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
          )}

          {selectedFolderId !== null && displayedTemplates.length > 0 && (
            <button
              onClick={(e) => handleStartTemplateEdit(selectedFolderId, undefined, e)}
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
      </div>
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
