import { ChevronDown, Eye, EyeOff, Key, Laptop, Moon, Sun, X } from "lucide-react";
import React, { useState } from "react";

import { hasAnyAIKey } from "@/services/storageService";
import {
  AIProvider,
  AI_PROVIDER_INFO,
  type AppSettings,
  GEMINI_TOOL_INFO,
  GeminiModel,
  GeminiTool,
  ThemeMode,
} from "@/types";

import { Tooltip } from "./Tooltip";

type SettingsTab = "api" | "generation" | "interface";

interface SettingsPanelProps {
  settings: AppSettings;
  isDark: boolean;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  isDark,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("api");
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

  const tabConfig = [
    { id: "api" as const, label: "API" },
    { id: "generation" as const, label: "Generation" },
    { id: "interface" as const, label: "Interface" },
  ];

  const sectionClasses = `space-y-2 rounded-lg border p-3 ${
    isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"
  }`;

  const labelClasses =
    "ml-1 flex items-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400";

  const inputClasses = `min-h-[44px] w-full rounded-lg border p-3 text-xs outline-none transition-colors duration-150 ${
    isDark
      ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-indigo-500"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
  }`;

  const selectClasses = `min-h-[44px] w-full appearance-none rounded-lg border p-3 text-xs font-medium outline-none transition-colors duration-150 ${
    isDark
      ? "border-slate-700 bg-slate-900 text-white focus:border-indigo-500"
      : "border-slate-200 bg-white text-slate-900 shadow-sm focus:border-indigo-500"
  }`;

  const toggleButtonClasses = (isActive: boolean) =>
    `relative h-6 w-11 rounded-full transition-colors duration-150 ${
      isActive ? "bg-indigo-500" : isDark ? "bg-slate-600" : "bg-slate-300"
    }`;

