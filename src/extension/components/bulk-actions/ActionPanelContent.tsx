import React from "react";

import { GEMINI_MODE_INFO, GEMINI_TOOL_INFO, GeminiTool } from "@/backend/types";
import { DESIGN } from "@/extension/components/bulk-actions/bulkActionsDesign";

import type { GeminiMode } from "@/backend/types";
import type { BulkActionType, SelectedFile } from "@/extension/components/bulk-actions/types";

interface ActionPanelContentProps {
  activeAction: BulkActionType;
  fileInputRef: React.RefObject<HTMLInputElement>;
  selectedFiles: SelectedFile[];
  aiInstructions: string;
  modifyText: string;
  modifyPosition: "prepend" | "append";
  selectedTool: GeminiTool | null;
  selectedMode: GeminiMode | null;
  deletePatternText: string;
  deletePatternMatchCount: number;
  isProcessing: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileInputClick: () => void;
  setAiInstructions: (value: string) => void;
  setModifyText: (value: string) => void;
  setModifyPosition: (value: "prepend" | "append") => void;
  setSelectedTool: (value: GeminiTool) => void;
  setSelectedMode: (value: GeminiMode) => void;
  setDeletePatternText: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const AttachPanel: React.FC<{
  fileInputRef: React.RefObject<HTMLInputElement>;
  selectedFiles: SelectedFile[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileInputClick: () => void;
}> = ({ fileInputRef, selectedFiles, onFileUpload, onFileInputClick }) => (
  <div className="space-y-3">
    <input
      ref={fileInputRef}
      type="file"
      multiple
      accept="image/*"
      onChange={onFileUpload}
      className="hidden"
    />
    <button
      onClick={onFileInputClick}
      className="w-full rounded-md border-2 border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 hover:border-gray-400"
    >
      Click to select images
    </button>
    {selectedFiles.length > 0 && (
      <p className="text-sm text-gray-600">{selectedFiles.length} files selected</p>
    )}
  </div>
);

const AIOptimizePanel: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <div className="space-y-3">
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter optimization instructions..."
      className="w-full rounded-md border p-2 text-sm"
      rows={3}
    />
  </div>
);

const ModifyPanel: React.FC<{
  text: string;
  position: "prepend" | "append";
  onTextChange: (value: string) => void;
  onPositionChange: (value: "prepend" | "append") => void;
}> = ({ text, position, onTextChange, onPositionChange }) => (
  <div className="space-y-3">
    <input
      value={text}
      onChange={(e) => onTextChange(e.target.value)}
      placeholder="Text to add..."
      className="w-full rounded-md border p-2 text-sm"
    />
    <div className="flex gap-2">
      <button
        onClick={() => onPositionChange("prepend")}
        className={`flex-1 rounded-md border p-2 text-sm ${
          position === "prepend" ? "border-blue-500 bg-blue-50" : ""
        }`}
      >
        Prepend
      </button>
      <button
        onClick={() => onPositionChange("append")}
        className={`flex-1 rounded-md border p-2 text-sm ${
          position === "append" ? "border-blue-500 bg-blue-50" : ""
        }`}
      >
        Append
      </button>
    </div>
  </div>
);

const ChangeToolPanel: React.FC<{
  selectedTool: GeminiTool | null;
  onSelect: (tool: GeminiTool) => void;
}> = ({ selectedTool, onSelect }) => (
  <div className="space-y-3">
    <p className="text-sm font-medium text-foreground">Select Tool</p>
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(GEMINI_TOOL_INFO)
        .filter(([key]) => key !== (GeminiTool.NONE as string))
        .map(([tool, info]) => {
          const Icon = info.icon;
          const isSelected = (selectedTool as string) === tool;
          return (
            <button
              key={tool}
              onClick={() => onSelect(tool as GeminiTool)}
              className={`flex items-center gap-2 rounded-md border p-2 text-sm transition-colors ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              <Icon size={16} />
              {info.label}
            </button>
          );
        })}
    </div>
  </div>
);

const ChangeModePanel: React.FC<{
  selectedMode: GeminiMode | null;
  onSelect: (mode: GeminiMode) => void;
}> = ({ selectedMode, onSelect }) => (
  <div className="space-y-3">
    <p className="text-sm font-medium text-foreground">Select Mode</p>
    <div className="grid grid-cols-3 gap-2">
      {Object.entries(GEMINI_MODE_INFO).map(([mode, info]) => {
        const isSelected = (selectedMode as string) === mode;
        return (
          <button
            key={mode}
            onClick={() => onSelect(mode as GeminiMode)}
            className={`flex flex-col items-center gap-1 rounded-md border p-3 text-sm transition-colors ${
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            <span className="font-medium">{info.label}</span>
            <span className="text-xs text-muted-foreground">{info.description}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const DeleteByPatternPanel: React.FC<{
  value: string;
  matchCount: number;
  onChange: (value: string) => void;
}> = ({ value, matchCount, onChange }) => (
  <div className="space-y-3">
    <p className="text-sm font-medium text-foreground">Delete prompts containing pattern</p>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Paste text pattern to match (e.g., 'Status: processing | Type: image')..."
      className="w-full rounded-md border border-border bg-background p-2 text-sm text-foreground placeholder:text-muted-foreground"
      rows={3}
    />
    {value.trim() && (
      <p
        className={`text-sm ${matchCount > 0 ? "font-medium text-red-500" : "text-muted-foreground"}`}
      >
        {matchCount > 0
          ? `${matchCount} prompt${matchCount !== 1 ? "s" : ""} will be deleted`
          : "No prompts match this pattern"}
      </p>
    )}
  </div>
);

export const ActionPanelContent: React.FC<ActionPanelContentProps> = ({
  activeAction,
  fileInputRef,
  selectedFiles,
  aiInstructions,
  modifyText,
  modifyPosition,
  selectedTool,
  selectedMode,
  deletePatternText,
  deletePatternMatchCount,
  isProcessing,
  onFileUpload,
  onFileInputClick,
  setAiInstructions,
  setModifyText,
  setModifyPosition,
  setSelectedTool,
  setSelectedMode,
  setDeletePatternText,
  onSubmit,
  onCancel,
}) => {
  if (!activeAction) return null;

  return (
    <div
      className="border-t p-4"
      style={{ borderColor: DESIGN.colors.border, backgroundColor: DESIGN.colors.muted }}
    >
      {activeAction === "attach" && (
        <AttachPanel
          fileInputRef={fileInputRef}
          selectedFiles={selectedFiles}
          onFileUpload={onFileUpload}
          onFileInputClick={onFileInputClick}
        />
      )}
      {activeAction === "ai" && (
        <AIOptimizePanel value={aiInstructions} onChange={setAiInstructions} />
      )}
      {activeAction === "modify" && (
        <ModifyPanel
          text={modifyText}
          position={modifyPosition}
          onTextChange={setModifyText}
          onPositionChange={setModifyPosition}
        />
      )}
      {activeAction === "changeTool" && (
        <ChangeToolPanel selectedTool={selectedTool} onSelect={setSelectedTool} />
      )}
      {activeAction === "changeMode" && (
        <ChangeModePanel selectedMode={selectedMode} onSelect={setSelectedMode} />
      )}
      {activeAction === "deleteByPattern" && (
        <DeleteByPatternPanel
          value={deletePatternText}
          matchCount={deletePatternMatchCount}
          onChange={setDeletePatternText}
        />
      )}
      <button
        onClick={onSubmit}
        disabled={isProcessing}
        className="mt-3 w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : "Apply"}
      </button>
      <button
        onClick={onCancel}
        className="mt-2 w-full rounded-md border py-2 text-sm font-medium hover:bg-gray-50"
      >
        Cancel
      </button>
    </div>
  );
};
