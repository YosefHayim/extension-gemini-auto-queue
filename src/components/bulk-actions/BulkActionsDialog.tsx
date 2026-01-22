import { GeminiMode, GeminiTool, QueueStatus } from "@/types";
import React, { useRef, useState, useMemo, useEffect } from "react";
import { ActionButtonList } from "./ActionButtonList";
import { DialogShell } from "./DialogShell";
import { SubmitButton } from "./SubmitButton";
import {
  AttachPanel,
  AIOptimizePanel,
  ModifyPanel,
  ResetPanel,
  RemoveTextPanel,
  RemoveFilesPanel,
  DownloadChatPanel,
} from "./panels";
import type {
  BulkActionType,
  BulkActionsDialogProps,
  ChatMediaCounts,
  ResetFilter,
  SelectedFile,
} from "./types";

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    e.target.value = "";

    const readPromises = files.map((file) => {
      return new Promise<SelectedFile | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target?.result;
          if (typeof data === "string" && data.length > 0) {
            resolve({ data, name: file.name, type: file.type });
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
    const validFiles = newFiles.filter((f): f is SelectedFile => f !== null);

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
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

  const handleActionSelect = (type: Exclude<BulkActionType, null>) => {
    if (type === "ai" && onOpenAIOptimization) {
      handleClose();
      onOpenAIOptimization();
    } else {
      setActiveAction(type);
    }
  };

  const handleBack = () => setActiveAction(null);

  const renderActivePanel = () => {
    switch (activeAction) {
      case "attach":
        return (
          <AttachPanel
            isDark={isDark}
            onBack={handleBack}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            fileInputRef={fileInputRef}
            onFileUpload={handleFileUpload}
          />
        );
      case "ai":
        return (
          <AIOptimizePanel
            isDark={isDark}
            onBack={handleBack}
            aiInstructions={aiInstructions}
            setAiInstructions={setAiInstructions}
          />
        );
      case "modify":
        return (
          <ModifyPanel
            isDark={isDark}
            onBack={handleBack}
            modifyText={modifyText}
            setModifyText={setModifyText}
            modifyPosition={modifyPosition}
            setModifyPosition={setModifyPosition}
          />
        );
      case "reset":
        return (
          <ResetPanel
            isDark={isDark}
            onBack={handleBack}
            resetFilterType={resetFilterType}
            setResetFilterType={setResetFilterType}
            resetTextMatch={resetTextMatch}
            setResetTextMatch={setResetTextMatch}
            resetTool={resetTool}
            setResetTool={setResetTool}
            resetMode={resetMode}
            setResetMode={setResetMode}
            resetStatus={resetStatus}
            setResetStatus={setResetStatus}
            resettableCount={resettableCount}
          />
        );
      case "removeText":
        return (
          <RemoveTextPanel
            isDark={isDark}
            onBack={handleBack}
            textToRemove={textToRemove}
            setTextToRemove={setTextToRemove}
            pendingCount={pendingCount}
            pendingItems={pendingItems}
          />
        );
      case "removeFiles":
        return (
          <RemoveFilesPanel
            isDark={isDark}
            onBack={handleBack}
            allUniqueImages={allUniqueImages}
            selectedImagesForRemoval={selectedImagesForRemoval}
            setSelectedImagesForRemoval={setSelectedImagesForRemoval}
            pendingItems={pendingItems}
          />
        );
      case "downloadChat":
        return (
          <DownloadChatPanel
            isDark={isDark}
            onBack={handleBack}
            isScanning={isScanning}
            chatMediaCounts={chatMediaCounts}
            downloadMethod={downloadMethod}
            setDownloadMethod={setDownloadMethod}
          />
        );
      default:
        return (
          <ActionButtonList
            isDark={isDark}
            hasApiKey={hasApiKey}
            pendingCount={pendingCount}
            totalCount={totalCount}
            resettableCount={resettableCount}
            allUniqueImagesCount={allUniqueImages.length}
            chatMediaCounts={chatMediaCounts}
            copySuccess={copySuccess}
            onDownloadChatMedia={!!onDownloadChatMedia}
            onActionSelect={handleActionSelect}
            onCopyAll={handleCopyAll}
          />
        );
    }
  };

  return (
    <DialogShell isOpen={isOpen} isDark={isDark} pendingCount={pendingCount} onClose={handleClose}>
      <div className="p-4">{renderActivePanel()}</div>
      {activeAction && (
        <SubmitButton
          isDark={isDark}
          activeAction={activeAction}
          isProcessing={isProcessing}
          selectedFiles={selectedFiles}
          aiInstructions={aiInstructions}
          modifyText={modifyText}
          resetFilterType={resetFilterType}
          resetTextMatch={resetTextMatch}
          resetTool={resetTool}
          resetMode={resetMode}
          resetStatus={resetStatus}
          textToRemove={textToRemove}
          selectedImagesForRemoval={selectedImagesForRemoval}
          chatMediaCounts={chatMediaCounts}
          pendingCount={pendingCount}
          resettableCount={resettableCount}
          textMatchCount={textMatchCount}
          onSubmit={handleSubmit}
        />
      )}
    </DialogShell>
  );
};
