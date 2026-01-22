import { Brain, Gem, Zap } from "lucide-react";

import { GeminiMode } from "@/types";

export const MODE_ICONS = {
  [GeminiMode.Quick]: Zap,
  [GeminiMode.Deep]: Brain,
  [GeminiMode.Pro]: Gem,
};

export const MODE_SELECTOR_STYLES: Record<GeminiMode, { selected: string; unselected: string }> = {
  [GeminiMode.Quick]: {
    selected: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
    unselected:
      "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 border dark:text-emerald-400 dark:border-emerald-500/40",
  },
  [GeminiMode.Deep]: {
    selected: "bg-blue-500 text-white shadow-lg shadow-blue-500/30",
    unselected:
      "border-blue-500/30 text-blue-500 hover:bg-blue-500/10 border dark:text-blue-400 dark:border-blue-500/40",
  },
  [GeminiMode.Pro]: {
    selected: "bg-purple-500 text-white shadow-lg shadow-purple-500/30",
    unselected:
      "border-purple-500/30 text-purple-500 hover:bg-purple-500/10 border dark:text-purple-400 dark:border-purple-500/40",
  },
};
