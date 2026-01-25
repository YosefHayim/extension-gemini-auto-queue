import React from "react";

interface ScheduleFormPopoverProps {
  selectedDate: string;
  selectedTime: string;
  repeatDaily: boolean;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onRepeatChange: (repeat: boolean) => void;
  onCancel: () => void;
  onSchedule: () => void;
  getMinDate: () => string;
  getMinTime: () => string;
}

export const ScheduleFormPopover: React.FC<ScheduleFormPopoverProps> = ({
  selectedDate,
  selectedTime,
  repeatDaily,
  onDateChange,
  onTimeChange,
  onRepeatChange,
  onCancel,
  onSchedule,
  getMinDate,
  getMinTime,
}) => {
  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-background p-3 shadow-xl">
      <p className="mb-3 text-xs font-medium text-foreground">Schedule queue to start at:</p>

      <div className="mb-3 flex gap-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          min={getMinDate()}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none"
        />
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
          min={getMinTime()}
          className="w-28 rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none"
        />
      </div>

      <label className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={repeatDaily}
          onChange={(e) => onRepeatChange(e.target.checked)}
          className="rounded"
        />
        Repeat daily at this time
      </label>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-md border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          Cancel
        </button>
        <button
          onClick={onSchedule}
          disabled={!selectedDate || !selectedTime}
          className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Schedule
        </button>
      </div>
    </div>
  );
};
