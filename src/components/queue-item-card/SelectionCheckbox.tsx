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
      className={`mt-0.5 flex min-h-[28px] min-w-[28px] items-center justify-center rounded-md border-2 transition-all ${
        isSelected
          ? "border-primary bg-primary text-white"
          : "border-border hover:border-muted-foreground"
      }`}
    >
      {isSelected && <Check size={14} strokeWidth={3} />}
    </button>
  );
};
