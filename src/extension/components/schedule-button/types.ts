import type { ScheduleConfig } from "@/backend/types";

export interface ScheduleButtonProps {
  schedule: ScheduleConfig;
  isDark: boolean;
  hasPendingItems: boolean;
}
