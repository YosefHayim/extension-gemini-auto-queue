import type { AppSettings, AuthUser } from "@/backend/types";

export type SettingsTab = "api" | "generation" | "interface";

export interface SettingsPanelProps {
  settings: AppSettings;
  isDark: boolean;
  user?: AuthUser | null;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export interface TabConfig {
  id: SettingsTab;
  label: string;
}
