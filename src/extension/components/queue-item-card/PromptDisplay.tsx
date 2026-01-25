import React, { useRef, useState, useEffect } from "react";

import { HighlightedText } from "@/extension/components/queue-item-card/HighlightedText";

interface PromptDisplayProps {
  prompt: string;
  searchText: string;
  isDark: boolean;
  isPending: boolean;
  onEdit?: (id: string, newPrompt: string) => void;
  itemId: string;
}

export const PromptDisplay: React.FC<PromptDisplayProps> = ({
  prompt,
  searchText,
  isDark,
  isPending,
  onEdit,
  itemId,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const isOverflowing = textRef.current.scrollHeight > textRef.current.clientHeight;
      setIsTruncated(isOverflowing);
    }
  }, [prompt]);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (isTruncated && textRef.current) {
          const rect = textRef.current.getBoundingClientRect();
          setTooltipPos({ top: rect.top - 8, left: rect.left });
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <p
        ref={textRef}
        onClick={() => {
          if (isPending && onEdit) {
            onEdit(itemId, prompt);
          }
        }}
        className={`line-clamp-2 text-[13px] font-normal leading-[1.4] text-foreground ${isPending && onEdit ? "-mx-1 cursor-text rounded px-1 transition-colors hover:bg-muted" : ""}`}
      >
        <HighlightedText text={prompt} search={searchText} isDark={isDark} />
      </p>

      {isHovered && isTruncated && (
        <div
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: "translateY(-100%)",
          }}
          className="pointer-events-none fixed z-[2147483647] max-h-48 w-72 overflow-auto rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground shadow-lg"
        >
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            <HighlightedText text={prompt} search={searchText} isDark={isDark} />
          </p>
        </div>
      )}
    </div>
  );
};
