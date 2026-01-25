import { Zap, X } from "lucide-react";
import React, { useState } from "react";

interface ChangeModelDialogProps {
  isOpen: boolean;
  isDark: boolean;
  currentModel?: string;
  availableModels?: string[];
  onClose: () => void;
  onSave: (model: string) => void;
}

export const ChangeModelDialog: React.FC<ChangeModelDialogProps> = ({
  isOpen,
  isDark: _isDark,
  currentModel,
  availableModels = ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
  onClose,
  onSave,
}) => {
  const [selectedModel, setSelectedModel] = useState(currentModel ?? availableModels[0]);

  const handleSave = () => {
    if (selectedModel.trim()) {
      onSave(selectedModel.trim());
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-4 shadow-2xl">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            <h2 className="text-sm font-black">Select Model</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3 p-2">
          <div className="rounded-md border border-border bg-muted p-2 text-[10px] leading-tight text-muted-foreground">
            <p>
              Choose a Gemini model for generation. Different models have varying capabilities and
              speed. Your selection will be applied to all new prompts.
            </p>
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-[10px] font-black uppercase text-muted-foreground">
              Gemini Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
              }}
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none"
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-md border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedModel.trim()}
              className="flex-1 rounded-md bg-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-amber-500 disabled:opacity-50"
            >
              Save Model
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeModelDialog;
