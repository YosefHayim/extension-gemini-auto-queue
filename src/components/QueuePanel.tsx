import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Brain,
  Camera,
  Cpu,
  Gem,
  Info,
  Maximize2,
  Trash2,
  TrendingUp,
  Type,
  Upload,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  GEMINI_MODE_INFO,
  GEMINI_TOOL_INFO,
  GeminiMode,
  GeminiTool,
  QueueStatus,
  type QueueItem,
} from "@/types";

import { QueueItemCard } from "./QueueItemCard";
import { SearchFilter } from "./SearchFilter";

// Inline info icon for queue panel
const QueueInfo: React.FC<{ text: string; isDark?: boolean }> = ({ text, isDark = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="relative ml-1 inline-flex items-center opacity-30 transition-opacity hover:opacity-70"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Info size={10} />
      {isHovered && (
        <div
          className={`pointer-events-auto absolute bottom-full left-1/2 z-[2147483647] mb-2 max-h-[200px] w-[200px] -translate-x-1/2 overflow-auto whitespace-normal rounded-md px-3 py-2 text-xs normal-case shadow-xl ${
            isDark ? "border border-white/20 bg-gray-800 text-white" : "bg-gray-900 text-white"
          }`}
        >
          <div className="break-words">{text}</div>
          <div
            className={`absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent ${
              isDark ? "border-t-gray-800" : "border-t-gray-900"
            }`}
          />
        </div>
      )}
    </span>
  );
};

const MODE_ICONS = {
  [GeminiMode.Quick]: Zap,
  [GeminiMode.Deep]: Brain,
  [GeminiMode.Pro]: Gem,
};

const MODE_SELECTOR_STYLES: Record<GeminiMode, { selected: string; unselected: string }> = {
  [GeminiMode.Quick]: {
    selected: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
    unselected:
      "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 border dark:text-emerald-400 dark:border-emerald-500/40",
  },
  [GeminiMode.Deep]: {
    selected: "bg-blue-500 text-white shadow-lg shadow-blue-500/30",
    unselected:
      "border-blue-500/30 text-blue-500 hover:bg-blue-500/10 border dark:text-blue-400 dark:border-blue-500/40",
  },
  [GeminiMode.Pro]: {
    selected: "bg-purple-500 text-white shadow-lg shadow-purple-500/30",
    unselected:
      "border-purple-500/30 text-purple-500 hover:bg-purple-500/10 border dark:text-purple-400 dark:border-purple-500/40",
  },
};

interface SortableQueueItemProps {
  item: QueueItem;
  isDark: boolean;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDuplicateWithAI: (id: string) => void;
  onEdit?: (id: string, newPrompt: string) => void;
  onRunSingle?: (id: string) => void;
  isEditing: boolean;
}

