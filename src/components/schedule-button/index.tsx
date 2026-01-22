import { Calendar } from "lucide-react";
import React, { useState } from "react";

import { MessageType } from "@/types";

import { ActiveSchedulePopover } from "./ActiveSchedulePopover";
import { ScheduleFormPopover } from "./ScheduleFormPopover";
import { useCountdown } from "./useCountdown";

import type { ScheduleButtonProps } from "./types";

export const ScheduleButton: React.FC<ScheduleButtonProps> = ({
  schedule,
  isDark,
  hasPendingItems,
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [repeatDaily, setRepeatDaily] = useState(false);
  const countdown = useCountdown(schedule);

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) return;

    const scheduledTime = new Date(`${selectedDate}T${selectedTime}`).getTime();
    if (scheduledTime <= Date.now()) {
      return;
    }

    await chrome.runtime.sendMessage({
      type: MessageType.SET_SCHEDULE,
      payload: { scheduledTime, repeatDaily },
    });

    setShowPopover(false);
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleCancel = async () => {
    await chrome.runtime.sendMessage({ type: MessageType.CANCEL_SCHEDULE });
  };

  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

  const getMinTime = () => {
    if (!selectedDate) return "";
    const now = new Date();
    const selected = new Date(selectedDate);
    if (selected.toDateString() === now.toDateString()) {
      return now.toTimeString().slice(0, 5);
    }
    return "00:00";
  };

  if (schedule.enabled && schedule.scheduledTime) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowPopover(!showPopover)}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
            isDark
              ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
              : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
          }`}
        >
          <Calendar size={12} />
          <span>{countdown}</span>
          {schedule.repeatDaily && <span className="opacity-60">daily</span>}
        </button>

        {showPopover && (
          <ActiveSchedulePopover schedule={schedule} isDark={isDark} onCancel={handleCancel} />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPopover(!showPopover)}
        disabled={!hasPendingItems}
        title={hasPendingItems ? "Schedule queue processing" : "Add items to queue first"}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          isDark
            ? "text-slate-400 hover:bg-slate-700 hover:text-slate-300"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        }`}
      >
        <Calendar size={12} />
        <span>Schedule</span>
      </button>

      {showPopover && hasPendingItems && (
        <ScheduleFormPopover
          isDark={isDark}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          repeatDaily={repeatDaily}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
          onRepeatChange={setRepeatDaily}
          onCancel={() => setShowPopover(false)}
          onSchedule={handleSchedule}
          getMinDate={getMinDate}
          getMinTime={getMinTime}
        />
      )}
    </div>
  );
};

export default ScheduleButton;

export type { ScheduleButtonProps } from "./types";
