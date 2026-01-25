import React from "react";

interface BackButtonProps {
  isDark: boolean;
  onClick: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ isDark: _isDark, onClick }) => (
  <button
    onClick={onClick}
    className="text-xs font-medium text-muted-foreground hover:text-foreground"
  >
    &larr; Back
  </button>
);
