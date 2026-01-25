import { Image as ImageIcon } from "lucide-react";
import React from "react";

import { MODE_ICONS } from "@/extension/components/queue-panel/constants";
import { GEMINI_MODE_INFO, GEMINI_TOOL_INFO, GeminiMode, GeminiTool } from "@/backend/types";

import type { QueueItem } from "@/backend/types";

const MODE_BADGE_STYLES: Record<GeminiMode, string> = {
  [GeminiMode.Default]: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  [GeminiMode.Quick]:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  [GeminiMode.Deep]: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  [GeminiMode.Pro]: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
};

interface CardFooterProps {
  item: QueueItem;
}

export const CardFooter: React.FC<CardFooterProps> = ({ item }) => {
  const toolInfo = item.tool ? GEMINI_TOOL_INFO[item.tool] : GEMINI_TOOL_INFO[GeminiTool.IMAGE];
  const mode = item.mode ?? GeminiMode.Default;
  const modeInfo = GEMINI_MODE_INFO[mode];
  const ModeIcon = MODE_ICONS[mode];
  const imageCount = item.images?.length ?? 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span
          title={toolInfo.description}
          className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
        >
          {React.createElement(toolInfo.icon, { size: 12 })}
          <span>{toolInfo.label}</span>
        </span>

        {imageCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ImageIcon size={12} />
            <span>
              {imageCount} {imageCount === 1 ? "image" : "images"}
            </span>
          </span>
        )}
      </div>

      <span
        title={modeInfo.description}
        className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${MODE_BADGE_STYLES[mode]}`}
      >
        <ModeIcon size={12} />
        <span>{modeInfo.label}</span>
      </span>
    </div>
  );
};
