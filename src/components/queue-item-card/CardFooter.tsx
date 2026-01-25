import { Bot, Image as ImageIcon } from "lucide-react";
import React from "react";

import { GEMINI_MODE_INFO, GEMINI_TOOL_INFO } from "@/types";

import type { QueueItem, GeminiTool } from "@/types";

interface CardFooterProps {
  item: QueueItem;
}

export const CardFooter: React.FC<CardFooterProps> = ({ item }) => {
  const toolInfo = item.tool
    ? GEMINI_TOOL_INFO[item.tool]
    : GEMINI_TOOL_INFO["image" as GeminiTool];
  const modeInfo = item.mode ? GEMINI_MODE_INFO[item.mode] : null;
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

      {modeInfo && (
        <span
          title={modeInfo.description}
          className="flex items-center gap-1 rounded-full bg-[#F3E8FF] px-2 py-1 text-[11px] font-medium text-[#9333EA]"
        >
          <Bot size={12} />
          <span>{modeInfo.label}</span>
        </span>
      )}
    </div>
  );
};
