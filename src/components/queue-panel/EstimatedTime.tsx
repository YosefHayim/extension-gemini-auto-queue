import { Clock } from "lucide-react";
import React from "react";

interface EstimatedTimeProps {
  estimatedTimeRemaining: string | null;
  pendingCount: number;
  isDark?: boolean;
}

export const EstimatedTime: React.FC<EstimatedTimeProps> = ({
  estimatedTimeRemaining,
  pendingCount,
}) => {
  if (!estimatedTimeRemaining || pendingCount === 0) return null;

  return (
    <div className="flex items-center justify-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
      <Clock size={14} />
      <span>Est. {estimatedTimeRemaining} remaining</span>
    </div>
  );
};
