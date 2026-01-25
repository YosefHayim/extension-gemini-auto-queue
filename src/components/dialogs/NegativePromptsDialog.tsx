import { X } from "lucide-react";
import React, { useState } from "react";

interface NegativePromptsDialogProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onApply: (negativePrompts: string) => void;
}

export const NegativePromptsDialog: React.FC<NegativePromptsDialogProps> = ({
  isOpen,
  isDark,
  onClose,
  onApply,
}) => {
  const [negativePrompts, setNegativePrompts] = useState("");

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(negativePrompts);
    setNegativePrompts("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`mx-4 w-full max-w-sm rounded-lg border shadow-2xl ${
          isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b p-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}
        >
          <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Add Negative Prompts
          </h3>
          <button
            onClick={onClose}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <label
              className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Negative Prompts
            </label>
            <textarea
              value={negativePrompts}
              onChange={(e) => setNegativePrompts(e.target.value)}
              placeholder="Describe what you don't want in the generated content (e.g., 'blurry, low quality, distorted')"
              className={`mt-1 w-full rounded-md border p-2.5 text-sm ${
                isDark
                  ? "border-slate-600 bg-slate-800 text-white placeholder-slate-500"
                  : "border-slate-300 bg-white text-slate-900 placeholder-slate-400"
              }`}
              rows={4}
            />
          </div>
        </div>

        <div
          className={`flex justify-end gap-2 border-t p-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}
        >
          <button
            onClick={onClose}
            className={`rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
              isDark
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
