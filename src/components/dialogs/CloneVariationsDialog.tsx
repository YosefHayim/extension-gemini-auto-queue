import { X } from "lucide-react";
import React, { useState } from "react";

interface CloneVariationsDialogProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onApply: (count: number) => void;
}

export const CloneVariationsDialog: React.FC<CloneVariationsDialogProps> = ({
  isOpen,
  isDark,
  onClose,
  onApply,
}) => {
  const [count, setCount] = useState(1);

  if (!isOpen) return null;

  const handleApply = () => {
    if (count > 0) {
      onApply(count);
      setCount(1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setCount(value);
    }
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
            Clone Variations
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
              Number of Variations
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={handleInputChange}
              placeholder="Enter number of variations"
              className={`mt-1 w-full rounded-md border p-2.5 text-sm ${
                isDark
                  ? "border-slate-600 bg-slate-800 text-white placeholder-slate-500"
                  : "border-slate-300 bg-white text-slate-900 placeholder-slate-400"
              }`}
            />
            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Create {count} {count === 1 ? "variation" : "variations"} of the selected{" "}
              {count === 1 ? "item" : "items"}
            </p>
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
            disabled={count <= 0}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
              count > 0 ? "bg-emerald-600 hover:bg-emerald-700" : "cursor-not-allowed bg-slate-400"
            }`}
          >
            Clone
          </button>
        </div>
      </div>
    </div>
  );
};
