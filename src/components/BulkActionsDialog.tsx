import {
  Check,
  ClipboardCopy,
  Download,
  File,
  ImageMinus,
  Paperclip,
  Pencil,
  RefreshCw,
  Type,
  Wand2,
  X,
} from "lucide-react";
import {
  GEMINI_MODE_INFO,
  GEMINI_TOOL_INFO,
  GeminiMode,
  GeminiTool,
  QueueItem,
  QueueStatus,
} from "@/types";
import React, { useRef, useState } from "react";

type BulkActionType =
  | "attach"
  | "ai"
  | "modify"
  | "reset"
  | "copy"
  | "removeText"
  | "removeFiles"
  | "downloadChat"
  | null;

export interface ResetFilter {
  type: "all" | "text" | "hasImages" | "tool" | "mode" | "status";
  textMatch?: string;
  tool?: GeminiTool;
  mode?: GeminiMode;
  status?: QueueStatus;
}

export interface ChatMediaCounts {
  images: number;
  videos: number;
  files: number;
  total: number;
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
  pendingItems: QueueItem[];
  onBulkAttach: (images: string[]) => void;
  onBulkAIOptimize: (instructions: string) => void;
  onOpenAIOptimization?: () => void;
  onBulkModify: (text: string, position: "prepend" | "append") => void;
  onBulkReset: (filter: ResetFilter) => void;
  onCopyAllPrompts: () => string;
  onBulkRemoveText: (text: string) => void;
  onBulkRemoveFiles: (indices: number[] | "all") => void;
  onScanChatMedia?: () => Promise<ChatMediaCounts | null>;
  onDownloadChatMedia?: (
    method: "native" | "direct",
    filterType?: "image" | "video" | "file"
  ) => Promise<void>;
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
  pendingItems,
  onBulkAttach,
  onBulkAIOptimize,
  onOpenAIOptimization,
  onBulkModify,
  onBulkReset,
  onCopyAllPrompts,
  onBulkRemoveText,
  onBulkRemoveFiles,
  onScanChatMedia,
  onDownloadChatMedia,
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
  const [textToRemove, setTextToRemove] = useState("");
  const [selectedImagesForRemoval, setSelectedImagesForRemoval] = useState<number[]>([]);
  const [chatMediaCounts, setChatMediaCounts] = useState<ChatMediaCounts | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [downloadMethod, setDownloadMethod] = useState<"native" | "direct">("native");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resettableCount = completedCount + failedCount;

  // Get all unique images across pending items for removal UI
  const allUniqueImages = React.useMemo(() => {
    const imageSet = new Set<string>();
    pendingItems.forEach((item) => {
      item.images?.forEach((img) => imageSet.add(img));
    });
    return Array.from(imageSet);
  }, [pendingItems]);

  // Count prompts containing the text to remove
  const textMatchCount = React.useMemo(() => {
    if (!textToRemove.trim()) return 0;
    return pendingItems.filter((item) =>
      item.finalPrompt.toLowerCase().includes(textToRemove.toLowerCase())
    ).length;
  }, [pendingItems, textToRemove]);

  // Get matching prompts for text removal with their position
  const matchingTextPrompts = React.useMemo(() => {
    if (!textToRemove.trim()) return [];
    return pendingItems
      .map((item, index) => ({ item, position: index + 1 }))
      .filter(({ item }) => item.finalPrompt.toLowerCase().includes(textToRemove.toLowerCase()));
  }, [pendingItems, textToRemove]);

  // Get prompts containing selected images for removal
  const matchingFilePrompts = React.useMemo(() => {
    if (selectedImagesForRemoval.length === 0) return [];
    const selectedImageSet = new Set(selectedImagesForRemoval.map((idx) => allUniqueImages[idx]));
    return pendingItems
      .map((item, index) => ({ item, position: index + 1 }))
      .filter(({ item }) => item.images?.some((img) => selectedImageSet.has(img)));
  }, [pendingItems, selectedImagesForRemoval, allUniqueImages]);

