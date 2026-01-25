import React from "react";

import { ActionButtonList } from "@/extension/components/bulk-actions/ActionButtonList";
import {
  AIOptimizePanel,
  AttachPanel,
  DownloadChatPanel,
  ModifyPanel,
  RemoveFilesPanel,
  RemoveTextPanel,
  ResetPanel,
} from "@/extension/components/bulk-actions/panels";

import type { GeminiMode, GeminiTool, QueueItem, QueueStatus } from "@/backend/types";
import type {
  BulkActionType,
  ChatMediaCounts,
  ResetFilter,
  SelectedFile,
} from "@/extension/components/bulk-actions/types";

interface PanelRendererProps {
  activeAction: BulkActionType;
  isDark: boolean;
  hasApiKey: boolean;
  pendingCount: number;
  totalCount: number;
  pendingItems: QueueItem[];
  resettableCount: number;
  allUniqueImages: string[];
  chatMediaCounts: ChatMediaCounts | null;
  copySuccess: boolean;
  onDownloadChatMediaAvailable: boolean;
  selectedFiles: SelectedFile[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<SelectedFile[]>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  aiInstructions: string;
  setAiInstructions: (value: string) => void;
  modifyText: string;
  setModifyText: (value: string) => void;
  modifyPosition: "prepend" | "append";
  setModifyPosition: (value: "prepend" | "append") => void;
  resetFilterType: ResetFilter["type"];
  setResetFilterType: (value: ResetFilter["type"]) => void;
  resetTextMatch: string;
  setResetTextMatch: (value: string) => void;
  resetTool: GeminiTool | null;
  setResetTool: (value: GeminiTool | null) => void;
  resetMode: GeminiMode | null;
  setResetMode: (value: GeminiMode | null) => void;
  resetStatus: QueueStatus | null;
  setResetStatus: (value: QueueStatus | null) => void;
  textToRemove: string;
  setTextToRemove: (value: string) => void;
  selectedImagesForRemoval: number[];
  setSelectedImagesForRemoval: React.Dispatch<React.SetStateAction<number[]>>;
  isScanning: boolean;
  downloadMethod: "native" | "direct";
  setDownloadMethod: (value: "native" | "direct") => void;
  onBack: () => void;
  onActionSelect: (type: Exclude<BulkActionType, null>) => void;
  onCopyAll: () => void;
}

export const PanelRenderer: React.FC<PanelRendererProps> = ({
  activeAction,
  isDark,
  hasApiKey,
  pendingCount,
  totalCount,
  pendingItems,
  resettableCount,
  allUniqueImages,
  chatMediaCounts,
  copySuccess,
  onDownloadChatMediaAvailable,
  selectedFiles,
  setSelectedFiles,
  fileInputRef,
  onFileUpload,
  aiInstructions,
  setAiInstructions,
  modifyText,
  setModifyText,
  modifyPosition,
  setModifyPosition,
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
  textToRemove,
  setTextToRemove,
  selectedImagesForRemoval,
  setSelectedImagesForRemoval,
  isScanning,
  downloadMethod,
  setDownloadMethod,
  onBack,
  onActionSelect,
  onCopyAll,
}) => {
  switch (activeAction) {
    case "attach":
      return (
        <AttachPanel
          isDark={isDark}
          onBack={onBack}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          fileInputRef={fileInputRef}
          onFileUpload={onFileUpload}
        />
      );
    case "ai":
      return (
        <AIOptimizePanel
          isDark={isDark}
          onBack={onBack}
          aiInstructions={aiInstructions}
          setAiInstructions={setAiInstructions}
        />
      );
    case "modify":
      return (
        <ModifyPanel
          isDark={isDark}
          onBack={onBack}
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
          onBack={onBack}
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
          onBack={onBack}
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
          onBack={onBack}
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
          onBack={onBack}
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
          onDownloadChatMedia={onDownloadChatMediaAvailable}
          onActionSelect={onActionSelect}
          onCopyAll={onCopyAll}
        />
      );
  }
};
