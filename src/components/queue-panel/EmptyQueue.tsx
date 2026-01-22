import { Cpu } from "lucide-react";
import React from "react";

interface EmptyQueueProps {
  isDark: boolean;
}

export const EmptyQueue: React.FC<EmptyQueueProps> = ({ isDark }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 ${isDark ? "border-slate-700" : "border-slate-200"}`}
    >
      <Cpu size={28} className={isDark ? "text-slate-700" : "text-slate-300"} />
      <span
        className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? "text-slate-600" : "text-slate-400"}`}
      >
        Queue Empty
      </span>
    </div>
  );
};
