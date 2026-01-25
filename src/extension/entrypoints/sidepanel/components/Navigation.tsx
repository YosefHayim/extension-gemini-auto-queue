import { Folder, List, Settings as SettingsIcon } from "lucide-react";

import type { TabType } from "@/extension/entrypoints/sidepanel/types";

interface NavigationProps {
  isDark?: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const tabs = [
  { id: "queue" as const, icon: List, label: "Queue" },
  { id: "templates" as const, icon: Folder, label: "Templates" },
  { id: "settings" as const, icon: SettingsIcon, label: "Settings" },
];

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  return (
    <nav className="flex gap-1 rounded-md bg-muted p-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded px-4 py-2 text-[13px] font-medium transition-all ${
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
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
