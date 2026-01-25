import React from "react";

interface HighlightedTextProps {
  text: string;
  search: string;
  isDark: boolean;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  search,
  isDark: _isDark,
}) => {
  if (!search.trim()) return <>{text}</>;

  const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded bg-yellow-500/40 px-0.5 text-yellow-200 dark:bg-yellow-500/40 dark:text-yellow-200"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};
