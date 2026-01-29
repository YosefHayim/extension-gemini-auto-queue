import { Crown, Eye, EyeOff, ExternalLink, Key } from "lucide-react";
import React, { useState } from "react";
import { SiGoogle, SiOpenai, SiAnthropic } from "react-icons/si";

import { AIProvider, AI_PROVIDER_INFO, GeminiModel, SubscriptionPlan, ThemeMode } from "@/backend/types";

import type { SettingsPanelProps } from "@/extension/components/settings-panel/types";

const PROVIDER_ICONS: Record<AIProvider, React.ElementType> = {
  [AIProvider.GEMINI]: SiGoogle,
  [AIProvider.OPENAI]: SiOpenai,
  [AIProvider.ANTHROPIC]: SiAnthropic,
};

const getSectionClasses = () => `space-y-4 rounded-lg bg-muted p-4 border border-border`;

const descriptionClasses = "text-xs text-muted-foreground";
const inputClasses = () =>
  `w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-all duration-150 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary`;

const selectClasses = () =>
  `w-full rounded-md border px-3 py-2.5 text-sm outline-none transition-all duration-150 border-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary`;

const getToggleButtonClasses = (isActive: boolean) =>
  `relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
    isActive ? "bg-primary" : "bg-muted-foreground"
  }`;

const getToggleKnobClasses = (isActive: boolean) =>
  `inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
    isActive ? "translate-x-5" : "translate-x-0.5"
  }`;

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  isDark,
  user,
  onUpdateSettings,
}) => {
  const [visibleKeys, setVisibleKeys] = useState<Record<AIProvider, boolean>>({
    [AIProvider.GEMINI]: false,
    [AIProvider.OPENAI]: false,
    [AIProvider.ANTHROPIC]: false,
  });

  const isPro = user?.plan === SubscriptionPlan.PRO;

  const toggleKeyVisibility = (provider: AIProvider) => {
    setVisibleKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleApiKeyChange = (provider: AIProvider, value: string) => {
    onUpdateSettings({
      aiApiKeys: {
        ...settings.aiApiKeys,
        [provider]: value || undefined,
      },
    });
  };

  return (
    <div className="animate-in fade-in space-y-6 overflow-y-auto duration-300">
      <div className={getSectionClasses()}>
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          Appearance
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-normal text-foreground">Dark Mode</label>
            <p className={descriptionClasses}>Switch to dark theme</p>
          </div>
          <button
            onClick={() =>
              onUpdateSettings({
                theme: settings.theme === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK,
              })
            }
            className={getToggleButtonClasses(
              settings.theme === ThemeMode.DARK || (settings.theme === ThemeMode.SYSTEM && isDark)
            )}
          >
            <div
              className={getToggleKnobClasses(
                settings.theme === ThemeMode.DARK || (settings.theme === ThemeMode.SYSTEM && isDark)
              )}
            />
          </button>
        </div>
      </div>

      <div className={getSectionClasses()}>
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          Generation
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-normal text-foreground">Drip-Feed Mode</label>
            <p className={descriptionClasses}>Add delays between prompts</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ dripFeed: !settings.dripFeed })}
            className={getToggleButtonClasses(settings.dripFeed || false)}
          >
            <div className={getToggleKnobClasses(settings.dripFeed || false)} />
          </button>
        </div>

        {settings.dripFeed && (
          <div className="ml-4 flex items-center justify-between">
            <div>
              <label className="text-sm font-normal text-foreground">Delay Duration</label>
              <p className={descriptionClasses}>Base time between each prompt</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={120}
                value={settings.dripFeedDelay}
                onChange={(e) => {
                  const value = Math.max(1, Math.min(120, Number(e.target.value) || 10));
                  onUpdateSettings({ dripFeedDelay: value });
                }}
                className="w-16 rounded-md border border-border bg-background px-2 py-2 text-center text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">seconds</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-normal text-foreground">Auto-Stop on Error</label>
            <p className={descriptionClasses}>Stop processing when error occurs</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ autoStopOnError: !settings.autoStopOnError })}
            className={getToggleButtonClasses(settings.autoStopOnError || false)}
          >
            <div className={getToggleKnobClasses(settings.autoStopOnError || false)} />
          </button>
        </div>
      </div>

      <div className={getSectionClasses()}>
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-foreground">Account</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-sm font-normal text-foreground">
              <Key size={14} />
              API Keys
            </label>
            <span className="text-xs text-muted-foreground">Optional</span>
          </div>

          {Object.entries(AI_PROVIDER_INFO).map(([provider, info]) => {
            const providerKey = provider as AIProvider;
            const apiKey = settings.aiApiKeys[providerKey] ?? "";
            const isVisible = visibleKeys[providerKey];

            const ProviderIcon = PROVIDER_ICONS[providerKey];
            return (
              <div key={provider} className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-normal text-foreground">
                  <ProviderIcon size={14} className="text-muted-foreground" />
                  {info.label}
                  {apiKey && <span className="ml-1.5 text-emerald-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={isVisible ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(providerKey, e.target.value)}
                    placeholder="Enter API key..."
                    className={`${inputClasses()} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility(providerKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-150 hover:text-foreground"
                    title={isVisible ? "Hide API key" : "Show API key"}
                  >
                    {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-normal text-foreground">Default Model</label>
          <select
            value={settings.primaryModel}
            onChange={(e) => onUpdateSettings({ primaryModel: e.target.value as GeminiModel })}
            className={selectClasses()}
          >
            <option value={GeminiModel.FLASH}>Gemini 2.0 Flash</option>
            <option value={GeminiModel.PRO}>Imagen 3</option>
          </select>
          <p className={descriptionClasses}>Used when no model is specified</p>
        </div>

        <div className="rounded-lg border border-border bg-secondary p-4">
          <div className="flex items-center justify-between">
            <div>
              {isPro ? (
                <>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Crown size={14} className="text-amber-500" />
                    Pro Plan
                  </p>
                  <p className={descriptionClasses}>Unlimited prompts</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Free Plan</p>
                  <p className={descriptionClasses}>Limited prompts/day</p>
                </>
              )}
            </div>
            {!isPro && (
              <a
                href="https://yosefhayimsabag.com/prompt-queue/checkout/buy/44bdfe85-5961-4caf-911b-9d5a059664ce"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
              >
                <Crown size={14} />
                Upgrade
              </a>
            )}
          </div>
        </div>
      </div>

      <div className={getSectionClasses()}>
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-foreground">About</h3>

        <div className="space-y-0 border-t border-border">
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
              className="flex items-center justify-between border-b border-border py-3 transition-colors duration-150 hover:bg-muted"
            >
              <span className="text-sm font-normal text-foreground">{link.label}</span>
              <ExternalLink size={14} className="text-muted-foreground" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

export type { SettingsPanelProps } from "@/extension/components/settings-panel/types";
