import type { ScheduleConfig } from "@/types";

export interface ScheduleButtonProps {
  schedule: ScheduleConfig;
  isDark: boolean;
  hasPendingItems: boolean;
}
