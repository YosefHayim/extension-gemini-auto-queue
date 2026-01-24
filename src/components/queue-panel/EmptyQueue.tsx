import { Inbox } from "lucide-react";
import React from "react";

interface EmptyQueueProps {
  isDark: boolean;
}

export const EmptyQueue: React.FC<EmptyQueueProps> = ({ isDark }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 ${isDark ? "border-slate-700" : "border-slate-200"}`}
    >
      <Inbox size={48} className={isDark ? "text-slate-600" : "text-slate-400"} />
      <div className="flex flex-col items-center gap-1">
        <span className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Your queue is empty
        </span>
        <span className={`text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          Add prompts above to get started
        </span>
      </div>
    </div>
  );
};
