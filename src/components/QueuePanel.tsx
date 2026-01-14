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
  Clock,
  Cpu,
  Download,
  Gem,
  Layers,
  Maximize2,
  Sparkles,
  Trash2,
  TrendingUp,
  Type,
  Upload,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  ContentType,
  GEMINI_MODE_INFO,
  GEMINI_TOOL_INFO,
  GeminiMode,
  GeminiTool,
  QueueStatus,
  type QueueItem,
} from "@/types";

import { BulkActionsDialog, ResetFilter } from "./BulkActionsDialog";
import { QueueItemCard } from "./QueueItemCard";
import { SearchFilter } from "./SearchFilter";
import { Tooltip } from "./Tooltip";

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
  searchText?: string;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDuplicateWithAI: (id: string) => void;
  onEdit?: (id: string, newPrompt: string) => void;
  onRunSingle?: (id: string) => void;
  onUpdateImages?: (id: string, images: string[]) => void;
  isEditing: boolean;
}

const SortableQueueItem: React.FC<SortableQueueItemProps> = ({
  item,
  isDark,
  searchText,
  onRemove,
  onRetry,
  onDuplicate,
  onDuplicateWithAI,
  onEdit,
  onRunSingle,
  onUpdateImages,
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
        searchText={searchText}
        onRemove={onRemove}
        onRetry={onRetry}
        onDuplicate={onDuplicate}
        onDuplicateWithAI={onDuplicateWithAI}
        onEdit={onEdit}
        onRunSingle={onRunSingle}
        onUpdateImages={onUpdateImages}
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
  hasApiKey: boolean;
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
  onUpdateItemImages?: (id: string, images: string[]) => void;
  selectedMode?: GeminiMode;
  onModeChange?: (mode: GeminiMode) => void;
  onBulkAttachImages?: (images: string[]) => void;
  onBulkAIOptimize?: (instructions: string) => Promise<void>;
  onBulkModify?: (text: string, position: "prepend" | "append") => void;
  onBulkReset?: (filter: ResetFilter) => void;
  onClearCompleted?: () => void;
  onOpenExport?: () => void;
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
  hasApiKey,
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
  onUpdateItemImages,
  selectedMode = GeminiMode.Quick,
  onModeChange,
  onBulkAttachImages,
  onBulkAIOptimize,
  onBulkModify,
  onBulkReset,
  onClearCompleted,
  onOpenExport,
}) => {
  const [bulkInput, setBulkInput] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [selectedTool, setSelectedTool] = useState<GeminiTool>(defaultTool ?? GeminiTool.IMAGE);
  const [localSelectedMode, setLocalSelectedMode] = useState<GeminiMode>(selectedMode);

  const [searchText, setSearchText] = useState("");
  const [selectedToolFilters, setSelectedToolFilters] = useState<GeminiTool[]>([]);
  const [selectedModeFilters, setSelectedModeFilters] = useState<GeminiMode[]>([]);
  const [selectedContentFilters, setSelectedContentFilters] = useState<ContentType[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showClearMenu, setShowClearMenu] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

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
      if (selectedContentFilters.length > 0) {
        const hasText = item.originalPrompt.trim().length > 0;
        const hasImages = item.images && item.images.length > 0;

        const matchesFilter = selectedContentFilters.some((filter) => {
          switch (filter) {
            case ContentType.TextOnly:
              return hasText && !hasImages;
            case ContentType.WithImages:
              return hasImages;
            case ContentType.TextAndImages:
              return hasText && hasImages;
            default:
              return true;
          }
        });

        if (!matchesFilter) return false;
      }
      return true;
    });
  }, [queue, searchText, selectedToolFilters, selectedModeFilters, selectedContentFilters]);

  const pendingCount = useMemo(() => {
    return queue.filter((item) => item.status === QueueStatus.Pending).length;
  }, [queue]);

  const completedCount = useMemo(() => {
    return queue.filter((item) => item.status === QueueStatus.Completed).length;
  }, [queue]);

  const failedCount = useMemo(() => {
    return queue.filter((item) => item.status === QueueStatus.Failed).length;
  }, [queue]);

  const promptPreviewCount = useMemo(() => {
    if (!bulkInput.trim()) return 0;
    const numberedPattern = /^(?:Prompt\s+)?\d+[.:)]\s+/i;
    const newlineSplit = bulkInput.split(/\n/);
    const lines = newlineSplit.flatMap((line) => {
      const trimmed = line.trim();
      if (!trimmed) return [];
      if (numberedPattern.test(trimmed)) return [trimmed];
      const hasMultipleCommas = (trimmed.match(/,/g) ?? []).length > 1;
      const commaBeforeCapital = /,\s+[A-Z]/;
      if (hasMultipleCommas && commaBeforeCapital.test(trimmed)) {
        return trimmed
          .split(/,\s+(?=[A-Z])/)
          .map((item) => item.trim())
          .filter((item) => item !== "");
      }
      return [trimmed];
    });
    return lines.length;
  }, [bulkInput]);

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
    <div className="animate-in fade-in space-y-3 duration-300">
      <BulkActionsDialog
        isOpen={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        isDark={isDark}
        hasApiKey={hasApiKey}
        pendingCount={pendingCount}
        totalCount={queue.length}
        completedCount={completedCount}
        failedCount={failedCount}
        onBulkAttach={(images) => {
          onBulkAttachImages?.(images);
          setShowBulkActions(false);
        }}
        onBulkAIOptimize={async (instructions) => {
          await onBulkAIOptimize?.(instructions);
          setShowBulkActions(false);
        }}
        onBulkModify={(text, position) => {
          onBulkModify?.(text, position);
          setShowBulkActions(false);
        }}
        onBulkReset={(filter) => {
          onBulkReset?.(filter);
          setShowBulkActions(false);
        }}
        onCopyAllPrompts={() => queue.map((item) => item.originalPrompt).join("\n\n")}
      />
      <div className="flex items-center justify-between">
        <span className="flex items-center text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          New Prompt
          <Tooltip
            text="Enter prompts separated by blank lines. Each paragraph (text between blank lines) becomes one prompt. Multi-line paragraphs are joined into a single prompt."
            isDark={isDark}
          />
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={() => imageInputRef.current?.click()}
            title="Attach reference images"
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-all ${
              selectedImages.length > 0
                ? "text-indigo-500 dark:text-indigo-400"
                : isDark
                  ? "text-slate-500 hover:text-slate-300"
                  : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Camera size={16} />
          </button>
          <button
            onClick={onOpenCsvDialog}
            title="Import prompts from CSV"
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-all ${
              isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Upload size={16} />
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
            const isSelected = selectedTool === toolEnum;
            return (
              <button
                key={tool}
                onClick={() => {
                  setSelectedTool(toolEnum);
                }}
                title={info.description}
                className={`flex min-h-[44px] items-center gap-1 rounded-md px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wide transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : isDark
                      ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <span>{React.createElement(info.icon, { size: 14 })}</span>
                <span className="hidden sm:inline">{info.label}</span>
              </button>
            );
          })}
      </div>

      <div
        data-onboarding="mode-selector"
        className={`inline-flex rounded-lg p-0.5 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
      >
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
              className={`flex min-h-[36px] items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-all ${
                isSelected
                  ? styles.selected
                  : `${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`
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
          placeholder="Enter prompts separated by blank lines..."
          className={`max-h-[280px] min-h-[120px] w-full overflow-y-auto rounded-lg border p-3 pb-14 text-sm leading-relaxed outline-none transition-all ${
            isDark
              ? "border-slate-700 bg-slate-900 placeholder:text-slate-600 focus:border-indigo-500/60"
              : "border-slate-200 bg-white placeholder:text-slate-400 focus:border-indigo-500/60"
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

        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
          {promptPreviewCount > 0 && (
            <span
              className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
              }`}
            >
              {promptPreviewCount} prompt{promptPreviewCount !== 1 ? "s" : ""}
            </span>
          )}
          <button
            data-onboarding="add-queue-btn"
            onClick={handleEnqueue}
            disabled={promptPreviewCount === 0 && selectedImages.length === 0}
            title="Add prompt to processing queue (Ctrl+Enter)"
            className="min-h-[44px] rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-indigo-600/25 transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to Queue
          </button>
        </div>
      </div>

      <div data-onboarding="queue-list" className="space-y-2 pt-2">
        {queue.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 ${isDark ? "border-slate-700" : "border-slate-200"}`}
          >
            <Cpu size={28} className={isDark ? "text-slate-700" : "text-slate-300"} />
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? "text-slate-600" : "text-slate-400"}`}
            >
              Queue Empty
            </span>
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
              selectedContentTypes={selectedContentFilters}
              onContentTypesChange={setSelectedContentFilters}
              isDark={isDark}
              totalItems={queue.length}
              filteredCount={filteredQueue.length}
            />

            {(onClearAll ||
              onClearByFilter ||
              onBulkAttachImages ||
              onBulkAIOptimize ||
              onBulkModify) && (
              <div ref={clearMenuRef} className="relative flex items-center justify-end gap-2">
                {pendingCount > 0 && (onBulkAttachImages || onBulkAIOptimize || onBulkModify) && (
                  <button
                    onClick={() => setShowBulkActions(true)}
                    title="Bulk actions for pending prompts"
                    className={`flex min-h-[40px] items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                      isDark
                        ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/20"
                        : "border-indigo-300 bg-indigo-50 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-100"
                    }`}
                  >
                    <Layers size={14} />
                    <span>Bulk Actions</span>
                  </button>
                )}
                <button
                  onClick={() => setShowClearMenu(!showClearMenu)}
                  title="Clear queue items"
                  className={`flex min-h-[40px] items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                    isDark
                      ? "border-red-500/30 bg-red-500/10 text-red-400 hover:border-red-500/50 hover:bg-red-500/20"
                      : "border-red-300 bg-red-50 text-red-600 hover:border-red-400 hover:bg-red-100"
                  }`}
                >
                  <Trash2 size={14} />
                  <span>Clear</span>
                </button>

                {showClearMenu && (
                  <div
                    className={`absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-xl border shadow-xl ${
                      isDark ? "border-white/10 bg-gray-900" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="p-2">
                      {onClearAll && (
                        <button
                          onClick={() => {
                            onClearAll();
                            setShowClearMenu(false);
                          }}
                          className={`flex min-h-[40px] w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                            isDark
                              ? "text-red-400 hover:bg-red-500/20"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                        >
                          <Trash2 size={14} />
                          Clear All ({queue.length})
                        </button>
                      )}

                      {onClearByFilter && (
                        <>
                          <div
                            className={`my-2 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}
                          />
                          <div
                            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${isDark ? "text-white/40" : "text-slate-400"}`}
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
                                className={`flex min-h-[36px] w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                  isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                                }`}
                              >
                                <span className="capitalize">{status}</span>
                                <span
                                  className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}
                                >
                                  {count}
                                </span>
                              </button>
                            );
                          })}

                          <div
                            className={`my-2 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}
                          />
                          <div
                            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${isDark ? "text-white/40" : "text-slate-400"}`}
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
                                  className={`flex min-h-[36px] w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                    isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    {React.createElement(toolInfo.icon, { size: 14 })}
                                    {toolInfo.label}
                                  </span>
                                  <span
                                    className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}
                                  >
                                    {count}
                                  </span>
                                </button>
                              );
                            })}

                          <div
                            className={`my-2 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}
                          />
                          <div
                            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${isDark ? "text-white/40" : "text-slate-400"}`}
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
                                className={`flex min-h-[36px] w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                  isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                                }`}
                              >
                                <span>{modeInfo.label}</span>
                                <span
                                  className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}
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
                      searchText={searchText}
                      onRemove={onRemoveFromQueue}
                      onRetry={onRetryQueueItem}
                      onDuplicate={onDuplicateItem}
                      onDuplicateWithAI={onDuplicateWithAI}
                      onEdit={
                        onEditItem
                          ? (id, prompt) => {
                              const item = queue.find((i) => i.id === id);
                              // Check if entering edit mode (prompt equals original and not already editing)
                              // or saving/exiting (prompt different or already in edit mode)
                              if (item && prompt === item.originalPrompt && editingItemId !== id) {
                                // Enter edit mode
                                setEditingItemId(id);
                              } else {
                                // Save if changed, then exit edit mode
                                if (item && prompt !== item.originalPrompt) {
                                  onEditItem(id, prompt);
                                }
                                setEditingItemId(null);
                              }
                            }
                          : undefined
                      }
                      onRunSingle={onRunSingleItem}
                      onUpdateImages={onUpdateItemImages}
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
