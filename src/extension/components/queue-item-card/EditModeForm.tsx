import React, { useRef, useEffect } from "react";

interface EditModeFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isDark?: boolean;
}

export const EditModeForm: React.FC<EditModeFormProps> = ({
  value,
  onChange,
  onSubmit,
  onCancel,
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
      className="w-full resize-none rounded-md border border-primary/50 bg-background p-2.5 text-sm leading-relaxed text-foreground outline-none transition-colors focus:border-primary"
      rows={3}
    />
  );
};