  const toggleKnobClasses = (isActive: boolean) =>
    `absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-150 ${
      isActive ? "left-[22px]" : "left-0.5"
    }`;

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
        <div className="animate-in fade-in space-y-4 duration-200">
          <div className={sectionClasses}>
            <button
              onClick={() => setIsAIProvidersExpanded(!isAIProvidersExpanded)}
              className="flex w-full items-center justify-between px-1"
            >
              <label className={`${labelClasses} cursor-pointer`}>
                <Key size={12} className="mr-1.5" />
                AI Providers
                <Tooltip
                  text="Configure API keys for AI-powered features like prompt optimization"
                  isDark={isDark}
                />
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
                  <label className={labelClasses}>Preferred Provider</label>
                  <select
                    value={settings.preferredAIProvider || AIProvider.GEMINI}
                    onChange={(e) => {
                      onUpdateSettings({ preferredAIProvider: e.target.value as AIProvider });
                    }}
                    className={selectClasses}
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
                      <label className={labelClasses}>
                        {info.label}
                        {apiKey && <span className="ml-1.5 text-emerald-500">*</span>}
                      </label>
                      <div className="relative">
                        <input
                          type={isVisible ? "text" : "password"}
                          value={apiKey}
                          onChange={(e) => handleApiKeyChange(providerKey, e.target.value)}
                          placeholder={`Enter your ${info.label} API key...`}
                          className={`${inputClasses} pr-10`}
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
                      <p className="ml-1 text-[11px] text-slate-400">{info.description}</p>
                    </div>
                  );
                })}

                {!hasAnyKey && (
                  <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
                    Add at least one API key to enable AI prompt optimization
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "generation" && (
        <div className="animate-in fade-in space-y-4 duration-200">
          <div data-onboarding="model-selector" className={sectionClasses}>
            <label className={labelClasses}>
              Active Synthesis Model
              <Tooltip
                text="Flash 2.0 is faster, Imagen 3 produces higher quality images"
                isDark={isDark}
              />
            </label>
            <select
              value={settings.primaryModel}
              onChange={(e) => {
                onUpdateSettings({ primaryModel: e.target.value as GeminiModel });
              }}
              className={selectClasses}
            >
              <option value={GeminiModel.FLASH}>Flash 2.0 (High Speed)</option>
              <option value={GeminiModel.PRO}>Imagen 3 (High Fidelity)</option>
            </select>
          </div>

          <div className={sectionClasses}>
            <label className={labelClasses}>
              Default Tool
              <Tooltip
                text="The Gemini tool to use for new prompts (Image, Video, Canvas, etc.)"
                isDark={isDark}
              />
            </label>
            <select
              value={settings.defaultTool || GeminiTool.IMAGE}
              onChange={(e) => {
                onUpdateSettings({ defaultTool: e.target.value as GeminiTool });
              }}
              className={selectClasses}
            >
              {Object.entries(GEMINI_TOOL_INFO).map(([tool, info]) => (
                <option key={tool} value={tool}>
                  {info.label} - {info.description}
                </option>
              ))}
            </select>
          </div>

          <div className={sectionClasses}>
            <div className="mb-2 flex items-center justify-between px-1">
              <label className={labelClasses}>
                Tool Sequence
                <Tooltip
                  text="Cycle through different tools for each prompt (e.g., Image -> Video -> Canvas -> repeat)"
                  isDark={isDark}
                />
              </label>
              <button
                onClick={() => onUpdateSettings({ useToolSequence: !settings.useToolSequence })}
                title={
                  settings.useToolSequence
                    ? "Disable tool sequence"
                    : "Enable tool sequence cycling"
                }
                className={toggleButtonClasses(settings.useToolSequence || false)}
              >
                <div className={toggleKnobClasses(settings.useToolSequence || false)} />
              </button>
            </div>

            <div
              className={`flex min-h-[44px] flex-wrap gap-1.5 rounded-lg border p-2.5 transition-opacity duration-150 ${
                isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
              } ${!settings.useToolSequence ? "opacity-40" : ""}`}
            >
              {(settings.toolSequence ?? []).map((tool, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                    isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  <span>
                    {GEMINI_TOOL_INFO[tool]?.icon
                      ? React.createElement(GEMINI_TOOL_INFO[tool].icon, { size: 12 })
                      : "?"}
                  </span>
                  <span>{GEMINI_TOOL_INFO[tool]?.label || tool}</span>
                  {settings.useToolSequence && (
                    <button
                      onClick={() => {
                        const newSequence = [...(settings.toolSequence ?? [])];
                        newSequence.splice(idx, 1);
                        onUpdateSettings({
                          toolSequence: newSequence.length > 0 ? newSequence : [GeminiTool.IMAGE],
                        });
                      }}
                      title="Remove from sequence"
                      className="ml-0.5 text-slate-400 transition-colors duration-150 hover:text-slate-200"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              {(settings.toolSequence ?? []).length === 0 && (
                <span className="text-xs text-slate-400">No tools in sequence</span>
              )}
            </div>

            {settings.useToolSequence && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {Object.entries(GEMINI_TOOL_INFO)
                  .filter(([tool]) => tool !== GeminiTool.NONE)
                  .map(([tool, info]) => (
                    <button
                      key={tool}
                      onClick={() => {
                        onUpdateSettings({
                          toolSequence: [...(settings.toolSequence ?? []), tool as GeminiTool],
                        });
                      }}
                      title={`Add ${info.label} to sequence`}
                      className={`min-h-[44px] rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-150 ${
                        isDark
                          ? "border border-slate-700 bg-slate-800 hover:bg-slate-700"
                          : "bg-slate-100 hover:bg-slate-200"
                      }`}
                    >
                      {React.createElement(info.icon, { size: 16 })}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className={sectionClasses}>
            <label className={labelClasses}>
              Global Prefix
              <Tooltip
                text="Text automatically added before every prompt (e.g., 'High quality, detailed')"
                isDark={isDark}
              />
            </label>
            <input
              value={settings.prefix}
              onChange={(e) => onUpdateSettings({ prefix: e.target.value })}
              placeholder="Text to prepend to all prompts..."
              className={inputClasses}
            />
          </div>

          <div className={sectionClasses}>
            <label className={labelClasses}>
              Global Suffix
              <Tooltip
                text="Text automatically added after every prompt (e.g., '4K resolution, cinematic')"
                isDark={isDark}
              />
            </label>
            <input
              value={settings.suffix}
              onChange={(e) => onUpdateSettings({ suffix: e.target.value })}
              placeholder="Text to append to all prompts..."
              className={inputClasses}
            />
          </div>

          <div className={sectionClasses}>
            <div className="mb-2 flex items-center justify-between px-1">
              <label className={labelClasses}>
                Negative Prompts
                <Tooltip
                  text="Elements to avoid in images: blurry, extra fingers, watermarks, etc."
                  isDark={isDark}
                />
              </label>
              <button
                onClick={() =>
                  onUpdateSettings({ globalNegativesEnabled: !settings.globalNegativesEnabled })
                }
                title={
                  settings.globalNegativesEnabled
                    ? "Disable negative prompts"
                    : "Enable negative prompts"
                }
                className={toggleButtonClasses(settings.globalNegativesEnabled || false)}
              >
                <div className={toggleKnobClasses(settings.globalNegativesEnabled || false)} />
              </button>
            </div>
            <textarea
              value={settings.globalNegatives}
              onChange={(e) => onUpdateSettings({ globalNegatives: e.target.value })}
              placeholder="Things to avoid in all generations..."
              disabled={!settings.globalNegativesEnabled}
              className={`min-h-[80px] w-full rounded-lg border p-3 text-xs outline-none transition-all duration-150 ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
                  : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
              } ${!settings.globalNegativesEnabled ? "opacity-40" : ""}`}
            />
          </div>
        </div>
      )}

      {activeTab === "interface" && (
        <div className="animate-in fade-in space-y-4 duration-200">
          <div data-onboarding="theme-selector" className={sectionClasses}>
            <label className={labelClasses}>
              Interface Theme
              <Tooltip
                text="Choose Light, Dark, or System to follow your browser preference"
                isDark={isDark}
              />
            </label>
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
                      ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-500"
                      : isDark
                        ? "border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200"
                        : "border-slate-200 bg-slate-100 text-slate-500 hover:text-slate-700"
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
              <label className={labelClasses}>
                Drip Feed Mode
                <Tooltip
                  text="Adds random delays between prompts to avoid rate limiting"
                  isDark={isDark}
                />
              </label>
              <button
                onClick={() => onUpdateSettings({ dripFeed: !settings.dripFeed })}
                title={
                  settings.dripFeed
                    ? "Disable random delays"
                    : "Enable random delays between prompts"
                }
                className={toggleButtonClasses(settings.dripFeed || false)}
              >
                <div className={toggleKnobClasses(settings.dripFeed || false)} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
