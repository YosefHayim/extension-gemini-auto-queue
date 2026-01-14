import { Check, ClipboardCopy, File, Paperclip, Pencil, RefreshCw, Wand2, X } from "lucide-react";
import React, { useRef, useState } from "react";

import { GEMINI_MODE_INFO, GEMINI_TOOL_INFO, GeminiMode, GeminiTool, QueueStatus } from "@/types";

type BulkActionType = "attach" | "ai" | "modify" | "reset" | "copy" | null;

export interface ResetFilter {
  type: "all" | "text" | "hasImages" | "tool" | "mode" | "status";
  textMatch?: string;
  tool?: GeminiTool;
  mode?: GeminiMode;
  status?: QueueStatus;
}

interface BulkActionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  hasApiKey: boolean;
  pendingCount: number;
  totalCount: number;
  completedCount: number;
  failedCount: number;
  onBulkAttach: (images: string[]) => void;
  onBulkAIOptimize: (instructions: string) => void;
  onBulkModify: (text: string, position: "prepend" | "append") => void;
  onBulkReset: (filter: ResetFilter) => void;
  onCopyAllPrompts: () => string;
}

export const BulkActionsDialog: React.FC<BulkActionsDialogProps> = ({
  isOpen,
  onClose,
  isDark,
  hasApiKey,
  pendingCount,
  totalCount,
  completedCount,
  failedCount,
  onBulkAttach,
  onBulkAIOptimize,
  onBulkModify,
  onBulkReset,
  onCopyAllPrompts,
}) => {
  const [activeAction, setActiveAction] = useState<BulkActionType>(null);
  const [selectedFiles, setSelectedFiles] = useState<
    { data: string; name: string; type: string }[]
  >([]);
  const [aiInstructions, setAiInstructions] = useState("");
  const [modifyText, setModifyText] = useState("");
  const [modifyPosition, setModifyPosition] = useState<"prepend" | "append">("append");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resetFilterType, setResetFilterType] = useState<ResetFilter["type"]>("all");
  const [resetTextMatch, setResetTextMatch] = useState("");
  const [resetTool, setResetTool] = useState<GeminiTool | null>(null);
  const [resetMode, setResetMode] = useState<GeminiMode | null>(null);
  const [resetStatus, setResetStatus] = useState<QueueStatus | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resettableCount = completedCount + failedCount;

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    e.target.value = "";

    const readPromises = files.map((file) => {
      return new Promise<{ data: string; name: string; type: string } | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target?.result;
          if (typeof data === "string" && data.length > 0) {
            resolve({
              data,
              name: file.name,
              type: file.type,
            });
          } else {
            console.warn(`[NanoFlow] Failed to read file: ${file.name}`);
            resolve(null);
          }
        };
        reader.onerror = () => {
          console.warn(`[NanoFlow] Error reading file: ${file.name}`);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    });

    const newFiles = await Promise.all(readPromises);
    const validFiles = newFiles.filter(
      (f): f is { data: string; name: string; type: string } => f !== null
    );

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      if (activeAction === "attach" && selectedFiles.length > 0) {
        onBulkAttach(selectedFiles.map((f) => f.data));
      } else if (activeAction === "ai" && aiInstructions.trim()) {
        await onBulkAIOptimize(aiInstructions.trim());
      } else if (activeAction === "modify" && modifyText.trim()) {
        onBulkModify(modifyText.trim(), modifyPosition);
      } else if (activeAction === "reset") {
        const filter: ResetFilter = { type: resetFilterType };
        if (resetFilterType === "text" && resetTextMatch.trim()) {
          filter.textMatch = resetTextMatch.trim();
        } else if (resetFilterType === "tool" && resetTool) {
          filter.tool = resetTool;
        } else if (resetFilterType === "mode" && resetMode) {
          filter.mode = resetMode;
        } else if (resetFilterType === "status" && resetStatus) {
          filter.status = resetStatus;
        }
        onBulkReset(filter);
      }
      handleClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setActiveAction(null);
    setSelectedFiles([]);
    setAiInstructions("");
    setModifyText("");
    setModifyPosition("append");
    setResetFilterType("all");
    setResetTextMatch("");
    setResetTool(null);
    setResetMode(null);
    setResetStatus(null);
    setCopySuccess(false);
    onClose();
  };

  const handleCopyAll = async () => {
    const promptsText = onCopyAllPrompts();
    try {
      await navigator.clipboard.writeText(promptsText);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        handleClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to copy prompts:", err);
    }
  };

  const actionButtons = [
    {
      type: "attach" as const,
      icon: Paperclip,
      label: "Attach Files",
      description: "Add reference files (images, videos, etc.) to all pending prompts",
      available: pendingCount > 0,
      count: pendingCount,
    },
    {
      type: "ai" as const,
      icon: Wand2,
      label: "AI Optimize",
      description: hasApiKey ? "Enhance all prompts with AI" : "Requires API key in Settings",
      available: hasApiKey && pendingCount > 0,
      count: pendingCount,
    },
    {
      type: "modify" as const,
      icon: Pencil,
      label: "Bulk Modify",
      description: "Add text to all pending prompts",
      available: pendingCount > 0,
      count: pendingCount,
    },
    {
      type: "reset" as const,
      icon: RefreshCw,
      label: "Reset Prompts",
      description:
        resettableCount > 0 ? "Reset completed/failed prompts to re-run" : "No prompts to reset",
      available: resettableCount > 0,
      count: resettableCount,
    },
    {
      type: "copy" as const,
      icon: ClipboardCopy,
      label: "Copy All Prompts",
      description:
        totalCount > 0
          ? "Copy all prompts to clipboard for use in another browser"
          : "No prompts to copy",
      available: totalCount > 0,
      count: totalCount,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`mx-4 w-full max-w-sm rounded-xl border shadow-2xl ${
          isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        <div className="${isDark ? 'border-slate-700' : 'border-slate-200'} flex items-center justify-between border-b p-4">
          <div>
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Bulk Actions
            </h3>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Apply to {pendingCount} pending prompt{pendingCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`rounded-lg p-2 transition-colors ${
              isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          {!activeAction ? (
            <div className="space-y-2">
              {actionButtons.map((action) => (
                <button
                  key={action.type}
                  onClick={() => {
                    if (!action.available) return;
                    if (action.type === "copy") {
                      handleCopyAll();
                    } else {
                      setActiveAction(action.type);
                    }
                  }}
                  disabled={!action.available || (action.type === "copy" && copySuccess)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    action.type === "copy" && copySuccess
                      ? "border-green-500 bg-green-500/20"
                      : action.available
                        ? isDark
                          ? "border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-700"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                        : "cursor-not-allowed opacity-50"
                  }`}
                >
                  <div
                    className={`rounded-lg p-2 ${
                      action.type === "copy" && copySuccess
                        ? "bg-green-500/20 text-green-500"
                        : action.type === "ai"
                          ? "bg-violet-500/20 text-violet-500"
                          : action.type === "attach"
                            ? "bg-indigo-500/20 text-indigo-500"
                            : action.type === "reset"
                              ? "bg-amber-500/20 text-amber-500"
                              : action.type === "copy"
                                ? "bg-cyan-500/20 text-cyan-500"
                                : "bg-emerald-500/20 text-emerald-500"
                    }`}
                  >
                    {action.type === "copy" && copySuccess ? (
                      <Check size={18} />
                    ) : (
                      <action.icon size={18} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`text-sm font-semibold ${
                        action.type === "copy" && copySuccess
                          ? "text-green-500"
                          : isDark
                            ? "text-white"
                            : "text-slate-900"
                      }`}
                    >
                      {action.type === "copy" && copySuccess ? "Copied!" : action.label}
                    </div>
                    <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {action.type === "copy" && copySuccess
                        ? "Prompts copied to clipboard"
                        : action.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : activeAction === "attach" ? (
            <div className="space-y-4">
              <button
                onClick={() => setActiveAction(null)}
                className={`text-xs font-medium ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}
              >
                &larr; Back
              </button>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-all ${
                  isDark
                    ? "border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800"
                    : "border-slate-300 hover:border-indigo-500/50 hover:bg-slate-50"
                }`}
              >
                <Paperclip size={24} className={isDark ? "text-slate-500" : "text-slate-400"} />
                <span
                  className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Click to select files (images, videos, etc.)
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />

              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={file.data}
                          className="h-12 w-12 rounded-lg object-cover"
                          alt={file.name}
                        />
                      ) : file.type.startsWith("video/") ? (
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                        >
                          <span className="text-[10px] font-bold text-blue-500">VID</span>
                        </div>
                      ) : (
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                        >
                          <File
                            size={16}
                            className={isDark ? "text-slate-400" : "text-slate-500"}
                          />
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeAction === "ai" ? (
            <div className="space-y-4">
              <button
                onClick={() => setActiveAction(null)}
                className={`text-xs font-medium ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}
              >
                &larr; Back
              </button>

              <div>
                <label
                  className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Instructions for AI
                </label>
                <textarea
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  placeholder="e.g., Make more detailed, add cinematic lighting, improve composition..."
                  className={`min-h-[100px] w-full rounded-lg border p-3 text-sm outline-none transition-colors ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-violet-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500"
                  }`}
                />
                <p className={`mt-1.5 text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  AI will enhance each prompt based on these instructions
                </p>
              </div>
            </div>
          ) : activeAction === "modify" ? (
            <div className="space-y-4">
              <button
                onClick={() => setActiveAction(null)}
                className={`text-xs font-medium ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}
              >
                &larr; Back
              </button>

              <div>
                <label
                  className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Text to Add
                </label>
                <textarea
                  value={modifyText}
                  onChange={(e) => setModifyText(e.target.value)}
                  placeholder="e.g., 4K, cinematic, dramatic lighting..."
                  className={`min-h-[80px] w-full rounded-lg border p-3 text-sm outline-none transition-colors ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Position
                </label>
                <div className="flex gap-2">
                  {(["prepend", "append"] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setModifyPosition(pos)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-all ${
                        modifyPosition === pos
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-500"
                          : isDark
                            ? "border-slate-700 text-slate-400 hover:border-slate-600"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {pos === "prepend" ? "Before" : "After"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : activeAction === "reset" ? (
            <div className="space-y-4">
              <button
                onClick={() => setActiveAction(null)}
                className={`text-xs font-medium ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}
              >
                &larr; Back
              </button>

              <div>
                <label
                  className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Reset Filter
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { type: "all", label: "All" },
                      { type: "status", label: "By Status" },
                      { type: "text", label: "By Text" },
                      { type: "hasImages", label: "With Images" },
                      { type: "tool", label: "By Tool" },
                      { type: "mode", label: "By Mode" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setResetFilterType(option.type)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-all ${
                        resetFilterType === option.type
                          ? "border-amber-500 bg-amber-500/20 text-amber-500"
                          : isDark
                            ? "border-slate-700 text-slate-400 hover:border-slate-600"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {resetFilterType === "text" && (
                <div>
                  <label
                    className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Text to Match
                  </label>
                  <input
                    type="text"
                    value={resetTextMatch}
                    onChange={(e) => setResetTextMatch(e.target.value)}
                    placeholder="e.g., landscape, portrait..."
                    className={`w-full rounded-lg border p-3 text-sm outline-none transition-colors ${
                      isDark
                        ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-amber-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-amber-500"
                    }`}
                  />
                </div>
              )}

              {resetFilterType === "status" && (
                <div>
                  <label
                    className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Select Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[QueueStatus.Completed, QueueStatus.Failed, QueueStatus.Processing].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => setResetStatus(status)}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-all ${
                            resetStatus === status
                              ? "border-amber-500 bg-amber-500/20 text-amber-500"
                              : isDark
                                ? "border-slate-700 text-slate-400 hover:border-slate-600"
                                : "border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {resetFilterType === "tool" && (
                <div>
                  <label
                    className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Select Tool
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(GeminiTool)
                      .filter((t) => t !== GeminiTool.NONE)
                      .map((tool) => {
                        const toolInfo = GEMINI_TOOL_INFO[tool];
                        return (
                          <button
                            key={tool}
                            onClick={() => setResetTool(tool)}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                              resetTool === tool
                                ? "border-amber-500 bg-amber-500/20 text-amber-500"
                                : isDark
                                  ? "border-slate-700 text-slate-400 hover:border-slate-600"
                                  : "border-slate-200 text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            {React.createElement(toolInfo.icon, { size: 12 })}
                            <span>{toolInfo.label}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {resetFilterType === "mode" && (
                <div>
                  <label
                    className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Select Mode
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(GeminiMode).map((mode) => {
                      const modeInfo = GEMINI_MODE_INFO[mode];
                      return (
                        <button
                          key={mode}
                          onClick={() => setResetMode(mode)}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-all ${
                            resetMode === mode
                              ? "border-amber-500 bg-amber-500/20 text-amber-500"
                              : isDark
                                ? "border-slate-700 text-slate-400 hover:border-slate-600"
                                : "border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          {modeInfo.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {resetFilterType === "all" &&
                  `Reset all ${resettableCount} completed/failed prompts to pending`}
                {resetFilterType === "status" && "Reset prompts with the selected status"}
                {resetFilterType === "text" && "Reset prompts containing the specified text"}
                {resetFilterType === "hasImages" && "Reset prompts that have attached images"}
                {resetFilterType === "tool" && "Reset prompts using the selected tool"}
                {resetFilterType === "mode" && "Reset prompts using the selected mode"}
              </p>
            </div>
          ) : null}
        </div>

        {activeAction && (
          <div className={`border-t p-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <button
              onClick={handleSubmit}
              disabled={
                isProcessing ||
                (activeAction === "attach" && selectedFiles.length === 0) ||
                (activeAction === "ai" && !aiInstructions.trim()) ||
                (activeAction === "modify" && !modifyText.trim()) ||
                (activeAction === "reset" &&
                  resetFilterType === "text" &&
                  !resetTextMatch.trim()) ||
                (activeAction === "reset" && resetFilterType === "tool" && !resetTool) ||
                (activeAction === "reset" && resetFilterType === "mode" && !resetMode) ||
                (activeAction === "reset" && resetFilterType === "status" && !resetStatus)
              }
              className={`w-full rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all disabled:opacity-50 ${
                activeAction === "ai"
                  ? "bg-violet-600 hover:bg-violet-500"
                  : activeAction === "attach"
                    ? "bg-indigo-600 hover:bg-indigo-500"
                    : activeAction === "reset"
                      ? "bg-amber-600 hover:bg-amber-500"
                      : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              {isProcessing
                ? "Processing..."
                : activeAction === "attach"
                  ? `Attach to ${pendingCount} Prompts`
                  : activeAction === "ai"
                    ? `Optimize ${pendingCount} Prompts`
                    : activeAction === "reset"
                      ? `Reset ${resetFilterType === "all" ? resettableCount : ""} Prompts`
                      : `Modify ${pendingCount} Prompts`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkActionsDialog;
