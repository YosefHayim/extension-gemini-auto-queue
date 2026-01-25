import { X } from "lucide-react";
import React from "react";

import type { ScheduleConfig } from "@/backend/types";

interface ActiveSchedulePopoverProps {
  schedule: ScheduleConfig;
  onCancel: () => void;
}

export const ActiveSchedulePopover: React.FC<ActiveSchedulePopoverProps> = ({
  schedule,
  onCancel,
}) => {
  const scheduledDate = new Date(schedule.scheduledTime!);

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-border bg-background p-3 shadow-xl">
      <div className="mb-3">
        <p className="text-xs text-muted-foreground">Scheduled for</p>
        <p className="font-medium text-foreground">{scheduledDate.toLocaleString()}</p>
        {schedule.repeatDaily && <p className="text-xs text-primary">Repeats daily</p>}
      </div>
      <button
        onClick={onCancel}
        className="flex w-full items-center justify-center gap-1.5 rounded-md bg-destructive/20 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/30"
      >
        <X size={12} />
        Cancel Schedule
      </button>
    </div>
  );
};
