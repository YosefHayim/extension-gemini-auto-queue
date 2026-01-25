import { X } from "lucide-react";
import React from "react";

import { DESIGN } from "./bulkActionsDesign";

interface DialogHeaderProps {
  pendingCount: number;
  onClose: () => void;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ pendingCount, onClose }) => (
  <div
    className={`flex items-center justify-between ${DESIGN.spacing.headerPadding}`}
    style={{ borderBottom: `1px solid ${DESIGN.colors.border}` }}
  >
    <div className="flex flex-col gap-0.5">
      <h2 className={DESIGN.typography.dialogTitle} style={{ color: DESIGN.colors.foreground }}>
        Bulk Actions
      </h2>
      <p
        className={DESIGN.typography.dialogSubtitle}
        style={{ color: DESIGN.colors.mutedForeground }}
      >
        Apply to {pendingCount} selected items
      </p>
    </div>
    <button
      onClick={onClose}
      className={`${DESIGN.radius.sm} p-1.5 transition-colors hover:bg-black/5`}
      style={{ backgroundColor: DESIGN.colors.muted }}
    >
      <X size={DESIGN.sizes.closeIcon} style={{ color: DESIGN.colors.mutedForeground }} />
    </button>
  </div>
);
