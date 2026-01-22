import React from "react";

interface BackButtonProps {
  isDark: boolean;
  onClick: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ isDark, onClick }) => (
  <button
    onClick={onClick}
    className={`text-xs font-medium ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}
  >
    &larr; Back
  </button>
);
