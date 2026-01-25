import { Laptop, Moon, Sun } from "lucide-react";
import React from "react";

import { type AppSettings, ThemeMode } from "@/backend/types";
import {
  getSectionClasses,
  labelClasses,
  getToggleButtonClasses,
  getToggleKnobClasses,
} from "@/extension/components/settings-panel/styles";

interface InterfaceTabProps {
  settings: AppSettings;
  isDark?: boolean;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export const InterfaceTab: React.FC<InterfaceTabProps> = ({ settings, onUpdateSettings }) => {
  const sectionClasses = getSectionClasses();

  return (
    <div className="animate-in fade-in space-y-4 duration-200">
      <div data-onboarding="theme-selector" className={sectionClasses}>
        <label className={labelClasses}>Interface Theme</label>
        <div className="flex gap-1.5">
          {[
            { mode: ThemeMode.LIGHT, icon: Sun, label: "Light", color: "text-amber-500" },
            { mode: ThemeMode.DARK, icon: Moon, label: "Dark", color: "text-indigo-500" },
            { mode: ThemeMode.SYSTEM, icon: Laptop, label: "System", color: "text-violet-500" },
          ].map(({ mode, icon: Icon, label, color }) => (
            <button
              key={mode}
              onClick={() => onUpdateSettings({ theme: mode })}
              title={`Use ${label.toLowerCase()} theme${mode === ThemeMode.SYSTEM ? " (follows browser)" : ""}`}
              className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors duration-150 ${
                settings.theme === mode
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} className={settings.theme === mode ? color : ""} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={sectionClasses}>
        <div className="flex items-center justify-between px-1">
          <label className={labelClasses}>Drip Feed Mode</label>
          <button
            onClick={() => onUpdateSettings({ dripFeed: !settings.dripFeed })}
            title={
              settings.dripFeed ? "Disable random delays" : "Enable random delays between prompts"
            }
            className={getToggleButtonClasses(settings.dripFeed || false)}
          >
            <div className={getToggleKnobClasses(settings.dripFeed || false)} />
          </button>
        </div>
      </div>
    </div>
  );
};
