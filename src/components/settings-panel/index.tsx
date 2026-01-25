import {
  ChevronDown,
  Crown,
  Eye,
  EyeOff,
  ExternalLink,
  Key,
  Laptop,
  Moon,
  Sun,
} from "lucide-react";
import React, { useState } from "react";

import { hasAnyAIKey } from "@/services/storageService";
import {
  AIProvider,
  AI_PROVIDER_INFO,
  GEMINI_TOOL_INFO,
  GeminiModel,
  GeminiTool,
  SidebarPosition,
  ThemeMode,
} from "@/types";

import type { SettingsPanelProps } from "./types";

const getSectionClasses = (isDark: boolean) =>
  `space-y-4 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-50"} p-4 border ${isDark ? "border-slate-700" : "border-slate-200"}`;

const labelClasses = "text-sm font-medium text-foreground flex items-center gap-1.5";
const descriptionClasses = "text-xs text-muted-foreground";
const inputClasses = (isDark: boolean) =>
  `w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-all duration-150 ${
    isDark
      ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
  } focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`;

const selectClasses = (isDark: boolean) =>
  `w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-all duration-150 ${
    isDark ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"
  } focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`;

const getToggleButtonClasses = (isActive: boolean, isDark: boolean) =>
  `relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
    isActive ? "bg-emerald-500" : isDark ? "bg-slate-600" : "bg-slate-300"
  }`;

