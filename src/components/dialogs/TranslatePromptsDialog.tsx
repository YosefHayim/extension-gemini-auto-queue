import { X } from "lucide-react";
import React, { useState } from "react";

interface TranslatePromptsDialogProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onApply: (language: string) => void;
  languages?: string[];
}

export const TranslatePromptsDialog: React.FC<TranslatePromptsDialogProps> = ({
  isOpen,
  isDark: _isDark,
  onClose,
  onApply,
  languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Dutch",
    "Russian",
    "Japanese",
    "Chinese (Simplified)",
    "Chinese (Traditional)",
    "Korean",
    "Arabic",
    "Hindi",
    "Turkish",
  ],
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(languages[0] || "");

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(selectedLanguage);
    setSelectedLanguage(languages[0] || "");
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="mx-4 w-full max-w-sm rounded-lg border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-sm font-bold text-card-foreground">Translate Prompts</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">
              Target Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background p-2.5 text-sm text-foreground"
            >
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-4">
          <button
            onClick={onClose}
            className="rounded-md bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Translate
          </button>
        </div>
      </div>
    </div>
  );
};
