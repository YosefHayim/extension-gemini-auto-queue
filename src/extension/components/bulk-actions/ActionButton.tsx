import { Check } from "lucide-react";
import React from "react";

import type { ActionButtonConfig } from "./actionButtonConfigs";

interface ActionButtonProps {
  action: ActionButtonConfig;
  copySuccess: boolean;
  onSelect: () => void;
}

const getIconColorClass = (type: string, isCopySuccess: boolean): string => {
  if (type === "copy" && isCopySuccess) {
    return "bg-zinc-500/20 text-zinc-600 dark:text-zinc-300";
  }

  const colorMap: Record<string, string> = {
    ai: "bg-violet-500/20 text-violet-500",
    attach: "bg-indigo-500/20 text-indigo-500",
    reset: "bg-amber-500/20 text-amber-500",
    copy: "bg-cyan-500/20 text-cyan-500",
    removeText: "bg-rose-500/20 text-rose-500",
    removeFiles: "bg-rose-500/20 text-rose-500",
    downloadChat: "bg-emerald-500/20 text-emerald-500",
  };

  return colorMap[type] ?? "bg-zinc-500/20 text-zinc-600 dark:text-zinc-300";
};

const getButtonClassName = (
  isAvailable: boolean,
  isCopyAction: boolean,
  isCopySuccess: boolean
): string => {
  const baseClass = "flex w-full items-center gap-3 rounded-md border p-3 text-left transition-all";

  if (isCopyAction && isCopySuccess) {
    return `${baseClass} border-zinc-400 bg-zinc-200/50 dark:border-zinc-600 dark:bg-zinc-700/50`;
  }

  if (isAvailable) {
    return `${baseClass} border-border bg-muted hover:border-muted-foreground/30 hover:bg-muted/80`;
  }

  return `${baseClass} cursor-not-allowed opacity-50`;
};

export const ActionButton: React.FC<ActionButtonProps> = ({ action, copySuccess, onSelect }) => {
  const isCopyAction = action.type === "copy";
  const showCopySuccess = isCopyAction && copySuccess;

  const handleClick = () => {
    if (!action.available) return;
    onSelect();
  };

  return (
    <button
      onClick={handleClick}
      disabled={!action.available || showCopySuccess}
      className={getButtonClassName(action.available, isCopyAction, copySuccess)}
    >
      <div className={`rounded-md p-2 ${getIconColorClass(action.type, copySuccess)}`}>
        {showCopySuccess ? <Check size={18} /> : <action.icon size={18} />}
      </div>
      <div className="flex-1">
        <div
          className={`text-sm font-semibold ${
            showCopySuccess ? "text-zinc-700 dark:text-zinc-200" : "text-foreground"
          }`}
        >
          {showCopySuccess ? "Copied!" : action.label}
        </div>
        <div className="text-xs text-muted-foreground">
          {showCopySuccess ? "Prompts copied to clipboard" : action.description}
        </div>
      </div>
    </button>
  );
};
