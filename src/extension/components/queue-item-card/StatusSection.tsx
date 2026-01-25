import React from "react";

import { StatusBadge } from "@/extension/components/StatusBadge";

import type { QueueItem } from "@/backend/types";

interface StatusSectionProps {
  item: QueueItem;
  queueNumber: number;
}

export const StatusSection: React.FC<StatusSectionProps> = ({ item, queueNumber }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground">#{queueNumber}</span>
      <StatusBadge status={item.status} errorMessage={item.error} />
    </div>
  );
};
