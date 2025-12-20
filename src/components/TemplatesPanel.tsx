import { BookMarked, ChevronDown, Folder as FolderIcon, FolderPlus, Loader2, Pencil, Plus, Save, Trash2, Upload, Wand2, X } from "lucide-react";
import type { Folder, PromptTemplate } from "@/types";
import React, { useRef, useState } from "react";

interface TemplatesPanelProps {
  folders: Folder[];
  isDark: boolean;
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
          id: Math.random().toString(36).substr(2, 9),
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
    if (!editingTemplate || !editingTemplate.template.name) return;
    onSaveTemplate(editingTemplate.folderId, editingTemplate.template);
    setEditingTemplate(null);
  };

  const handleImproveTemplate = async (folderId: string, templateId: string, e: React.MouseEvent) => {
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
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        if (editingTemplate) {
          setEditingTemplate((prev) =>
            prev
              ? {
                  ...prev,
                  template: {
                    ...prev.template,
                    images: [...(prev.template.images || []), data],
                  },
                }
              : null
          );
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  return (
    <>
      <div className="space-y-2 animate-in fade-in duration-300">
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black uppercase opacity-40 tracking-widest">Managed Collections</span>
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            <FolderPlus size={14} />
          </button>
        </div>

        <div className="space-y-2">
          {folders.map((folder) => (
            <div key={folder.id} className="space-y-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onToggleFolder(folder.id)}
                  className={`flex-1 flex items-center gap-2 p-2 rounded-md border text-xs font-black transition-all ${
                    isDark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                  }`}
                >
                  <FolderIcon size={14} className="text-blue-500" />
                  <span className="flex-1 text-left">{folder.name}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${folder.isOpen ? "rotate-180" : ""}`} />
                </button>
                <button
                  onClick={(e) => handleImproveFolder(folder.id, e)}
                  disabled={improvingIds.has(folder.id)}
                  title="Improve all prompts in folder"
                  className={`p-2 rounded-md transition-all ${
                    improvingIds.has(folder.id)
                      ? "bg-amber-500 text-white animate-pulse"
                      : "bg-amber-500/10 text-amber-500/60 hover:bg-amber-600 hover:text-white"
                  }`}
                >
                  {improvingIds.has(folder.id) ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                </button>
                <button
                  onClick={(e) => handleDeleteFolder(folder.id, e)}
                  className="p-2 rounded-md bg-red-500/10 text-red-500/60 hover:bg-red-600 hover:text-white transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {folder.isOpen && (
                <div className="space-y-1 mt-1 animate-in slide-in-from-top-1">
                  {folder.templates.map((template) => (
                    <div
                      key={template.id}
                      className={`group flex flex-col p-2 rounded-md border shadow-sm transition-all ${
                        isDark ? "bg-white/2 border-white/5 hover:border-blue-500/30" : "bg-white border-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onUseTemplate(folder.id, template.id)}>
                          <p className="text-[10px] font-black text-blue-500 truncate">{template.name}</p>
                          <p className="text-[9px] opacity-40 truncate">"{template.text}"</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => handleImproveTemplate(folder.id, template.id, e)}
                            disabled={improvingIds.has(template.id)}
                            className={`p-1 rounded-md transition-all ${
                              improvingIds.has(template.id) ? "bg-amber-500 text-white animate-pulse" : "hover:bg-amber-500/20 text-amber-500"
                            }`}
                            title="AI Optimization"
                          >
                            {improvingIds.has(template.id) ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                          </button>
                          <button onClick={(e) => handleStartTemplateEdit(folder.id, template.id, e)} className="p-1 rounded-md hover:bg-blue-500/20">
                            <Pencil size={12} />
                          </button>
                          <button onClick={(e) => handleDeleteTemplate(folder.id, template.id, e)} className="p-1 rounded-md hover:bg-red-500/20 text-red-500">
                            <Trash2 size={12} />
                          </button>
                          <button onClick={() => onUseTemplate(folder.id, template.id)} className="p-1 rounded-md bg-blue-600 text-white shadow-lg">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={(e) => handleStartTemplateEdit(folder.id, undefined, e)}
                    className="w-full p-2 rounded-md border-2 border-dashed border-white/5 text-[9px] font-black uppercase opacity-20 hover:opacity-100 transition-all"
                  >
                    New Style
                  </button>
                </div>
              )}
            </div>
          ))}
          {folders.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center opacity-10 gap-2 border-2 border-dashed border-white/5 rounded-md">
              <BookMarked size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Library Empty</span>
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {isCreatingFolder && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-2">
          <div className={`max-w-md w-full p-2 rounded-md border shadow-2xl ${isDark ? "glass-panel border-white/10" : "bg-white border-slate-200"}`}>
            <div className="flex items-center justify-between p-2">
              <h2 className="text-sm font-black">New Folder</h2>
              <button onClick={() => setIsCreatingFolder(false)} className="p-1 hover:bg-white/5 rounded-md transition-all">
                <X size={18} />
              </button>
            </div>
            <div className="p-2 space-y-2">
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                placeholder="Folder Name"
                className={`w-full p-2 rounded-md outline-none border text-xs font-bold ${
                  isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-200"
                }`}
              />
              <button onClick={handleCreateFolder} className="w-full p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-black text-xs">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/80 backdrop-blur-md p-2">
          <div className={`max-w-xl w-full p-2 rounded-md border shadow-2xl ${isDark ? "glass-panel border-white/10" : "bg-white border-slate-200"}`}>
            <div className="flex items-center justify-between p-2">
              <h2 className="text-sm font-black">{editingTemplate.template.createdAt ? "Refine Prompt" : "New Library Entry"}</h2>
              <button onClick={() => setEditingTemplate(null)} className="p-1 hover:bg-white/5 rounded-md">
                <X size={18} />
              </button>
            </div>
            <div className="p-2 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Template Title</label>
                <input
                  autoFocus
                  value={editingTemplate.template.name}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      template: { ...editingTemplate.template, name: e.target.value },
                    })
                  }
                  placeholder="e.g. Dreamy Portrait"
                  className={`w-full p-2 rounded-md outline-none border font-bold text-xs ${
                    isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Logic / Modifiers</label>
                <textarea
                  value={editingTemplate.template.text}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      template: { ...editingTemplate.template, text: e.target.value },
                    })
                  }
                  placeholder="Add instructions..."
                  className={`w-full p-2 rounded-md outline-none border min-h-[100px] text-xs ${
                    isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Assets</label>
                <div
                  onClick={() => templateImageInputRef.current?.click()}
                  className={`p-2 rounded-md border-2 border-dashed transition-all cursor-pointer flex flex-wrap gap-1 min-h-[80px] items-center justify-center ${
                    isDark ? "bg-white/5 border-white/10 hover:border-blue-500/50" : "bg-slate-50 border-slate-200 hover:border-blue-500/50"
                  }`}
                >
                  <input ref={templateImageInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {!editingTemplate.template.images || editingTemplate.template.images.length === 0 ? (
                    <div className="flex flex-col items-center gap-1 opacity-20">
                      <Upload size={20} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Select Files</span>
                    </div>
                  ) : (
                    editingTemplate.template.images.map((img, idx) => (
                      <div key={idx} className="relative group/asset" onClick={(e) => e.stopPropagation()}>
                        <img src={img} className="w-12 h-12 rounded-md object-cover border border-white/10 shadow-md" alt="ref" />
                        <button
                          onClick={() =>
                            setEditingTemplate({
                              ...editingTemplate,
                              template: {
                                ...editingTemplate.template,
                                images: editingTemplate.template.images?.filter((_, i) => i !== idx),
                              },
                            })
                          }
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-md p-1 shadow-lg scale-75 hover:scale-100 transition-transform"
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
                className="w-full p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-black text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <Save size={14} /> Commit to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplatesPanel;
