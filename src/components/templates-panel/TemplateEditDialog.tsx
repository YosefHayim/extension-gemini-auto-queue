import { Save, Upload, X } from "lucide-react";
import React, { useRef } from "react";

import type { EditingTemplateState } from "./types";

interface TemplateEditDialogProps {
  editingTemplate: EditingTemplateState | null;
  isDark: boolean;
  onTemplateChange: (template: EditingTemplateState | null) => void;
  onSave: () => void;
  onClose: () => void;
}

export const TemplateEditDialog: React.FC<TemplateEditDialogProps> = ({
  editingTemplate,
  isDark,
  onTemplateChange,
  onSave,
  onClose,
}) => {
  const templateImageInputRef = useRef<HTMLInputElement>(null);

  if (!editingTemplate) return null;

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

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md">
      <div
        className={`w-full max-w-xl rounded-md border p-2 shadow-2xl ${isDark ? "glass-panel border-white/10" : "border-slate-200 bg-white"}`}
      >
        <div className="flex items-center justify-between p-2">
          <h2 className="text-sm font-black">
            {editingTemplate.template.createdAt ? "Refine Prompt" : "New Library Entry"}
          </h2>
          <button onClick={onClose} title="Close" className="rounded-md p-1 hover:bg-white/5">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3 p-2">
          <div className="space-y-1">
            <label className="ml-1 text-xs font-black uppercase opacity-40">Template Title</label>
            <input
              autoFocus
              value={editingTemplate.template.name}
              onChange={(e) => {
                onTemplateChange({
                  ...editingTemplate,
                  template: { ...editingTemplate.template, name: e.target.value },
                });
              }}
              onKeyDown={(e) => e.key === "Enter" && onSave()}
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
                onTemplateChange({
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
              {!editingTemplate.template.images || editingTemplate.template.images.length === 0 ? (
                <div className="flex flex-col items-center gap-1 opacity-20">
                  <Upload size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">Select Files</span>
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
                      onClick={() => handleRemoveImage(idx)}
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
            onClick={onSave}
            title="Save template"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 p-2 text-xs font-black text-white shadow-lg hover:bg-blue-500"
          >
            <Save size={14} /> Save Template
          </button>
        </div>
      </div>
    </div>
  );
};
