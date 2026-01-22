import { Check } from "lucide-react";
import React from "react";

interface SelectionCheckboxProps {
  isSelected: boolean;
  isDark: boolean;
  onToggle: () => void;
}

export const SelectionCheckbox: React.FC<SelectionCheckboxProps> = ({
  isSelected,
  isDark,
  onToggle,
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`mt-0.5 flex min-h-[28px] min-w-[28px] items-center justify-center rounded-md border-2 transition-all ${
        isSelected
          ? "border-indigo-500 bg-indigo-500 text-white"
          : isDark
            ? "border-slate-600 hover:border-slate-500"
            : "border-slate-300 hover:border-slate-400"
      }`}
    >
      {isSelected && <Check size={14} strokeWidth={3} />}
    </button>
  );
};
