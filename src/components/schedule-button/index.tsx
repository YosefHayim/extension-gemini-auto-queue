import { Calendar } from "lucide-react";
import React, { useState } from "react";

import { MessageType } from "@/types";

import { ActiveSchedulePopover } from "./ActiveSchedulePopover";
import { ScheduleFormPopover } from "./ScheduleFormPopover";
import { useCountdown } from "./useCountdown";

import type { ScheduleButtonProps } from "./types";

export const ScheduleButton: React.FC<ScheduleButtonProps> = ({
  schedule,
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
          className="flex items-center gap-1.5 rounded-md bg-primary/20 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
        >
          <Calendar size={12} />
          <span>{countdown}</span>
          {schedule.repeatDaily && <span className="opacity-60">daily</span>}
        </button>

        {showPopover && <ActiveSchedulePopover schedule={schedule} onCancel={handleCancel} />}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPopover(!showPopover)}
        disabled={!hasPendingItems}
        title={hasPendingItems ? "Schedule queue processing" : "Add items to queue first"}
        className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Calendar size={12} />
        <span>Schedule</span>
      </button>

      {showPopover && hasPendingItems && (
        <ScheduleFormPopover
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
