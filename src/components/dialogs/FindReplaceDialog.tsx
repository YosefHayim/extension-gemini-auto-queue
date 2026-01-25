import { X } from "lucide-react";
import React, { useState } from "react";

interface FindReplaceDialogProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onApply: (find: string, replace: string) => void;
}

export const FindReplaceDialog: React.FC<FindReplaceDialogProps> = ({
  isOpen,
  isDark,
  onClose,
  onApply,
}) => {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(find, replace);
    setFind("");
    setReplace("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`mx-4 w-full max-w-sm rounded-xl border shadow-2xl ${
          isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b p-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}
        >
          <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Find and Replace
          </h3>
          <button
            onClick={onClose}
            className={`rounded-lg p-2 transition-colors ${
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
              Find text
            </label>
            <input
              type="text"
              value={find}
              onChange={(e) => setFind(e.target.value)}
              placeholder="Text to find in prompts"
              className={`mt-1 w-full rounded-md border p-2.5 text-sm ${
                isDark
                  ? "border-slate-600 bg-slate-800 text-white placeholder-slate-500"
                  : "border-slate-300 bg-white text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Replace with text
            </label>
            <input
              type="text"
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              placeholder="Text to replace with"
              className={`mt-1 w-full rounded-md border p-2.5 text-sm ${
                isDark
                  ? "border-slate-600 bg-slate-800 text-white placeholder-slate-500"
                  : "border-slate-300 bg-white text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>
        </div>

        <div
          className={`flex justify-end gap-2 border-t p-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}
        >
          <button
            onClick={onClose}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isDark
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
