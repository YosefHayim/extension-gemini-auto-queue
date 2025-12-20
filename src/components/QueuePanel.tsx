import { Camera, Cpu, Info, Maximize2, Trash2, TrendingUp, Type, Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";

import { GEMINI_TOOL_INFO, GeminiTool } from "@/types";

import { StatusBadge } from "./StatusBadge";

import type { QueueItem } from "@/types";

// Inline info icon for queue panel
const QueueInfo: React.FC<{ text: string }> = ({ text }) => (
  <span
    title={text}
    className="ml-1 inline-flex cursor-help items-center opacity-30 transition-opacity hover:opacity-70"
  >
    <Info size={10} />
  </span>
);

interface QueuePanelProps {
  queue: QueueItem[];
  isDark: boolean;
  defaultTool?: GeminiTool;
  onAddToQueue: (
    text?: string,
    templateText?: string,
    images?: string[],
    tool?: GeminiTool
  ) => void;
  onRemoveFromQueue: (id: string) => void;
  onOpenCsvDialog: () => void;
}

interface TextSelection {
  start: number;
  end: number;
  text: string;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({
  queue,
  isDark,
  defaultTool,
  onAddToQueue,
  onRemoveFromQueue,
  onOpenCsvDialog,
}) => {
  const [bulkInput, setBulkInput] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [selectedTool, setSelectedTool] = useState<GeminiTool>(defaultTool || GeminiTool.IMAGE);

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
    const files = Array.from(e.target.files ?? []);
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
    onAddToQueue(bulkInput, undefined, selectedImages, selectedTool);
    setBulkInput("");
    setSelectedImages([]);
  };

  return (
    <div className="animate-in fade-in space-y-2 duration-300">
      <div className="flex items-center justify-between px-1">
        <span className="flex items-center text-[9px] font-black uppercase tracking-widest opacity-40">
          New Prompt
          <QueueInfo text="Enter your image description. Use line breaks to create multiple prompts at once." />
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => imageInputRef.current?.click()}
            title="Attach reference images"
            className={`rounded-md border p-1.5 transition-all ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"} ${
              selectedImages.length > 0
                ? "border-blue-500/30 bg-blue-500/10 text-blue-500"
                : "opacity-40 hover:opacity-100"
            }`}
          >
            <Camera size={14} />
          </button>
          <button
            onClick={onOpenCsvDialog}
            title="Import prompts from CSV"
            className={`rounded-md border p-1.5 transition-all ${
              isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"
            } opacity-40 hover:opacity-100`}
          >
            <Upload size={14} />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      {/* Tool Selector */}
      <div className="flex flex-wrap gap-1">
        {Object.entries(GEMINI_TOOL_INFO)
          .filter(([tool]) => tool !== GeminiTool.NONE)
          .map(([tool, info]) => (
            <button
              key={tool}
              onClick={() => {
                setSelectedTool(tool as GeminiTool);
              }}
              title={info.description}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-bold transition-all ${
                selectedTool === tool
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : isDark
                    ? "border border-white/10 bg-white/5 hover:bg-white/10"
                    : "border border-slate-200 bg-slate-100 hover:bg-slate-200"
              }`}
            >
              <span>{info.icon}</span>
              <span className="hidden sm:inline">{info.label}</span>
            </button>
          ))}
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={bulkInput}
          onChange={(e) => {
            setBulkInput(e.target.value);
          }}
          onSelect={handleTextSelection}
          placeholder="Enter image instructions..."
          className={`no-scrollbar min-h-[140px] w-full rounded-md border p-2 text-xs leading-relaxed outline-none transition-all ${
            isDark
              ? "border-white/10 bg-black/40 focus:border-blue-500/50"
              : "border-slate-200 bg-slate-50 shadow-inner focus:border-blue-500/50"
          }`}
        />

        {selection && (
          <div className="animate-in fade-in slide-in-from-bottom-1 absolute right-0 top-0 z-50 mb-1 flex -translate-y-full gap-1 rounded-md bg-blue-600 p-1 shadow-2xl">
            <button
              onClick={() => {
                applyWeight("standard");
              }}
              title="Light emphasis (1.2x)"
              className="rounded-md p-1 hover:bg-white/10"
            >
              <Type size={12} />
            </button>
            <button
              onClick={() => {
                applyWeight("heavy");
              }}
              title="Strong emphasis (1.5x)"
              className="rounded-md p-1 hover:bg-white/10"
            >
              <Maximize2 size={12} />
            </button>
            <button
              onClick={() => {
                applyWeight("echo");
              }}
              title="Repeat for impact"
              className="rounded-md p-1 hover:bg-white/10"
            >
              <TrendingUp size={12} />
            </button>
            <button
              onClick={() => {
                setSelection(null);
              }}
              title="Cancel"
              className="rounded-md border-l border-white/20 p-1 hover:bg-white/10"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {selectedImages.length > 0 && (
          <div className="no-scrollbar absolute bottom-1 left-1 flex max-w-[160px] gap-1 overflow-x-auto rounded-md bg-black/60 p-1">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative shrink-0">
                <img src={img} className="h-8 w-8 rounded-md object-cover" alt="ref" />
                <button
                  onClick={() => {
                    setSelectedImages((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  title="Remove image"
                  className="absolute -right-1 -top-1 rounded-md bg-red-600 p-0.5 text-white"
                >
                  <X size={6} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleEnqueue}
          title="Add prompt to processing queue"
          className="absolute bottom-2 right-2 rounded-md bg-blue-600 px-3 py-1 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          Add to Queue
        </button>
      </div>

      <div className="space-y-1 pt-2">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-white/5 py-12 opacity-10">
            <Cpu size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Queue Empty</span>
          </div>
        ) : (
          queue.map((item) => {
            const toolInfo = item.tool
              ? GEMINI_TOOL_INFO[item.tool]
              : GEMINI_TOOL_INFO[GeminiTool.IMAGE];
            return (
              <div
                key={item.id}
                className={`group rounded-md border p-2 transition-all ${isDark ? "bg-white/2 border-white/5" : "border-slate-100 bg-white shadow-sm"}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    <span
                      title={toolInfo?.description || "Tool"}
                      className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${isDark ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-600"}`}
                    >
                      {toolInfo?.icon} {toolInfo?.label}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onRemoveFromQueue(item.id);
                    }}
                    title="Remove from queue"
                    className="p-1 text-red-500/40 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <p className="line-clamp-2 text-[10px] font-medium leading-tight opacity-80">
                  "{item.originalPrompt}"
                </p>
                {item.images && item.images.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {item.images.slice(0, 4).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        className="h-6 w-6 rounded-md border border-white/5 object-cover"
                        alt="ref"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QueuePanel;
