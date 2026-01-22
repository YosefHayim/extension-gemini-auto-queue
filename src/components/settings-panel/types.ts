import type { AppSettings } from "@/types";

export type SettingsTab = "api" | "generation" | "interface";

export interface SettingsPanelProps {
  settings: AppSettings;
  isDark: boolean;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export interface TabConfig {
  id: SettingsTab;
  label: string;
}
