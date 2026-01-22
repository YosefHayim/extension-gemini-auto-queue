import React from "react";

interface ScheduleFormPopoverProps {
  isDark: boolean;
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
  isDark,
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
    <div
      className={`absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border p-3 shadow-xl ${
        isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
      }`}
    >
      <p className={`mb-3 text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
        Schedule queue to start at:
      </p>

      <div className="mb-3 flex gap-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          min={getMinDate()}
          className={`flex-1 rounded-md border px-2 py-1.5 text-xs outline-none ${
            isDark
              ? "border-slate-700 bg-slate-800 text-white"
              : "border-slate-200 bg-white text-slate-900"
          }`}
        />
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
          min={getMinTime()}
          className={`w-24 rounded-md border px-2 py-1.5 text-xs outline-none ${
            isDark
              ? "border-slate-700 bg-slate-800 text-white"
              : "border-slate-200 bg-white text-slate-900"
          }`}
        />
      </div>

      <label
        className={`mb-3 flex items-center gap-2 text-xs ${
          isDark ? "text-slate-400" : "text-slate-600"
        }`}
      >
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
          className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
            isDark
              ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Cancel
        </button>
        <button
          onClick={onSchedule}
          disabled={!selectedDate || !selectedTime}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isDark
              ? "bg-indigo-600 text-white hover:bg-indigo-500"
              : "bg-indigo-500 text-white hover:bg-indigo-600"
          }`}
        >
          Schedule
        </button>
      </div>
    </div>
  );
};
