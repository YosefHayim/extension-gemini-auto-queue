import { Clock, Copy, GripVertical, Pencil, Play, RefreshCw, Trash2, Wand2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { StatusBadge } from "@/components/StatusBadge";
import {
  GEMINI_MODE_INFO,
  GEMINI_TOOL_INFO,
  GeminiMode,
  GeminiTool,
  QueueItem,
  QueueStatus,
} from "@/types";

interface QueueItemCardProps {
  item: QueueItem;
  isDark: boolean;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDuplicateWithAI: (id: string) => void;
  onEdit?: (id: string, newPrompt: string) => void;
  onRunSingle?: (id: string) => void;
  isEditing?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

const STATUS_BORDER_STYLES: Record<QueueStatus, string> = {
  [QueueStatus.Pending]: "border-l-amber-500",
  [QueueStatus.Processing]: "border-l-blue-500 animate-pulse",
  [QueueStatus.Completed]: "border-l-green-500",
  [QueueStatus.Failed]: "border-l-red-500",
};

const MODE_BADGE_STYLES: Record<GeminiMode, { light: string; dark: string }> = {
  [GeminiMode.Quick]: {
    light: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  [GeminiMode.Deep]: {
    light: "bg-blue-100 text-blue-700 border-blue-200",
    dark: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  [GeminiMode.Pro]: {
    light: "bg-purple-100 text-purple-700 border-purple-200",
    dark: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
};

export const QueueItemCard: React.FC<QueueItemCardProps> = ({
  item,
  isDark,
  onRemove,
  onRetry,
  onDuplicate,
  onDuplicateWithAI,
  onEdit,
  onRunSingle,
  isEditing = false,
  dragHandleProps,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [editValue, setEditValue] = useState(item.originalPrompt);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const textRef = useRef<HTMLParagraphElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const toolInfo = item.tool ? GEMINI_TOOL_INFO[item.tool] : GEMINI_TOOL_INFO[GeminiTool.IMAGE];
  const modeInfo = item.mode ? GEMINI_MODE_INFO[item.mode] : null;
  const modeStyles = item.mode ? MODE_BADGE_STYLES[item.mode] : null;

  const handleEditSubmit = () => {
    if (onEdit && editValue.trim() !== item.originalPrompt) {
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
      className={`group relative overflow-hidden rounded-lg border-l-4 transition-all duration-200 ${STATUS_BORDER_STYLES[item.status]} ${
        isDark
          ? "border border-l-4 border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
          : "border border-l-4 border-slate-100 bg-white shadow-sm hover:shadow-md"
      } `}
    >
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${isDark ? "bg-gradient-to-r from-white/[0.02] to-transparent" : "bg-gradient-to-r from-slate-50/50 to-transparent"} `}
      />

      <div className="relative flex items-start gap-2 p-3">
        <div
          {...dragHandleProps}
          className={`mt-0.5 cursor-grab rounded p-1 transition-colors active:cursor-grabbing ${isDark ? "text-white/20 hover:bg-white/10 hover:text-white/40" : "text-slate-300 hover:bg-slate-100 hover:text-slate-500"} `}
          title="Drag to reorder"
        >
          <GripVertical size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={item.status} />

            <span
              title={toolInfo.description}
              className={`flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${isDark ? "border-white/10 bg-white/5 text-white/60" : "border-slate-200 bg-slate-50 text-slate-600"} `}
            >
              {React.createElement(toolInfo.icon, { size: 10 })}
              <span>{toolInfo.label}</span>
            </span>

            {modeInfo && modeStyles && (
              <span
                title={modeInfo.description}
                className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${isDark ? modeStyles.dark : modeStyles.light} `}
              >
                {modeInfo.label}
              </span>
            )}

            {hasCompletionTime && (
              <span
                title="Completion time"
                className={`flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${isDark ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-green-200 bg-green-50 text-green-700"} `}
              >
                <Clock size={10} />
                <span>{item.completionTimeSeconds?.toFixed(1)}s</span>
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
              className={`w-full resize-none rounded-md border p-2 text-xs leading-relaxed outline-none transition-colors ${
                isDark
                  ? "border-blue-500/50 bg-white/5 text-white/90 focus:border-blue-400"
                  : "border-blue-300 bg-white text-slate-700 focus:border-blue-500"
              } `}
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
                className={`line-clamp-2 text-xs font-medium leading-relaxed ${isDark ? "text-white/70" : "text-slate-600"} `}
              >
                {item.originalPrompt}
              </p>

              {isHovered && isTruncated && (
                <div
                  style={{
                    top: tooltipPos.top,
                    left: tooltipPos.left,
                    transform: "translateY(-100%)",
                  }}
                  className={`pointer-events-none fixed z-[2147483647] max-h-48 w-72 overflow-auto rounded-lg px-3 py-2.5 text-xs shadow-xl ${isDark ? "border border-white/20 bg-slate-900 text-white/90" : "bg-slate-800 text-white"} `}
                >
                  <p className="whitespace-pre-wrap break-words leading-relaxed">
                    {item.originalPrompt}
                  </p>
                </div>
              )}
            </div>
          )}

          {hasImages && (
            <div className="mt-2.5 flex gap-1.5">
              {displayedImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`overflow-hidden rounded-md transition-transform hover:scale-105 ${isDark ? "ring-1 ring-white/10" : "ring-1 ring-slate-200"} `}
                >
                  <img src={img} alt={`Reference ${idx + 1}`} className="h-8 w-8 object-cover" />
                </div>
              ))}
              {remainingImagesCount > 0 && (
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-bold ${isDark ? "bg-white/10 text-white/50" : "bg-slate-100 text-slate-500"} `}
                >
                  +{remainingImagesCount}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={`flex shrink-0 items-center gap-0.5 transition-opacity duration-150 ${isDark ? "opacity-0 group-hover:opacity-100" : "opacity-0 group-hover:opacity-100"} `}
        >
          {(isPending || isFailed) && onRunSingle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRunSingle(item.id);
              }}
              title="Run this prompt now"
              className={`rounded-md p-1.5 transition-colors ${
                isDark
                  ? "text-green-400/60 hover:bg-green-500/20 hover:text-green-300"
                  : "text-green-500 hover:bg-green-50 hover:text-green-600"
              } `}
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
              className={`rounded-md p-1.5 transition-colors ${
                isDark
                  ? "text-white/40 hover:bg-white/10 hover:text-white/80"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              } `}
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
            className={`rounded-md p-1.5 transition-colors ${
              isDark
                ? "text-white/40 hover:bg-white/10 hover:text-white/80"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            } `}
          >
            <Copy size={14} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateWithAI(item.id);
            }}
            title="Duplicate and enhance with AI"
            className={`rounded-md p-1.5 transition-colors ${
              isDark
                ? "text-violet-400/60 hover:bg-violet-500/20 hover:text-violet-300"
                : "text-violet-400 hover:bg-violet-50 hover:text-violet-600"
            } `}
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
              className={`rounded-md p-1.5 transition-colors ${
                isDark
                  ? "text-blue-400/60 hover:bg-blue-500/20 hover:text-blue-300"
                  : "text-blue-400 hover:bg-blue-50 hover:text-blue-600"
              } `}
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
            className={`rounded-md p-1.5 transition-colors ${
              isDark
                ? "text-red-400/50 hover:bg-red-500/20 hover:text-red-400"
                : "text-red-300 hover:bg-red-50 hover:text-red-500"
            } `}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueItemCard;
