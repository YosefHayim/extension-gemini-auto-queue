import { Check } from "lucide-react";
import React from "react";

interface SelectionCheckboxProps {
  isSelected: boolean;
  isDark?: boolean;
  onToggle: () => void;
}

export const SelectionCheckbox: React.FC<SelectionCheckboxProps> = ({ isSelected, onToggle }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`flex h-4 w-4 items-center justify-center rounded border transition-all ${
        isSelected
          ? "border-primary bg-primary text-white"
          : "border-muted-foreground/50 hover:border-muted-foreground"
      }`}
    >
      {isSelected && <Check size={10} strokeWidth={3} />}
    </button>
  );
};
