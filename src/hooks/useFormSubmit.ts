import { useCallback, type KeyboardEvent } from "react";

interface UseFormSubmitOptions {
  onSubmit: () => void;
  multiline?: boolean;
  disabled?: boolean;
}

export function useFormSubmit({
  onSubmit,
  multiline = false,
  disabled = false,
}: UseFormSubmitOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (disabled || e.nativeEvent.isComposing) return;

      if (multiline) {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          onSubmit();
        }
      } else {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onSubmit();
        }
      }
    },
    [onSubmit, multiline, disabled]
  );

  return { onKeyDown: handleKeyDown };
}
