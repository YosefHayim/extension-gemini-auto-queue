import { ChevronDown, Eye, EyeOff, Key } from "lucide-react";
import React, { useState } from "react";

import { hasAnyAIKey } from "@/services/storageService";
import { AIProvider, AI_PROVIDER_INFO, type AppSettings } from "@/types";

import { Tooltip } from "../Tooltip";

import { getSectionClasses, labelClasses, getInputClasses, getSelectClasses } from "./styles";

interface ApiTabProps {
  settings: AppSettings;
  isDark: boolean;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export const ApiTab: React.FC<ApiTabProps> = ({ settings, isDark, onUpdateSettings }) => {
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

  const sectionClasses = getSectionClasses();
  const inputClasses = getInputClasses();
  const selectClasses = getSelectClasses();

  return (
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
              className={`text-muted-foreground transition-transform duration-200 ${
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
  );
};
