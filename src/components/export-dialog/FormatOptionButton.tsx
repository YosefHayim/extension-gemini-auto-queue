import React from "react";

import type { FormatOption } from "./types";

interface FormatOptionButtonProps {
  option: FormatOption;
  isSelected: boolean;
  isDark: boolean;
  onSelect: () => void;
}

export const FormatOptionButton: React.FC<FormatOptionButtonProps> = ({
  option,
  isSelected,
  isDark,
  onSelect,
}) => {
  const Icon = option.icon;

  return (
    <button
      onClick={onSelect}
      title={`Export as ${option.name}`}
      className={`group relative w-full rounded-lg border p-4 text-left transition-all duration-200 ${
        isSelected
          ? isDark
            ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10"
            : "border-blue-500/50 bg-blue-50 shadow-lg shadow-blue-500/10"
          : isDark
            ? "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
            : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div
        className={`absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 transition-all ${
          isSelected
            ? "border-blue-500 bg-blue-500"
            : isDark
              ? "border-white/20 bg-transparent"
              : "border-slate-300 bg-transparent"
        }`}
      >
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 pr-8">
        <div
          className={`rounded-lg p-2 transition-colors ${
            isSelected
              ? "bg-blue-500 text-white"
              : isDark
                ? "bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white/80"
                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-600"
          }`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold ${
                isSelected
                  ? isDark
                    ? "text-white"
                    : "text-slate-900"
                  : isDark
                    ? "text-white/80"
                    : "text-slate-700"
              }`}
            >
              {option.name}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                isSelected
                  ? "bg-blue-500/20 text-blue-400"
                  : isDark
                    ? "bg-white/5 text-white/40"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {option.extension}
            </span>
          </div>
          <p
            className={`mt-0.5 text-xs ${
              isSelected
                ? isDark
                  ? "text-white/60"
                  : "text-slate-600"
                : isDark
                  ? "text-white/40"
                  : "text-slate-400"
            }`}
          >
            {option.description}
          </p>
        </div>
      </div>
    </button>
  );
};
