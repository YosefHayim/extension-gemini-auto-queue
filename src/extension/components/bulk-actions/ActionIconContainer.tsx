import React from "react";

import { DESIGN } from "./bulkActionsDesign";

interface ActionIconContainerProps {
  icon: React.ElementType;
  bg?: string;
  color?: string;
  isDanger?: boolean;
}

export const ActionIconContainer: React.FC<ActionIconContainerProps> = ({
  icon: Icon,
  bg,
  color,
  isDanger,
}) => (
  <div
    className={`${DESIGN.sizes.iconContainer} ${DESIGN.radius.sm} flex flex-shrink-0 items-center justify-center`}
    style={{
      backgroundColor: isDanger ? DESIGN.colors.dangerIconBg : (bg ?? DESIGN.colors.muted),
    }}
  >
    <Icon
      size={DESIGN.sizes.icon}
      style={{
        color: isDanger ? DESIGN.colors.dangerRed : (color ?? DESIGN.colors.mutedForeground),
      }}
    />
  </div>
);
