import { useCallback } from "react";

import { setSettings } from "@/backend/services/storageService";

import type { AppSettings } from "@/backend/types";

interface UseSettingsHandlersProps {
  settings: AppSettings;
  setSettingsState: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export function useSettingsHandlers({ settings, setSettingsState }: UseSettingsHandlersProps) {
  const handleUpdateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      const updatedSettings = { ...settings, ...updates };
      setSettingsState(updatedSettings);
      await setSettings(updatedSettings);
    },
    [settings, setSettingsState]
  );

  const handleSaveApiKey = useCallback(
    async (apiKey: string) => {
      await handleUpdateSettings({ apiKey });
    },
    [handleUpdateSettings]
  );

  return {
    handleUpdateSettings,
    handleSaveApiKey,
  };
}
