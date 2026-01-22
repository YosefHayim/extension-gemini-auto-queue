import { Clock } from "lucide-react";
import React from "react";

interface EstimatedTimeProps {
  estimatedTimeRemaining: string | null;
  pendingCount: number;
  isDark: boolean;
}

export const EstimatedTime: React.FC<EstimatedTimeProps> = ({
  estimatedTimeRemaining,
  pendingCount,
  isDark,
}) => {
  if (!estimatedTimeRemaining || pendingCount === 0) return null;

  return (
    <div
      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
        isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
      }`}
    >
      <Clock size={14} />
      <span>Est. {estimatedTimeRemaining} remaining</span>
    </div>
  );
};
