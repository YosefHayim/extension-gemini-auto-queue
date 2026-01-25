import { ChevronRight } from "lucide-react";
import React from "react";

import { ActionIconContainer } from "@/extension/components/bulk-actions/ActionIconContainer";
import { DESIGN } from "@/extension/components/bulk-actions/bulkActionsDesign";

import type { ActionItem } from "@/extension/components/bulk-actions/actionTypes";

interface ActionRowProps {
  action: ActionItem;
  isDanger?: boolean;
  onClick: () => void;
}

export const ActionRow: React.FC<ActionRowProps> = ({ action, isDanger = false, onClick }) => (
  <button
    onClick={onClick}
    className={`group flex w-full items-center ${DESIGN.spacing.actionPadding} ${DESIGN.spacing.iconTextGap} ${DESIGN.radius.sm} transition-colors hover:bg-black/5`}
    style={isDanger ? { backgroundColor: DESIGN.colors.dangerBg } : undefined}
  >
    <ActionIconContainer
      icon={action.icon}
      bg={action.iconBg}
      color={action.iconColor}
      isDanger={isDanger}
    />
    <span
      className={DESIGN.typography.actionLabel}
      style={{ color: isDanger ? DESIGN.colors.dangerRed : DESIGN.colors.foreground }}
    >
      {action.label}
    </span>
    {action.badge && (
      <span
        className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold"
        style={{ backgroundColor: action.badge.bg, color: action.badge.color }}
      >
        {action.badge.text}
      </span>
    )}
    {action.hasChevron && !action.badge && (
      <ChevronRight
        size={DESIGN.sizes.chevron}
        className="ml-auto"
        style={{ color: DESIGN.colors.mutedForeground }}
      />
    )}
  </button>
);
