import { Calendar, X } from "lucide-react";
import React, { useEffect, useState } from "react";

import { MessageType, type ScheduleConfig } from "@/types";

interface ScheduleButtonProps {
  schedule: ScheduleConfig;
  isDark: boolean;
  hasPendingItems: boolean;
}

export const ScheduleButton: React.FC<ScheduleButtonProps> = ({
  schedule,
  isDark,
  hasPendingItems,
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!schedule.enabled || !schedule.scheduledTime) {
      setCountdown("");
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const diff = schedule.scheduledTime! - now;

      if (diff <= 0) {
        setCountdown("Starting...");
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [schedule.enabled, schedule.scheduledTime]);

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
    const scheduledDate = new Date(schedule.scheduledTime);
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
          <div
            className={`absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border p-3 shadow-xl ${
              isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-3">
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Scheduled for
              </p>
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
              onClick={handleCancel}
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
              onChange={(e) => setSelectedDate(e.target.value)}
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
              onChange={(e) => setSelectedTime(e.target.value)}
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
              onChange={(e) => setRepeatDaily(e.target.checked)}
              className="rounded"
            />
            Repeat daily at this time
          </label>

          <div className="flex gap-2">
            <button
              onClick={() => setShowPopover(false)}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                isDark
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSchedule}
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
      )}
    </div>
  );
};

export default ScheduleButton;
