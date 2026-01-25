import { useEffect, useMemo, useRef, useState } from "react";

import type {
  BulkActionType,
  ChatMediaCounts,
  ResetFilter,
  SelectedFile,
} from "@/extension/components/bulk-actions/types";
import type { GeminiMode, GeminiTool, QueueItem, QueueStatus } from "@/backend/types";

interface UseBulkActionsStateProps {
  pendingItems: QueueItem[];
  completedCount: number;
  failedCount: number;
  onScanChatMedia?: () => Promise<ChatMediaCounts | null>;
}

export function useBulkActionsState({
  pendingItems,
  completedCount,
  failedCount,
  onScanChatMedia,
}: UseBulkActionsStateProps) {
  const [activeAction, setActiveAction] = useState<BulkActionType>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
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
  const [selectedTool, setSelectedTool] = useState<GeminiTool | null>(null);
  const [selectedMode, setSelectedMode] = useState<GeminiMode | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resettableCount = completedCount + failedCount;

  const allUniqueImages = useMemo(() => {
    const imageSet = new Set<string>();
    pendingItems.forEach((item) => {
      item.images?.forEach((img) => imageSet.add(img));
    });
    return Array.from(imageSet);
  }, [pendingItems]);

  const textMatchCount = useMemo(() => {
    if (!textToRemove.trim()) return 0;
    return pendingItems.filter((item) =>
      item.finalPrompt.toLowerCase().includes(textToRemove.toLowerCase())
    ).length;
  }, [pendingItems, textToRemove]);

  useEffect(() => {
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

  const resetState = () => {
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
    setSelectedTool(null);
    setSelectedMode(null);
  };

  return {
    activeAction,
    setActiveAction,
    selectedFiles,
    setSelectedFiles,
    aiInstructions,
    setAiInstructions,
    modifyText,
    setModifyText,
    modifyPosition,
    setModifyPosition,
    isProcessing,
    setIsProcessing,
    resetFilterType,
    setResetFilterType,
    resetTextMatch,
    setResetTextMatch,
    resetTool,
    setResetTool,
    resetMode,
    setResetMode,
    resetStatus,
    setResetStatus,
    copySuccess,
    setCopySuccess,
    textToRemove,
    setTextToRemove,
    selectedImagesForRemoval,
    setSelectedImagesForRemoval,
    chatMediaCounts,
    isScanning,
    downloadMethod,
    setDownloadMethod,
    fileInputRef,
    resettableCount,
    allUniqueImages,
    textMatchCount,
    resetState,
    selectedTool,
    setSelectedTool,
    selectedMode,
    setSelectedMode,
  };
}
