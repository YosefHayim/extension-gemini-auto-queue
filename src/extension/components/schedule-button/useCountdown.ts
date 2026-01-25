import { useEffect, useState } from "react";

import type { ScheduleConfig } from "@/backend/types";

export function useCountdown(schedule: ScheduleConfig): string {
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

  return countdown;
}