const SortableQueueItem: React.FC<SortableQueueItemProps> = ({
  item,
  isDark,
  onRemove,
  onRetry,
  onDuplicate,
  onDuplicateWithAI,
  onEdit,
  onRunSingle,
  isEditing,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QueueItemCard
        item={item}
        isDark={isDark}
        onRemove={onRemove}
        onRetry={onRetry}
        onDuplicate={onDuplicate}
        onDuplicateWithAI={onDuplicateWithAI}
        onEdit={onEdit}
        onRunSingle={onRunSingle}
        isEditing={isEditing}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

interface QueuePanelProps {
  queue: QueueItem[];
  isDark: boolean;
  defaultTool?: GeminiTool;
  onAddToQueue: (
    text?: string,
    templateText?: string,
    images?: string[],
    tool?: GeminiTool,
    mode?: GeminiMode
  ) => void;
  onRemoveFromQueue: (id: string) => void;
  onRetryQueueItem: (id: string) => void;
  onClearAll?: () => void;
  onClearByFilter?: (filter: {
    status?: QueueStatus;
    tool?: GeminiTool;
    mode?: GeminiMode;
  }) => void;
  onOpenCsvDialog: () => void;
  onReorderQueue: (newQueue: QueueItem[]) => void;
  onDuplicateItem: (id: string) => void;
  onDuplicateWithAI: (id: string) => void;
  onEditItem?: (id: string, newPrompt: string) => void;
  onRunSingleItem?: (id: string) => void;
  selectedMode?: GeminiMode;
  onModeChange?: (mode: GeminiMode) => void;
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
  onRetryQueueItem,
  onClearAll,
  onClearByFilter,
  onOpenCsvDialog,
  onReorderQueue,
  onDuplicateItem,
  onDuplicateWithAI,
  onEditItem,
  onRunSingleItem,
  selectedMode = GeminiMode.Quick,
  onModeChange,
}) => {
  const [bulkInput, setBulkInput] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [selectedTool, setSelectedTool] = useState<GeminiTool>(defaultTool ?? GeminiTool.IMAGE);
  const [localSelectedMode, setLocalSelectedMode] = useState<GeminiMode>(selectedMode);

  const [searchText, setSearchText] = useState("");
  const [selectedToolFilters, setSelectedToolFilters] = useState<GeminiTool[]>([]);
  const [selectedModeFilters, setSelectedModeFilters] = useState<GeminiMode[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showClearMenu, setShowClearMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const clearMenuRef = useRef<HTMLDivElement>(null);

  // Close clear menu on click outside
  useEffect(() => {
    if (!showClearMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (clearMenuRef.current && !clearMenuRef.current.contains(event.target as Node)) {
        setShowClearMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showClearMenu]);

  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      if (searchText && !item.originalPrompt.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      if (selectedToolFilters.length > 0 && item.tool && !selectedToolFilters.includes(item.tool)) {
        return false;
      }
      if (selectedModeFilters.length > 0 && item.mode && !selectedModeFilters.includes(item.mode)) {
        return false;
      }
      return true;
    });
  }, [queue, searchText, selectedToolFilters, selectedModeFilters]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex((item) => item.id === active.id);
      const newIndex = queue.findIndex((item) => item.id === over.id);
      const newQueue = arrayMove(queue, oldIndex, newIndex);
      onReorderQueue(newQueue);
    }
  };

  const handleModeSelect = (mode: GeminiMode) => {
    setLocalSelectedMode(mode);
    onModeChange?.(mode);
  };

  useEffect(() => {
    if (defaultTool) {
      setSelectedTool(defaultTool);
    }
  }, [defaultTool]);

  useEffect(() => {
    setLocalSelectedMode(selectedMode);
  }, [selectedMode]);

  // Auto-select tool if all queue items have the same tool type
  useEffect(() => {
    if (queue.length > 0) {
      // Get all tool types from queue items (excluding undefined)
      const toolTypes = queue
        .map((item) => item.tool)
        .filter((tool): tool is GeminiTool => tool !== undefined);

      if (toolTypes.length > 0) {
        // Check if all items have the same tool type
        const firstTool = toolTypes[0];
        const allSameTool = toolTypes.every((tool) => tool === firstTool);

        if (allSameTool) {
          // Auto-select the tool that all queue items are using
          setSelectedTool(firstTool);
        }
      }
    }
  }, [queue]);

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
      setSelectedImages((prev) => [...prev, ...newImages]);
    });

    e.target.value = "";
  };

  const handleEnqueue = () => {
    onAddToQueue(bulkInput, undefined, selectedImages, selectedTool, localSelectedMode);
    setBulkInput("");
    setSelectedImages([]);
  };

  return (
    <div className="animate-in fade-in space-y-2 duration-300">
      <div className="flex items-center justify-between px-1">
        <span className="flex items-center text-[9px] font-black uppercase tracking-widest opacity-40">
          New Prompt
          <QueueInfo
            text="Enter prompts separated by blank lines. Each paragraph (text between blank lines) becomes one prompt. Multi-line paragraphs are joined into a single prompt."
            isDark={isDark}
          />
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

      <div data-onboarding="tool-selector" className="flex flex-wrap gap-1">
        {Object.entries(GEMINI_TOOL_INFO)
          .filter(([tool]) => (tool as GeminiTool) !== GeminiTool.NONE)
          .map(([tool, info]) => {
            const toolEnum = tool as GeminiTool;
            return (
              <button
                key={tool}
                onClick={() => {
                  setSelectedTool(toolEnum);
                }}
                title={info.description}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-bold transition-all ${
                  selectedTool === toolEnum
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : isDark
                      ? "border border-white/10 bg-white/5 hover:bg-white/10"
                      : "border border-slate-200 bg-slate-100 hover:bg-slate-200"
                }`}
              >
                <span>{React.createElement(info.icon, { size: 14 })}</span>
                <span className="hidden sm:inline">{info.label}</span>
              </button>
            );
          })}
      </div>

      <div data-onboarding="mode-selector" className="flex flex-wrap gap-1.5">
        {Object.values(GeminiMode).map((mode) => {
          const modeInfo = GEMINI_MODE_INFO[mode];
          const isSelected = localSelectedMode === mode;
          const styles = MODE_SELECTOR_STYLES[mode];
          const Icon = MODE_ICONS[mode];
          return (
            <button
              key={mode}
              onClick={() => handleModeSelect(mode)}
              title={modeInfo.description}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide transition-all ${
                isSelected ? styles.selected : styles.unselected
              }`}
            >
              <Icon size={12} />
              <span>{modeInfo.label}</span>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <textarea
          data-onboarding="queue-textarea"
          ref={textareaRef}
          value={bulkInput}
          onChange={(e) => {
            setBulkInput(e.target.value);
          }}
          onSelect={handleTextSelection}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleEnqueue();
            }
          }}
          placeholder="Enter prompts separated by blank lines. Each paragraph becomes one prompt. Press Ctrl+Enter to add to queue."
          className={`max-h-[300px] min-h-[140px] w-full overflow-y-auto rounded-md border p-2 text-xs leading-relaxed outline-none transition-all ${
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
          data-onboarding="add-queue-btn"
          onClick={handleEnqueue}
          title="Add prompt to processing queue"
          className="absolute bottom-2 right-2 rounded-md bg-blue-600 px-3 py-1 text-[10px] font-black uppercase text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          Add to Queue
        </button>
      </div>

      <div data-onboarding="queue-list" className="space-y-2 pt-2">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-white/5 py-12 opacity-10">
            <Cpu size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Queue Empty</span>
          </div>
        ) : (
          <>
            <SearchFilter
              searchText={searchText}
              onSearchChange={setSearchText}
              selectedTools={selectedToolFilters}
              onToolsChange={setSelectedToolFilters}
              selectedModes={selectedModeFilters}
              onModesChange={setSelectedModeFilters}
              isDark={isDark}
              totalItems={queue.length}
              filteredCount={filteredQueue.length}
            />

            {(onClearAll || onClearByFilter) && (
              <div ref={clearMenuRef} className="relative flex items-center justify-end">
                <button
                  onClick={() => setShowClearMenu(!showClearMenu)}
                  title="Clear queue items"
                  className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-wider transition-all ${
                    isDark
                      ? "border-red-500/30 bg-red-500/10 text-red-400 hover:border-red-500/50 hover:bg-red-500/20"
                      : "border-red-300 bg-red-50 text-red-600 hover:border-red-400 hover:bg-red-100"
                  }`}
                >
                  <Trash2 size={12} />
                  <span>Clear</span>
                </button>

                {showClearMenu && (
                  <div
                    className={`absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border shadow-xl ${
                      isDark ? "border-white/10 bg-gray-900" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="p-1">
                      {onClearAll && (
                        <button
                          onClick={() => {
                            onClearAll();
                            setShowClearMenu(false);
                          }}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium transition-colors ${
                            isDark
                              ? "text-red-400 hover:bg-red-500/20"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                        >
                          <Trash2 size={12} />
                          Clear All ({queue.length})
                        </button>
                      )}

                      {onClearByFilter && (
                        <>
                          <div
                            className={`my-1 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}
                          />
                          <div
                            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-400"}`}
                          >
                            By Status
                          </div>
                          {Object.values(QueueStatus).map((status) => {
                            const count = queue.filter((item) => item.status === status).length;
                            if (count === 0) return null;
                            return (
                              <button
                                key={status}
                                onClick={() => {
                                  onClearByFilter({ status });
                                  setShowClearMenu(false);
                                }}
                                className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-1.5 text-left text-xs transition-colors ${
                                  isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                                }`}
                              >
                                <span className="capitalize">{status}</span>
                                <span
                                  className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-400"}`}
                                >
                                  {count}
                                </span>
                              </button>
                            );
                          })}

                          <div
                            className={`my-1 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}
                          />
                          <div
                            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-400"}`}
                          >
                            By Tool
                          </div>
                          {Object.values(GeminiTool)
                            .filter((tool) => tool !== GeminiTool.NONE)
                            .map((tool) => {
                              const count = queue.filter((item) => item.tool === tool).length;
                              if (count === 0) return null;
                              const toolInfo = GEMINI_TOOL_INFO[tool];
                              return (
                                <button
                                  key={tool}
                                  onClick={() => {
                                    onClearByFilter({ tool });
                                    setShowClearMenu(false);
                                  }}
                                  className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-1.5 text-left text-xs transition-colors ${
                                    isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    {React.createElement(toolInfo.icon, { size: 12 })}
                                    {toolInfo.label}
                                  </span>
                                  <span
                                    className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-400"}`}
                                  >
                                    {count}
                                  </span>
                                </button>
                              );
                            })}

                          <div
                            className={`my-1 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}
                          />
                          <div
                            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-400"}`}
                          >
                            By Mode
                          </div>
                          {Object.values(GeminiMode).map((mode) => {
                            const count = queue.filter((item) => item.mode === mode).length;
                            if (count === 0) return null;
                            const modeInfo = GEMINI_MODE_INFO[mode];
                            return (
                              <button
                                key={mode}
                                onClick={() => {
                                  onClearByFilter({ mode });
                                  setShowClearMenu(false);
                                }}
                                className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-1.5 text-left text-xs transition-colors ${
                                  isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                                }`}
                              >
                                <span>{modeInfo.label}</span>
                                <span
                                  className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-400"}`}
                                >
                                  {count}
                                </span>
                              </button>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredQueue.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {filteredQueue.map((item) => (
                    <SortableQueueItem
                      key={item.id}
                      item={item}
                      isDark={isDark}
                      onRemove={onRemoveFromQueue}
                      onRetry={onRetryQueueItem}
                      onDuplicate={onDuplicateItem}
                      onDuplicateWithAI={onDuplicateWithAI}
                      onEdit={
                        onEditItem
                          ? (id, prompt) => {
                              onEditItem(id, prompt);
                              setEditingItemId(null);
                            }
                          : undefined
                      }
                      onRunSingle={onRunSingleItem}
                      isEditing={editingItemId === item.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>
    </div>
  );
};

export default QueuePanel;
