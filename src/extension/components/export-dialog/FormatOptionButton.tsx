import React from "react";

import type { FormatOption } from "@/extension/components/export-dialog/types";

interface FormatOptionButtonProps {
  option: FormatOption;
  isSelected: boolean;
  isDark: boolean;
  onSelect: () => void;
}

export const FormatOptionButton: React.FC<FormatOptionButtonProps> = ({
  option,
  isSelected,
  isDark: _isDark,
  onSelect,
}) => {
  const Icon = option.icon;

  return (
    <button
      onClick={onSelect}
      title={`Export as ${option.name}`}
      className={`group relative w-full rounded-lg border p-4 text-left transition-all duration-200 ${
        isSelected
          ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/10"
          : "border-border bg-card hover:border-border/80 hover:bg-muted"
      }`}
    >
      <div
        className={`absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 transition-all ${
          isSelected ? "border-primary bg-primary" : "border-muted-foreground/30 bg-transparent"
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
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
          }`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold ${isSelected ? "text-card-foreground" : "text-card-foreground/80"}`}
            >
              {option.name}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {option.extension}
            </span>
          </div>
          <p
            className={`mt-0.5 text-xs ${isSelected ? "text-muted-foreground" : "text-muted-foreground/70"}`}
          >
            {option.description}
          </p>
        </div>
      </div>
    </button>
  );
};
