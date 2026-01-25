import React from "react";

interface DialogShellProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const DialogShell: React.FC<DialogShellProps> = ({
  isOpen,
  isDark: _isDark,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-4 w-full max-w-sm overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        {children}
      </div>
    </div>
  );
};
