import { Camera, Cpu, Maximize2, Trash2, TrendingUp, Type, Upload, X } from "lucide-react";
import { QueueItem, QueueStatus } from "@/types";
import React, { useRef, useState } from "react";

import { StatusBadge } from "./StatusBadge";

interface QueuePanelProps {
  queue: QueueItem[];
  isDark: boolean;
  onAddToQueue: (text?: string, templateText?: string, images?: string[]) => void;
  onRemoveFromQueue: (id: string) => void;
  onOpenCsvDialog: () => void;
}

interface TextSelection {
  start: number;
  end: number;
  text: string;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({ queue, isDark, onAddToQueue, onRemoveFromQueue, onOpenCsvDialog }) => {
  const [bulkInput, setBulkInput] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selection, setSelection] = useState<TextSelection | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = textareaRef.current.value.substring(start, end);
      if (text.trim().length > 0) {
        setSelection({ start, end, text });
      } else {
        setSelection(null);
      }
    }
  };

  const applyWeight = (mode: "standard" | "heavy" | "ultra" | "echo") => {
    if (!selection || !textareaRef.current) return;
    const { start, end, text } = selection;
    const currentVal = textareaRef.current.value;
    let newChunk = "";

    switch (mode) {
      case "standard":
        newChunk = `(${text}:1.2)`;
        break;
      case "heavy":
        newChunk = `((${text}:1.5))`;
        break;
      case "ultra":
        newChunk = `(((${text}:1.8)))`;
        break;
      case "echo":
        newChunk = `${text}... ${text}`;
        break;
    }

    const newVal = currentVal.substring(0, start) + newChunk + currentVal.substring(end);
    setBulkInput(newVal);
    setSelection(null);
    textareaRef.current.focus();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        setSelectedImages((prev) => [...prev, data]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleEnqueue = () => {
    onAddToQueue(bulkInput, undefined, selectedImages);
    setBulkInput("");
    setSelectedImages([]);
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-1">
        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">New Prompt</span>
        <div className="flex gap-1">
          <button
            onClick={() => imageInputRef.current?.click()}
            className={`p-1.5 rounded-md border transition-all ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"} ${
              selectedImages.length > 0 ? "text-blue-500 bg-blue-500/10 border-blue-500/30" : "opacity-40 hover:opacity-100"
            }`}
          >
            <Camera size={14} />
          </button>
          <button
            onClick={onOpenCsvDialog}
            className={`p-1.5 rounded-md border transition-all ${
              isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
            } opacity-40 hover:opacity-100`}
          >
            <Upload size={14} />
          </button>
          <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          onSelect={handleTextSelection}
          placeholder="Enter image instructions..."
          className={`w-full p-2 text-xs min-h-[140px] rounded-md border outline-none transition-all no-scrollbar leading-relaxed ${
            isDark ? "bg-black/40 border-white/10 focus:border-blue-500/50" : "bg-slate-50 border-slate-200 focus:border-blue-500/50 shadow-inner"
          }`}
        />

        {selection && (
          <div className="absolute top-0 right-0 -translate-y-full mb-1 flex gap-1 p-1 bg-blue-600 rounded-md shadow-2xl animate-in fade-in slide-in-from-bottom-1 z-50">
            <button onClick={() => applyWeight("standard")} title="Focus" className="p-1 hover:bg-white/10 rounded-md">
              <Type size={12} />
            </button>
            <button onClick={() => applyWeight("heavy")} title="Emphasis" className="p-1 hover:bg-white/10 rounded-md">
              <Maximize2 size={12} />
            </button>
            <button onClick={() => applyWeight("echo")} title="Highlight" className="p-1 hover:bg-white/10 rounded-md">
              <TrendingUp size={12} />
            </button>
            <button onClick={() => setSelection(null)} className="p-1 hover:bg-white/10 rounded-md border-l border-white/20">
              <X size={12} />
            </button>
          </div>
        )}

        {selectedImages.length > 0 && (
          <div className="absolute left-1 bottom-1 flex gap-1 p-1 bg-black/60 rounded-md overflow-x-auto max-w-[160px] no-scrollbar">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative shrink-0">
                <img src={img} className="w-8 h-8 rounded-md object-cover" alt="ref" />
                <button
                  onClick={() => setSelectedImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-1 -right-1 bg-red-600 text-white rounded-md p-0.5"
                >
                  <X size={6} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleEnqueue}
          className="absolute right-2 bottom-2 bg-blue-600 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
        >
          Add to Queue
        </button>
      </div>

      <div className="pt-2 space-y-1">
        {queue.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center opacity-10 gap-2 border-2 border-dashed border-white/5 rounded-md">
            <Cpu size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Queue Empty</span>
          </div>
        ) : (
          queue.map((item) => (
            <div
              key={item.id}
              className={`p-2 rounded-md border group transition-all ${isDark ? "bg-white/2 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={item.status} />
                <button
                  onClick={() => onRemoveFromQueue(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-500/40 hover:text-red-500 transition-all p-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <p className="text-[10px] font-medium leading-tight line-clamp-2 opacity-80">"{item.originalPrompt}"</p>
              {item.images && item.images.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {item.images.slice(0, 4).map((img, i) => (
                    <img key={i} src={img} className="w-6 h-6 rounded-md object-cover border border-white/5" alt="ref" />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QueuePanel;