  React.useEffect(() => {
    const scanMedia = async () => {
      if (activeAction === "downloadChat" && onScanChatMedia) {
        setIsScanning(true);
        const counts = await onScanChatMedia();
        setChatMediaCounts(counts);
        setIsScanning(false);
      }
    };
    scanMedia();
  }, [activeAction, onScanChatMedia]);

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
      } else if (activeAction === "removeText" && textToRemove.trim()) {
        onBulkRemoveText(textToRemove.trim());
      } else if (activeAction === "removeFiles") {
        if (selectedImagesForRemoval.length > 0) {
          onBulkRemoveFiles(selectedImagesForRemoval);
        }
      } else if (activeAction === "downloadChat" && onDownloadChatMedia) {
        await onDownloadChatMedia(downloadMethod);
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
    setTextToRemove("");
    setSelectedImagesForRemoval([]);
    setChatMediaCounts(null);
    setDownloadMethod("native");
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
    {
      type: "removeText" as const,
      icon: Type,
      label: "Remove Text",
      description: "Remove specific text from all pending prompts",
      available: pendingCount > 0,
      count: pendingCount,
    },
    {
      type: "removeFiles" as const,
      icon: ImageMinus,
      label: "Remove Files",
      description:
        allUniqueImages.length > 0
          ? "Remove attached images from pending prompts"
          : "No images attached to remove",
      available: allUniqueImages.length > 0,
      count: allUniqueImages.length,
    },
    {
      type: "downloadChat" as const,
      icon: Download,
      label: "Download Chat Media",
      description: onDownloadChatMedia
        ? "Download all generated images/videos from the chat"
        : "Not available in this context",
      available: !!onDownloadChatMedia,
      count: chatMediaCounts?.total ?? 0,
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
            <div className="h-[300px] space-y-2 overflow-y-auto">
              {actionButtons.map((action) => (
                <button
                  key={action.type}
                  onClick={() => {
                    if (!action.available) return;
                    if (action.type === "copy") {
                      handleCopyAll();
                    } else if (action.type === "ai" && onOpenAIOptimization) {
                      handleClose();
                      onOpenAIOptimization();
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
                                : action.type === "removeText" || action.type === "removeFiles"
                                  ? "bg-rose-500/20 text-rose-500"
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
          ) : activeAction === "removeText" ? (
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
                  Text to Remove
                </label>
                <input
                  type="text"
                  value={textToRemove}
                  onChange={(e) => setTextToRemove(e.target.value)}
                  placeholder="Enter text to remove from all prompts..."
                  className={`w-full rounded-lg border p-3 text-sm outline-none transition-colors ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-rose-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-rose-500"
                  }`}
                />
              </div>

              {textToRemove.trim() && (
                <>
                  <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Found in {textMatchCount} of {pendingCount} pending prompt
                    {pendingCount !== 1 ? "s" : ""}
                  </p>
                  {matchingTextPrompts.length > 0 && (
                    <div className="max-h-[140px] space-y-1.5 overflow-y-auto">
                      {matchingTextPrompts.map(({ item, position }) => (
                        <div
                          key={item.id}
                          className={`flex items-start gap-2 rounded-lg border p-2 ${
                            isDark
                              ? "border-rose-500/30 bg-rose-500/10"
                              : "border-rose-200 bg-rose-50"
                          }`}
                        >
                          <span
                            className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              isDark ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-600"
                            }`}
                          >
                            #{position}
                          </span>
                          <p
                            className={`line-clamp-2 text-[11px] leading-tight ${
                              isDark ? "text-slate-300" : "text-slate-600"
                            }`}
                          >
                            {item.finalPrompt}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : activeAction === "removeFiles" ? (
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
                  Select Images to Remove
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {allUniqueImages.map((img, idx) => (
                    <label
                      key={idx}
                      className={`relative cursor-pointer rounded-lg border-2 p-0.5 transition-all ${
                        selectedImagesForRemoval.includes(idx)
                          ? "border-rose-500 bg-rose-500/10"
                          : isDark
                            ? "border-slate-700 hover:border-slate-600"
                            : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedImagesForRemoval.includes(idx)}
                        onChange={() => {
                          setSelectedImagesForRemoval((prev) =>
                            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                          );
                        }}
                      />
                      <img
                        src={img}
                        className="h-14 w-full rounded object-cover"
                        alt={`Attached image ${idx + 1}`}
                      />
                      {selectedImagesForRemoval.includes(idx) && (
                        <div className="absolute inset-0 flex items-center justify-center rounded bg-rose-500/30">
                          <X size={20} className="text-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedImagesForRemoval(allUniqueImages.map((_, i) => i))}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-all ${
                    isDark
                      ? "border-slate-700 text-slate-400 hover:border-rose-500 hover:text-rose-400"
                      : "border-slate-200 text-slate-500 hover:border-rose-500 hover:text-rose-500"
                  }`}
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedImagesForRemoval([])}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-all ${
                    isDark
                      ? "border-slate-700 text-slate-400 hover:border-slate-600"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  Clear
                </button>
              </div>

              <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {selectedImagesForRemoval.length} of {allUniqueImages.length} image
                {allUniqueImages.length !== 1 ? "s" : ""} selected for removal
              </p>

              {matchingFilePrompts.length > 0 && (
                <div>
                  <label
                    className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Affected Prompts ({matchingFilePrompts.length})
                  </label>
                  <div className="max-h-[100px] space-y-1.5 overflow-y-auto">
                    {matchingFilePrompts.map(({ item, position }) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-2 rounded-lg border p-2 ${
                          isDark
                            ? "border-rose-500/30 bg-rose-500/10"
                            : "border-rose-200 bg-rose-50"
                        }`}
                      >
                        <span
                          className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            isDark ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-600"
                          }`}
                        >
                          #{position}
                        </span>
                        <p
                          className={`line-clamp-2 text-[11px] leading-tight ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          {item.finalPrompt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeAction === "downloadChat" ? (
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
                  Media Found in Chat
                </label>
                {isScanning ? (
                  <div
                    className={`rounded-lg border p-4 text-center ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}
                  >
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Scanning chat for media...
                    </p>
                  </div>
                ) : chatMediaCounts ? (
                  <div
                    className={`grid grid-cols-3 gap-2 rounded-lg border p-3 ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}
                  >
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                      >
                        {chatMediaCounts.images}
                      </div>
                      <div
                        className={`text-[10px] uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Images
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold ${isDark ? "text-purple-400" : "text-purple-600"}`}
                      >
                        {chatMediaCounts.videos}
                      </div>
                      <div
                        className={`text-[10px] uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Videos
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}
                      >
                        {chatMediaCounts.files}
                      </div>
                      <div
                        className={`text-[10px] uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Files
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-lg border p-4 text-center ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}
                  >
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      No media found in chat
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label
                  className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Download Method
                </label>
                <div className="flex gap-2">
                  {(["native", "direct"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setDownloadMethod(method)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                        downloadMethod === method
                          ? "border-blue-500 bg-blue-500/20 text-blue-500"
                          : isDark
                            ? "border-slate-700 text-slate-400 hover:border-slate-600"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {method === "native" ? "Use Gemini Buttons" : "Direct Download"}
                    </button>
                  ))}
                </div>
                <p className={`mt-1.5 text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {downloadMethod === "native"
                    ? "Clicks Gemini's download buttons for full-quality images"
                    : "Fetches and downloads images directly"}
                </p>
              </div>
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
                (activeAction === "reset" && resetFilterType === "status" && !resetStatus) ||
                (activeAction === "removeText" && !textToRemove.trim()) ||
                (activeAction === "removeFiles" && selectedImagesForRemoval.length === 0) ||
                (activeAction === "downloadChat" &&
                  (!chatMediaCounts || chatMediaCounts.total === 0))
              }
              className={`w-full rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all disabled:opacity-50 ${
                activeAction === "ai"
                  ? "bg-violet-600 hover:bg-violet-500"
                  : activeAction === "attach"
                    ? "bg-indigo-600 hover:bg-indigo-500"
                    : activeAction === "reset"
                      ? "bg-amber-600 hover:bg-amber-500"
                      : activeAction === "removeText" || activeAction === "removeFiles"
                        ? "bg-rose-600 hover:bg-rose-500"
                        : activeAction === "downloadChat"
                          ? "bg-blue-600 hover:bg-blue-500"
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
                      : activeAction === "removeText"
                        ? `Remove Text from ${textMatchCount} Prompts`
                        : activeAction === "removeFiles"
                          ? `Remove ${selectedImagesForRemoval.length} Image${selectedImagesForRemoval.length !== 1 ? "s" : ""}`
                          : activeAction === "downloadChat"
                            ? `Download ${chatMediaCounts?.total ?? 0} Media`
                            : `Modify ${pendingCount} Prompts`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkActionsDialog;