const getToggleKnobClasses = (isActive: boolean) =>
  `inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
    isActive ? "translate-x-5" : "translate-x-0.5"
  }`;

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  isDark,
  onUpdateSettings,
}) => {
  const [isAIProvidersExpanded, setIsAIProvidersExpanded] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<AIProvider, boolean>>({
    [AIProvider.GEMINI]: false,
    [AIProvider.OPENAI]: false,
    [AIProvider.ANTHROPIC]: false,
  });

  const hasAnyKey = hasAnyAIKey(settings);
  const configuredProviders = Object.entries(settings.aiApiKeys || {}).filter(
    ([, key]) => key
  ).length;

  const toggleKeyVisibility = (provider: AIProvider) => {
    setVisibleKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleApiKeyChange = (provider: AIProvider, value: string) => {
    onUpdateSettings({
      aiApiKeys: {
        ...settings.aiApiKeys,
        [provider]: value ?? undefined,
      },
    });
  };

  return (
    <div className="animate-in fade-in space-y-6 overflow-y-auto duration-300">
      <div className={getSectionClasses(isDark)}>
        <h3 className={labelClasses}>Appearance</h3>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-normal text-foreground">Dark Mode</label>
            <p className={descriptionClasses}>Choose Light, Dark, or System theme</p>
          </div>
          <div className="flex gap-1.5">
            {[
              { mode: ThemeMode.LIGHT, icon: Sun, label: "Light" },
              { mode: ThemeMode.DARK, icon: Moon, label: "Dark" },
              { mode: ThemeMode.SYSTEM, icon: Laptop, label: "System" },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => onUpdateSettings({ theme: mode })}
                title={`Use ${label.toLowerCase()} theme`}
                className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors duration-150 ${
                  settings.theme === mode
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                    : isDark
                      ? "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-normal text-foreground">Panel Position</label>
          <select
            value={settings.position || SidebarPosition.RIGHT}
            onChange={(e) => onUpdateSettings({ position: e.target.value as SidebarPosition })}
            className={selectClasses(isDark)}
          >
            <option value={SidebarPosition.LEFT}>Left</option>
            <option value={SidebarPosition.RIGHT}>Right</option>
          </select>
        </div>
      </div>

      <div className={getSectionClasses(isDark)}>
        <h3 className={labelClasses}>Generation</h3>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-normal text-foreground">Drip Feed Mode</label>
            <p className={descriptionClasses}>Add random delays between prompts (8-15 seconds)</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ dripFeed: !settings.dripFeed })}
            className={getToggleButtonClasses(settings.dripFeed || false, isDark)}
          >
            <div className={getToggleKnobClasses(settings.dripFeed || false)} />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-normal text-foreground">Default Model</label>
          <select
            value={settings.primaryModel}
            onChange={(e) => onUpdateSettings({ primaryModel: e.target.value as GeminiModel })}
            className={selectClasses(isDark)}
          >
            <option value={GeminiModel.FLASH}>Flash 2.0 (High Speed)</option>
            <option value={GeminiModel.PRO}>Imagen 3 (High Fidelity)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-normal text-foreground">Default Tool</label>
          <select
            value={settings.defaultTool || GeminiTool.IMAGE}
            onChange={(e) => onUpdateSettings({ defaultTool: e.target.value as GeminiTool })}
            className={selectClasses(isDark)}
          >
            {Object.entries(GEMINI_TOOL_INFO).map(([tool, info]) => (
              <option key={tool} value={tool}>
                {info.label} - {info.description}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-normal text-foreground">Global Prefix</label>
          <input
            value={settings.prefix}
            onChange={(e) => onUpdateSettings({ prefix: e.target.value })}
            placeholder="Text to prepend to all prompts..."
            className={inputClasses(isDark)}
          />
          <p className={descriptionClasses}>Added before every prompt</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-normal text-foreground">Global Suffix</label>
          <input
            value={settings.suffix}
            onChange={(e) => onUpdateSettings({ suffix: e.target.value })}
            placeholder="Text to append to all prompts..."
            className={inputClasses(isDark)}
          />
          <p className={descriptionClasses}>Added after every prompt</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-normal text-foreground">Negative Prompts</label>
            <button
              onClick={() =>
                onUpdateSettings({ globalNegativesEnabled: !settings.globalNegativesEnabled })
              }
              className={getToggleButtonClasses(settings.globalNegativesEnabled || false, isDark)}
            >
              <div className={getToggleKnobClasses(settings.globalNegativesEnabled || false)} />
            </button>
          </div>
          <textarea
            value={settings.globalNegatives}
            onChange={(e) => onUpdateSettings({ globalNegatives: e.target.value })}
            placeholder="Things to avoid in all generations..."
            disabled={!settings.globalNegativesEnabled}
            className={`min-h-[80px] w-full rounded-md border p-3 text-sm outline-none transition-all duration-150 ${
              isDark
                ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
            } focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${!settings.globalNegativesEnabled ? "opacity-40" : ""}`}
          />
        </div>
      </div>

      <div className={getSectionClasses(isDark)}>
        <h3 className={labelClasses}>Account</h3>

        <div className="space-y-3 border-t border-slate-700/50 pt-3">
          <button
            onClick={() => setIsAIProvidersExpanded(!isAIProvidersExpanded)}
            className="flex w-full items-center justify-between"
          >
            <label className={`${labelClasses} cursor-pointer`}>
              <Key size={14} />
              API Keys
            </label>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold ${
                  hasAnyKey ? "text-emerald-500" : "text-amber-500"
                }`}
              >
                {hasAnyKey ? `${configuredProviders} Configured` : "Not Set"}
              </span>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 ${
                  isAIProvidersExpanded ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {isAIProvidersExpanded && (
            <div className="animate-in slide-in-from-top-1 space-y-4 pt-3 duration-200">
              <div className="space-y-1.5">
                <label className="text-sm font-normal text-foreground">Preferred Provider</label>
                <select
                  value={settings.preferredAIProvider || AIProvider.GEMINI}
                  onChange={(e) =>
                    onUpdateSettings({ preferredAIProvider: e.target.value as AIProvider })
                  }
                  className={selectClasses(isDark)}
                >
                  {Object.entries(AI_PROVIDER_INFO).map(([provider, info]) => (
                    <option key={provider} value={provider}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </div>

              {Object.entries(AI_PROVIDER_INFO).map(([provider, info]) => {
                const providerKey = provider as AIProvider;
                const apiKey = settings.aiApiKeys?.[providerKey] ?? "";
                const isVisible = visibleKeys[providerKey];

                return (
                  <div key={provider} className="space-y-1.5">
                    <label className="text-sm font-normal text-foreground">
                      {info.label}
                      {apiKey && <span className="ml-1.5 text-emerald-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={isVisible ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => handleApiKeyChange(providerKey, e.target.value)}
                        placeholder={`Enter your ${info.label} API key...`}
                        className={`${inputClasses(isDark)} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility(providerKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-150 hover:text-slate-600 dark:hover:text-slate-200"
                        title={isVisible ? "Hide API key" : "Show API key"}
                      >
                        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className={descriptionClasses}>{info.description}</p>
                  </div>
                );
              })}

              {!hasAnyKey && (
                <p
                  className={`rounded-lg px-3 py-2 text-xs ${isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-700"}`}
                >
                  Add at least one API key to enable AI prompt optimization
                </p>
              )}
            </div>
          )}
        </div>

        <div
          className={`rounded-lg p-4 ${isDark ? "bg-slate-700/50" : "bg-slate-100"} border ${isDark ? "border-slate-600" : "border-slate-200"}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-amber-500" />
              <div>
                <p className="text-sm font-medium text-foreground">Free Plan</p>
                <p className={descriptionClasses}>Upgrade for advanced features</p>
              </div>
            </div>
            <button className="rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors duration-150 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
              Upgrade
            </button>
          </div>
        </div>
      </div>

      <div className={getSectionClasses(isDark)}>
        <h3 className={labelClasses}>About</h3>

        <div className="space-y-0 border-t border-slate-700/50">
          {[
            { label: "Documentation", url: "https://docs.example.com" },
            { label: "Privacy Policy", url: "https://privacy.example.com" },
            { label: "Report Bug", url: "https://github.com/example/issues" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between border-b py-3 transition-colors duration-150 ${
                isDark
                  ? "border-slate-700 hover:bg-slate-700/30"
                  : "border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className="text-sm font-normal text-foreground">{link.label}</span>
              <ExternalLink size={14} className="text-slate-400" />
            </a>
          ))}
        </div>

        <div className="pt-2">
          <p className={`text-xs ${descriptionClasses}`}>
            Version <span className="font-semibold">1.0.0</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

export type { SettingsPanelProps } from "./types";
