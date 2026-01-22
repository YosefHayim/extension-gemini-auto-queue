import React, { useRef, useEffect } from "react";

interface EditModeFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isDark: boolean;
}

export const EditModeForm: React.FC<EditModeFormProps> = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  isDark,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <textarea
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onSubmit}
      onKeyDown={handleKeyDown}
      className={`w-full resize-none rounded-md border p-2.5 text-sm leading-relaxed outline-none transition-colors ${
        isDark
          ? "border-indigo-500/50 bg-slate-900 text-slate-200 focus:border-indigo-400"
          : "border-indigo-300 bg-white text-slate-700 focus:border-indigo-500"
      }`}
      rows={3}
    />
  );
};
