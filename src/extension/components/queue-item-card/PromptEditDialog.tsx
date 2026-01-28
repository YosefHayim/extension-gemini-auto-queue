import { ChevronDown, Pencil, X } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";

import { GEMINI_MODE_INFO, GEMINI_TOOL_INFO, GeminiMode, GeminiTool } from "@/backend/types";

export interface PromptEditData {
  prompt: string;
  mode?: GeminiMode;
  tool?: GeminiTool;
}

interface PromptEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PromptEditData) => void;
  initialPrompt: string;
  initialMode?: GeminiMode;
  initialTool?: GeminiTool;
}

export const PromptEditDialog: React.FC<PromptEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPrompt,
  initialMode,
  initialTool,
}) => {
  const [editValue, setEditValue] = useState(initialPrompt);
  const [selectedMode, setSelectedMode] = useState<GeminiMode | undefined>(initialMode);
  const [selectedTool, setSelectedTool] = useState<GeminiTool | undefined>(initialTool);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showToolDropdown, setShowToolDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEditValue(initialPrompt);
      setSelectedMode(initialMode);
      setSelectedTool(initialTool);
      setShowModeDropdown(false);
      setShowToolDropdown(false);
      // Focus and select text after dialog opens
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.select();
        }
      }, 0);
    }
  }, [isOpen, initialPrompt, initialMode, initialTool]);

  const hasChanges = () => {
    return (
      editValue.trim() !== initialPrompt ||
      selectedMode !== initialMode ||
      selectedTool !== initialTool
    );
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && hasChanges()) {
      onSave({
        prompt: trimmed,
        mode: selectedMode,
        tool: selectedTool,
      });
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentModeInfo = selectedMode ? GEMINI_MODE_INFO[selectedMode] : null;
  const currentToolInfo = selectedTool ? GEMINI_TOOL_INFO[selectedTool] : null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
              <Pencil size={18} className="text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-card-foreground">Edit Prompt</span>
              <span className="text-xs text-muted-foreground">Modify prompt, mode, and tool</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded bg-secondary p-1.5 transition-colors hover:bg-secondary/80"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto p-4">
          {/* Prompt Text */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">Prompt</label>
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your prompt..."
              rows={4}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          {/* Mode Selector */}
          <div className="relative flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">Mode</label>
            <button
              type="button"
              onClick={() => {
                setShowModeDropdown(!showModeDropdown);
                setShowToolDropdown(false);
              }}
              className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:border-ring"
            >
              <span>{currentModeInfo?.label ?? "Select mode"}</span>
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
            {showModeDropdown && (
              <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
                {Object.entries(GEMINI_MODE_INFO).map(([mode, info]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setSelectedMode(mode as GeminiMode);
                      setShowModeDropdown(false);
                    }}
                    className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-muted ${
                      mode === selectedMode ? "bg-muted" : ""
                    }`}
                  >
                    <span className="font-medium">{info.label}</span>
                    <span className="text-xs text-muted-foreground">{info.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tool Selector */}
          <div className="relative flex flex-col gap-1.5">
            <label className="text-sm font-medium text-card-foreground">Tool</label>
            <button
              type="button"
              onClick={() => {
                setShowToolDropdown(!showToolDropdown);
                setShowModeDropdown(false);
              }}
              className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:border-ring"
            >
              <div className="flex items-center gap-2">
                {currentToolInfo &&
                  React.createElement(currentToolInfo.icon, {
                    size: 16,
                    className: "text-muted-foreground",
                  })}
                <span>{currentToolInfo?.label ?? "Select tool"}</span>
              </div>
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
            {showToolDropdown && (
              <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
                {Object.entries(GEMINI_TOOL_INFO).map(([tool, info]) => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => {
                      setSelectedTool(tool as GeminiTool);
                      setShowToolDropdown(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-muted ${
                      tool === selectedTool ? "bg-muted" : ""
                    }`}
                  >
                    {React.createElement(info.icon, {
                      size: 14,
                      className: "text-muted-foreground",
                    })}
                    <span>{info.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Press Enter to save, Shift+Enter for new line, Escape to cancel
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!editValue.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
