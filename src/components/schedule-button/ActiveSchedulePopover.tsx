import { X } from "lucide-react";
import React from "react";

import type { ScheduleConfig } from "@/types";

interface ActiveSchedulePopoverProps {
  schedule: ScheduleConfig;
  isDark: boolean;
  onCancel: () => void;
}

export const ActiveSchedulePopover: React.FC<ActiveSchedulePopoverProps> = ({
  schedule,
  isDark,
  onCancel,
}) => {
  const scheduledDate = new Date(schedule.scheduledTime!);

  return (
    <div
      className={`absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border p-3 shadow-xl ${
        isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-3">
        <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Scheduled for</p>
        <p className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
          {scheduledDate.toLocaleString()}
        </p>
        {schedule.repeatDaily && (
          <p className={`text-xs ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
            Repeats daily
          </p>
        )}
      </div>
      <button
        onClick={onCancel}
        className={`flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
          isDark
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            : "bg-red-100 text-red-600 hover:bg-red-200"
        }`}
      >
        <X size={12} />
        Cancel Schedule
      </button>
    </div>
  );
};
