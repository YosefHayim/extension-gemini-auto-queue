import { Folder, List, Settings as SettingsIcon } from "lucide-react";

import type { TabType } from "../types";

interface NavigationProps {
  isDark: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const tabs = [
  { id: "queue" as const, icon: List, label: "Queue" },
  { id: "templates" as const, icon: Folder, label: "Templates" },
  { id: "settings" as const, icon: SettingsIcon, label: "Settings" },
];

export function Navigation({ isDark, activeTab, setActiveTab }: NavigationProps) {
  return (
    <nav className={`flex gap-1 rounded-md p-1 ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded px-4 py-2 text-sm font-medium transition-all ${
              isActive
                ? isDark
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-900 shadow-sm"
                : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
