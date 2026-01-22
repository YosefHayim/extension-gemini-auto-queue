import {
  AlertTriangle,
  Check,
  Clock,
  Copy,
  File,
  GripVertical,
  Link,
  Paperclip,
  Pencil,
  Play,
  RefreshCw,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { StatusBadge } from "@/components/StatusBadge";
import {
  ErrorCategory,
  GEMINI_MODE_INFO,
  GEMINI_TOOL_INFO,
  GeminiMode,
  GeminiTool,
  QueueItem,
  QueueStatus,
} from "@/types";
import { getErrorCategoryLabel } from "@/utils/retryStrategy";

const MAX_IMAGES_PER_CARD = 10;

interface QueueItemCardProps {
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
  isEditing?: boolean;
  dragHandleProps?: Record<string, unknown>;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  showCheckbox?: boolean;
}

const HighlightedText: React.FC<{ text: string; search: string; isDark: boolean }> = ({
  text,
  search,
  isDark,
}) => {
  if (!search.trim()) return <>{text}</>;

  const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className={`rounded px-0.5 ${isDark ? "bg-yellow-500/40 text-yellow-200" : "bg-yellow-300 text-yellow-900"}`}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

const STATUS_BORDER_STYLES: Record<QueueStatus, string> = {
  [QueueStatus.Pending]: "border-l-amber-400",
  [QueueStatus.Processing]: "border-l-blue-500 animate-pulse",
  [QueueStatus.Completed]: "border-l-emerald-500",
  [QueueStatus.Failed]: "border-l-red-500",
};

const MODE_BADGE_STYLES: Record<GeminiMode, { light: string; dark: string }> = {
  [GeminiMode.Quick]: {
    light: "bg-emerald-50 text-emerald-600",
    dark: "bg-emerald-500/10 text-emerald-400",
  },
  [GeminiMode.Deep]: {
    light: "bg-blue-50 text-blue-600",
    dark: "bg-blue-500/10 text-blue-400",
  },
  [GeminiMode.Pro]: {
    light: "bg-purple-50 text-purple-600",
    dark: "bg-purple-500/10 text-purple-400",
  },
};

export const QueueItemCard: React.FC<QueueItemCardProps> = ({
  item,
  isDark,
  searchText = "",
  onRemove,
  onRetry,
  onDuplicate,
  onDuplicateWithAI,
  onEdit,
  onRunSingle,
  onUpdateImages,
  isEditing = false,
  dragHandleProps,
  isSelected = false,
  onToggleSelect,
  showCheckbox = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [editValue, setEditValue] = useState(item.originalPrompt);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const textRef = useRef<HTMLParagraphElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const isOverflowing = textRef.current.scrollHeight > textRef.current.clientHeight;
      setIsTruncated(isOverflowing);
    }
  }, [item.originalPrompt]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(item.originalPrompt);
  }, [item.originalPrompt]);

  useEffect(() => {
    if (!showImageMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (imageMenuRef.current && !imageMenuRef.current.contains(event.target as Node)) {
        setShowImageMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showImageMenu]);

  const currentImageCount = item.images?.length ?? 0;
  const canAddMoreImages = currentImageCount < MAX_IMAGES_PER_CARD;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || !onUpdateImages) return;

    const remainingSlots = MAX_IMAGES_PER_CARD - currentImageCount;
    const filesToProcess = files.slice(0, remainingSlots);

    const readPromises = filesToProcess.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readPromises).then((newImages) => {
      onUpdateImages(item.id, [...(item.images ?? []), ...newImages]);
    });

    e.target.value = "";
    setShowImageMenu(false);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim() || !onUpdateImages || !canAddMoreImages) return;
    onUpdateImages(item.id, [...(item.images ?? []), imageUrlInput.trim()]);
    setImageUrlInput("");
    setShowImageMenu(false);
  };

  const handleRemoveImage = (index: number) => {
    if (!onUpdateImages) return;
    const newImages = [...(item.images ?? [])];
    newImages.splice(index, 1);
    onUpdateImages(item.id, newImages);
  };

  const toolInfo = item.tool ? GEMINI_TOOL_INFO[item.tool] : GEMINI_TOOL_INFO[GeminiTool.IMAGE];
  const modeInfo = item.mode ? GEMINI_MODE_INFO[item.mode] : null;
  const modeStyles = item.mode ? MODE_BADGE_STYLES[item.mode] : null;

  const handleEditSubmit = () => {
    if (onEdit) {
      onEdit(item.id, editValue.trim());
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    }
    if (e.key === "Escape") {
      setEditValue(item.originalPrompt);
      if (onEdit) {
        onEdit(item.id, item.originalPrompt);
      }
    }
  };

  const isPending = item.status === QueueStatus.Pending;
  const isFailed = item.status === QueueStatus.Failed;
  const isCompleted = item.status === QueueStatus.Completed;
  const hasCompletionTime = isCompleted && item.completionTimeSeconds !== undefined;
  const hasImages = item.images && item.images.length > 0;
  const displayedImages = hasImages ? item.images!.slice(0, 5) : [];
  const remainingImagesCount = hasImages && item.images!.length > 5 ? item.images!.length - 5 : 0;

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border-l-[3px] transition-all duration-150 ${STATUS_BORDER_STYLES[item.status]} ${
        isDark
          ? "bg-slate-800/50 shadow-sm shadow-black/10 hover:bg-slate-800/70"
          : "bg-white shadow-sm shadow-slate-200/60 hover:shadow-md hover:shadow-slate-200/80"
      }`}
    >
      <div className="relative flex items-start gap-2 p-3">
        {(showCheckbox || isSelected) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect?.(item.id);
            }}
            className={`mt-0.5 flex min-h-[28px] min-w-[28px] items-center justify-center rounded-md border-2 transition-all ${
              isSelected
                ? "border-indigo-500 bg-indigo-500 text-white"
                : isDark
                  ? "border-slate-600 hover:border-slate-500"
                  : "border-slate-300 hover:border-slate-400"
            }`}
          >
            {isSelected && <Check size={14} strokeWidth={3} />}
          </button>
        )}
        <div
          {...dragHandleProps}
          className={`mt-0.5 flex min-h-[28px] min-w-[28px] cursor-grab items-center justify-center rounded transition-colors active:cursor-grabbing ${isDark ? "text-slate-600 hover:text-slate-400" : "text-slate-300 hover:text-slate-400"}`}
          title="Drag to reorder"
        >
          <GripVertical size={14} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={item.status} errorMessage={item.error} />

            <span
              title={toolInfo.description}
              className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isDark ? "bg-slate-700/50 text-slate-400" : "bg-slate-100 text-slate-500"}`}
            >
              {React.createElement(toolInfo.icon, { size: 10 })}
              <span>{toolInfo.label}</span>
            </span>

            {modeInfo && modeStyles && (
              <span
                title={modeInfo.description}
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${isDark ? modeStyles.dark : modeStyles.light}`}
              >
                {modeInfo.label}
              </span>
            )}

            {hasCompletionTime && (
              <span
                title="Completion time"
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}
              >
                <Clock size={10} />
                <span>{item.completionTimeSeconds?.toFixed(1)}s</span>
              </span>
            )}

            {item.retryInfo && item.retryInfo.attempts > 0 && (
              <span
                title={`${getErrorCategoryLabel(item.retryInfo.errorCategory)} - Attempt ${item.retryInfo.attempts}/${item.retryInfo.maxAttempts}`}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                  item.retryInfo.errorCategory === ErrorCategory.CONTENT_POLICY
                    ? isDark
                      ? "bg-red-500/10 text-red-400"
                      : "bg-red-50 text-red-600"
                    : isDark
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-amber-50 text-amber-600"
                }`}
              >
                <AlertTriangle size={10} />
                <span>
                  {item.retryInfo.attempts}/{item.retryInfo.maxAttempts}
                </span>
              </span>
            )}
          </div>

          {isEditing && isPending ? (
            <textarea
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleEditKeyDown}
              className={`w-full resize-none rounded-md border p-2.5 text-sm leading-relaxed outline-none transition-colors ${
                isDark
                  ? "border-indigo-500/50 bg-slate-900 text-slate-200 focus:border-indigo-400"
                  : "border-indigo-300 bg-white text-slate-700 focus:border-indigo-500"
              }`}
              rows={3}
            />
          ) : (
            <div
              className="relative"
              onMouseEnter={() => {
                if (isTruncated && textRef.current) {
                  const rect = textRef.current.getBoundingClientRect();
                  setTooltipPos({ top: rect.top - 8, left: rect.left });
                  setIsHovered(true);
                }
              }}
              onMouseLeave={() => setIsHovered(false)}
            >
              <p
                ref={textRef}
                onClick={() => {
                  if (isPending && onEdit) {
                    onEdit(item.id, item.originalPrompt);
                  }
                }}
                className={`line-clamp-2 text-sm font-medium leading-snug ${isDark ? "text-slate-200" : "text-slate-700"} ${isPending && onEdit ? "-mx-1 cursor-text rounded px-1 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-700/50" : ""}`}
              >
                <HighlightedText text={item.originalPrompt} search={searchText} isDark={isDark} />
              </p>

              {isHovered && isTruncated && (
                <div
                  style={{
                    top: tooltipPos.top,
                    left: tooltipPos.left,
                    transform: "translateY(-100%)",
                  }}
                  className={`pointer-events-none fixed z-[2147483647] max-h-48 w-72 overflow-auto rounded-md px-3 py-2 text-xs shadow-lg ${isDark ? "border border-slate-700 bg-slate-900 text-slate-200" : "border border-slate-200 bg-white text-slate-700 shadow-slate-200/50"}`}
                >
                  <p className="whitespace-pre-wrap break-words leading-relaxed">
                    <HighlightedText
                      text={item.originalPrompt}
                      search={searchText}
                      isDark={isDark}
                    />
                  </p>
                </div>
              )}
            </div>
          )}

          {(hasImages || (isPending && onUpdateImages)) && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {displayedImages.map((img, idx) => {
                const isImage =
                  img.startsWith("data:image/") || img.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                const isVideo =
                  img.startsWith("data:video/") || img.match(/\.(mp4|webm|mov|avi)$/i);
                return (
                  <div
                    key={idx}
                    className={`group/img relative overflow-hidden rounded transition-transform hover:scale-105 ${isDark ? "ring-1 ring-slate-600" : "ring-1 ring-slate-200"}`}
                  >
                    {isImage ? (
                      <img
                        src={img}
                        alt={`Reference ${idx + 1}`}
                        className="h-7 w-7 object-cover"
                      />
                    ) : isVideo ? (
                      <div
                        className={`flex h-7 w-7 items-center justify-center ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                      >
                        <span className="text-[8px] font-bold text-blue-500">VID</span>
                      </div>
                    ) : (
                      <div
                        className={`flex h-7 w-7 items-center justify-center ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                      >
                        <File size={12} className={isDark ? "text-slate-400" : "text-slate-500"} />
                      </div>
                    )}
                    {isPending && onUpdateImages && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover/img:opacity-100"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    )}
                  </div>
                );
              })}
              {remainingImagesCount > 0 && (
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded text-[9px] font-bold ${isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}
                >
                  +{remainingImagesCount}
                </div>
              )}
              {isPending && onUpdateImages && canAddMoreImages && (
                <div ref={imageMenuRef} className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowImageMenu(!showImageMenu);
                    }}
                    title={`Add files (${currentImageCount}/${MAX_IMAGES_PER_CARD})`}
                    className={`flex h-7 w-7 items-center justify-center rounded border border-dashed transition-colors ${
                      isDark
                        ? "border-slate-600 text-slate-500 hover:border-indigo-500 hover:text-indigo-400"
                        : "border-slate-300 text-slate-400 hover:border-indigo-500 hover:text-indigo-500"
                    }`}
                  >
                    <Paperclip size={12} />
                  </button>

                  {showImageMenu && (
                    <div
                      className={`absolute bottom-full left-0 z-[9999] mb-2 w-56 rounded-lg border p-2 shadow-xl ${
                        isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="mb-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                            isDark
                              ? "text-slate-300 hover:bg-slate-800"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <Upload size={14} />
                          Upload files
                        </button>
                      </div>
                      <div
                        className={`border-t pt-2 ${isDark ? "border-slate-700" : "border-slate-200"}`}
                      >
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddImageUrl()}
                            placeholder="Paste image URL..."
                            className={`flex-1 rounded-md border px-2 py-1.5 text-xs outline-none ${
                              isDark
                                ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                                : "border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400"
                            }`}
                          />
                          <button
                            onClick={handleAddImageUrl}
                            disabled={!imageUrlInput.trim()}
                            className={`rounded-md px-2 py-1.5 transition-colors disabled:opacity-50 ${
                              isDark
                                ? "bg-indigo-600 text-white hover:bg-indigo-500"
                                : "bg-indigo-500 text-white hover:bg-indigo-600"
                            }`}
                          >
                            <Link size={12} />
                          </button>
                        </div>
                      </div>
                      <p
                        className={`mt-2 text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      >
                        {currentImageCount}/{MAX_IMAGES_PER_CARD} files
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={`flex shrink-0 items-center gap-0.5 transition-opacity duration-150 ${isEditing ? "hidden" : ""} ${isDark ? "opacity-0 group-hover:opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          {(isPending || isFailed) && onRunSingle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRunSingle(item.id);
              }}
              title="Run this prompt now"
              className={`flex min-h-[28px] min-w-[28px] items-center justify-center rounded transition-colors ${
                isDark
                  ? "text-emerald-500 hover:bg-emerald-500/15 hover:text-emerald-400"
                  : "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
              }`}
            >
              <Play size={14} fill="currentColor" />
            </button>
          )}

          {isPending && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item.id, item.originalPrompt);
              }}
              title="Edit prompt"
              className={`flex min-h-[28px] min-w-[28px] items-center justify-center rounded transition-colors ${
                isDark
                  ? "text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`}
            >
              <Pencil size={14} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(item.id);
            }}
            title="Duplicate this prompt"
            className={`flex min-h-[28px] min-w-[28px] items-center justify-center rounded transition-colors ${
              isDark
                ? "text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
          >
            <Copy size={14} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateWithAI(item.id);
            }}
            title="Duplicate and enhance with AI"
            className={`flex min-h-[28px] min-w-[28px] items-center justify-center rounded transition-colors ${
              isDark
                ? "text-violet-400 hover:bg-violet-500/15 hover:text-violet-300"
                : "text-violet-400 hover:bg-violet-50 hover:text-violet-500"
            }`}
          >
            <Wand2 size={14} />
          </button>

          {isFailed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetry(item.id);
              }}
              title="Retry this prompt"
              className={`flex min-h-[28px] min-w-[28px] items-center justify-center rounded transition-colors ${
                isDark
                  ? "text-blue-400 hover:bg-blue-500/15 hover:text-blue-300"
                  : "text-blue-400 hover:bg-blue-50 hover:text-blue-500"
              }`}
            >
              <RefreshCw size={14} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            title="Remove from queue"
            className={`flex min-h-[28px] min-w-[28px] items-center justify-center rounded transition-colors ${
              isDark
                ? "text-red-400/70 hover:bg-red-500/15 hover:text-red-400"
                : "text-red-400 hover:bg-red-50 hover:text-red-500"
            }`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueItemCard;
