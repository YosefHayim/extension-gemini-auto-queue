import { BookMarked, Cpu, Settings as SettingsIcon } from "lucide-react";

import type { TabType } from "../types";

interface NavigationProps {
  isDark: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const tabs = [
  { id: "queue" as const, icon: Cpu, label: "Queue" },
  { id: "templates" as const, icon: BookMarked, label: "Templates" },
  { id: "settings" as const, icon: SettingsIcon, label: "Settings" },
];

export function Navigation({ isDark, activeTab, setActiveTab }: NavigationProps) {
  return (
    <nav
      className={`flex overflow-hidden border-b ${isDark ? "bg-white/2 border-white/5" : "border-slate-100"}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
          }}
          className={`group relative flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1.5 py-2 text-[11px] font-bold uppercase tracking-wide transition-all ${
            activeTab === tab.id ? "text-blue-500" : "opacity-40 hover:opacity-100"
          }`}
        >
          <tab.icon size={16} />
          <span className="w-full truncate px-1 text-center">{tab.label}</span>
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t-md bg-blue-500" />
          )}
        </button>
      ))}
    </nav>
  );
}
