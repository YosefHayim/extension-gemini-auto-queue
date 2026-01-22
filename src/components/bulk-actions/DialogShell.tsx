import { X } from "lucide-react";
import React from "react";

interface DialogShellProps {
  isOpen: boolean;
  isDark: boolean;
  pendingCount: number;
  onClose: () => void;
  children: React.ReactNode;
}

export const DialogShell: React.FC<DialogShellProps> = ({
  isOpen,
  isDark,
  pendingCount,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

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
          <div>
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Bulk Actions
            </h3>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Apply to {pendingCount} pending prompt{pendingCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`rounded-lg p-2 transition-colors ${
              isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
