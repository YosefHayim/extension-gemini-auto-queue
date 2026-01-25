import React from "react";

import { ActionRow } from "./ActionRow";
import { DESIGN } from "./bulkActionsDesign";

import type { ActionSection } from "./actionTypes";

interface ActionSectionGroupProps {
  section: ActionSection;
  onActionClick: (actionId: string) => void;
}

export const ActionSectionGroup: React.FC<ActionSectionGroupProps> = ({
  section,
  onActionClick,
}) => (
  <div className={DESIGN.spacing.sectionGap} style={{ display: "flex", flexDirection: "column" }}>
    <span
      className={DESIGN.typography.sectionHeader}
      style={{ color: section.titleColor ?? DESIGN.colors.mutedForeground }}
    >
      {section.title}
    </span>
    <div className={DESIGN.spacing.actionGap} style={{ display: "flex", flexDirection: "column" }}>
      {section.actions.map((action) => (
        <ActionRow
          key={action.id}
          action={action}
          isDanger={section.isDanger}
          onClick={() => onActionClick(action.id as string)}
        />
      ))}
    </div>
  </div>
);
