import React from "react";

interface HighlightedTextProps {
  text: string;
  search: string;
  isDark: boolean;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, search, isDark }) => {
  if (!search.trim()) return <>{text}</>;

  const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className={`rounded px-0.5 ${isDark ? "bg-yellow-500/40 text-yellow-200" : "bg-yellow-300 text-yellow-900"}`}
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
