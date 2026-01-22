import React, { useState } from "react";

import type { SettingsPanelProps, SettingsTab, TabConfig } from "./types";
import { ApiTab } from "./ApiTab";
import { GenerationTab } from "./GenerationTab";
import { InterfaceTab } from "./InterfaceTab";

const tabConfig: TabConfig[] = [
  { id: "api", label: "API" },
  { id: "generation", label: "Generation" },
  { id: "interface", label: "Interface" },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  isDark,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("api");

  return (
    <div className="animate-in fade-in space-y-4 duration-300">
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        {tabConfig.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-150 ${
              activeTab === tab.id
                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "api" && (
        <ApiTab settings={settings} isDark={isDark} onUpdateSettings={onUpdateSettings} />
      )}

      {activeTab === "generation" && (
        <GenerationTab settings={settings} isDark={isDark} onUpdateSettings={onUpdateSettings} />
      )}

      {activeTab === "interface" && (
        <InterfaceTab settings={settings} isDark={isDark} onUpdateSettings={onUpdateSettings} />
      )}
    </div>
  );
};

export default SettingsPanel;

// Re-export types for external use
export type { SettingsPanelProps, SettingsTab } from "./types";
