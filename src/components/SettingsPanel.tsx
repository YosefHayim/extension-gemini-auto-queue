import {
  ChevronDown,
  Eye,
  EyeOff,
  Info,
  Key,
  Moon,
  PanelLeft,
  PanelRight,
  Sun,
  X,
} from "lucide-react";
import React, { useState } from "react";

import { hasAnyAIKey } from "@/services/storageService";
import {
  AIProvider,
  AI_PROVIDER_INFO,
  type AppSettings,
  GEMINI_TOOL_INFO,
  GeminiModel,
  GeminiTool,
  SidebarPosition,
  ThemeMode,
} from "@/types";

// Inline info icon component for settings
const SettingInfo: React.FC<{ text: string; isDark?: boolean }> = ({ text, isDark = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="relative ml-1 inline-flex cursor-help items-center opacity-30 transition-opacity hover:opacity-70"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Info size={10} />
      {isHovered && (
        <div
          className={`absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs shadow-lg ${
            isDark ? "border border-white/10 bg-gray-800 text-white" : "bg-gray-900 text-white"
          }`}
        >
          {text}
          <div
            className={`absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent ${
              isDark ? "border-t-gray-800" : "border-t-gray-900"
            }`}
          />
        </div>
      )}
    </span>
  );
};

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
    <div className="animate-in fade-in space-y-4 duration-300">
      {/* AI Providers Configuration */}
      <div
        className={`space-y-2 rounded-md border p-2 ${isDark ? "bg-white/2 border-white/5" : "border-slate-100 bg-slate-50"}`}
      >
        <button
          onClick={() => {
            setIsAIProvidersExpanded(!isAIProvidersExpanded);
          }}
          className="flex w-full items-center justify-between px-1"
        >
          <label className="flex cursor-pointer items-center text-[9px] font-black uppercase tracking-widest opacity-40">
            <Key size={10} className="mr-1" />
            AI Providers
            <SettingInfo
              text="Configure API keys for AI-powered features like prompt optimization"
              isDark={isDark}
            />
          </label>
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-black uppercase ${hasAnyKey ? "text-emerald-500" : "text-amber-500"}`}
            >
              {hasAnyKey ? `${configuredProviders} Configured` : "Not Set"}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isAIProvidersExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        {isAIProvidersExpanded && (
          <div className="animate-in slide-in-from-top-1 space-y-3 pt-2 duration-200">
            {/* Preferred Provider Selection */}
            <div className="space-y-1">
              <label className="ml-1 text-[9px] font-black uppercase tracking-widest opacity-40">
                Preferred Provider
              </label>
              <select
                value={settings.preferredAIProvider || AIProvider.GEMINI}
                onChange={(e) => {
                  onUpdateSettings({ preferredAIProvider: e.target.value as AIProvider });
                }}
                className={`w-full appearance-none rounded-md border p-2 text-[10px] font-black uppercase outline-none transition-all ${
                  isDark
                    ? "border-white/10 bg-black/40 focus:border-blue-500/50"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                {Object.entries(AI_PROVIDER_INFO).map(([provider, info]) => (
                  <option key={provider} value={provider}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Provider API Keys */}
            {Object.entries(AI_PROVIDER_INFO).map(([provider, info]) => {
              const providerKey = provider as AIProvider;
              const apiKey = settings.aiApiKeys?.[providerKey] ?? "";
              const isVisible = visibleKeys[providerKey];

              return (
                <div key={provider} className="space-y-1">
                  <label className="ml-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest opacity-40">
                    {info.label}
                    {apiKey && <span className="text-emerald-500">●</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={isVisible ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => {
                        handleApiKeyChange(providerKey, e.target.value);
                      }}
                      placeholder={`Enter your ${info.label} API key...`}
                      className={`w-full rounded-md border p-2 pr-10 text-xs outline-none ${
                        isDark
                          ? "border-white/10 bg-black/40 focus:border-blue-500/50"
                          : "border-slate-200 bg-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        toggleKeyVisibility(providerKey);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-40 transition-opacity hover:opacity-100"
                      title={isVisible ? "Hide API key" : "Show API key"}
                    >
                      {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <p className="ml-1 text-[8px] opacity-30">{info.description}</p>
                </div>
              );
            })}

            {!hasAnyKey && (
              <p className="px-1 text-[9px] text-amber-500/80">
                Add at least one API key to enable AI prompt optimization
              </p>
            )}
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <div
        className={`space-y-2 rounded-md border p-2 ${isDark ? "bg-white/2 border-white/5" : "border-slate-100 bg-slate-50"}`}
      >
        <div className="flex items-center justify-between px-1">
          <label className="flex items-center text-[9px] font-black uppercase tracking-widest opacity-40">
            Interface Theme
            <SettingInfo text="Switch between dark and light appearance" isDark={isDark} />
          </label>
          <button
            onClick={() => {
              onUpdateSettings({
                theme: isDark ? ThemeMode.LIGHT : ThemeMode.DARK,
              });
            }}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`flex items-center gap-2 rounded-md border p-2 text-[10px] font-black uppercase transition-all ${
              isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"
            }`}
          >
            {isDark ? (
              <Sun size={12} className="text-amber-400" />
            ) : (
              <Moon size={12} className="text-blue-500" />
            )}
            {isDark ? "Switch to Light" : "Switch to Dark"}
          </button>
        </div>
      </div>

      {/* Model Selection */}
      <div
        data-onboarding="model-selector"
        className={`space-y-2 rounded-md border p-2 ${isDark ? "bg-white/2 border-white/5" : "border-slate-100 bg-slate-50"}`}
      >
        <label className="ml-1 flex items-center text-[9px] font-black uppercase tracking-widest opacity-40">
          Active Synthesis Model
          <SettingInfo
            text="Flash 2.0 is faster, Imagen 3 produces higher quality images"
            isDark={isDark}
          />
        </label>
        <select
          value={settings.primaryModel}
          onChange={(e) => {
            onUpdateSettings({ primaryModel: e.target.value as GeminiModel });
          }}
          className={`w-full appearance-none rounded-md border p-2 text-[10px] font-black uppercase outline-none transition-all ${
            isDark
              ? "border-white/10 bg-black/40 focus:border-blue-500/50"
              : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <option value={GeminiModel.FLASH}>Flash 2.0 (High Speed)</option>
          <option value={GeminiModel.PRO}>Imagen 3 (High Fidelity)</option>
        </select>
      </div>

      {/* Default Tool Selection */}
      <div
        className={`space-y-2 rounded-md border p-2 ${isDark ? "bg-white/2 border-white/5" : "border-slate-100 bg-slate-50"}`}
      >
        <label className="ml-1 flex items-center text-[9px] font-black uppercase tracking-widest opacity-40">
          Default Tool
          <SettingInfo
            text="The Gemini tool to use for new prompts (Image, Video, Canvas, etc.)"
            isDark={isDark}
          />
        </label>
        <select
          value={settings.defaultTool || GeminiTool.IMAGE}
          onChange={(e) => {
            onUpdateSettings({ defaultTool: e.target.value as GeminiTool });
          }}
          className={`w-full appearance-none rounded-md border p-2 text-[10px] font-black uppercase outline-none transition-all ${
            isDark
              ? "border-white/10 bg-black/40 focus:border-blue-500/50"
              : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          {Object.entries(GEMINI_TOOL_INFO).map(([tool, info]) => (
            <option key={tool} value={tool}>
              {info.label} - {info.description}
            </option>
          ))}
        </select>
      </div>

      {/* Tool Sequence */}
      <div
        className={`space-y-2 rounded-md border p-2 ${isDark ? "bg-white/2 border-white/5" : "border-slate-100 bg-slate-50"}`}
      >
        <div className="mb-2 flex items-center justify-between px-1">
          <div>
            <label className="flex items-center text-[9px] font-black uppercase tracking-widest opacity-40">
              Tool Sequence
              <SettingInfo
                text="Cycle through different tools for each prompt (e.g., Image → Video → Canvas → repeat)"
                isDark={isDark}
              />
            </label>
          </div>
          <button
            onClick={() => {
              onUpdateSettings({ useToolSequence: !settings.useToolSequence });
            }}
            title={
              settings.useToolSequence ? "Disable tool sequence" : "Enable tool sequence cycling"
            }
            className={`relative h-5 w-10 rounded-full transition-all ${settings.useToolSequence ? "bg-blue-600" : "bg-white/10"}`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-all ${settings.useToolSequence ? "left-5" : "left-0.5"}`}
            />
          </button>
        </div>

        {/* Sequence display */}
        <div
          className={`flex min-h-[40px] flex-wrap gap-1 rounded-md border p-2 transition-opacity ${
            isDark ? "border-white/10 bg-black/40" : "border-slate-200 bg-white"
          } ${!settings.useToolSequence ? "opacity-40" : ""}`}
        >
          {(settings.toolSequence ?? []).map((tool, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ${
                isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
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
                  className="ml-1 opacity-50 hover:opacity-100"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
          {(settings.toolSequence ?? []).length === 0 && (
            <span className="text-[10px] opacity-40">No tools in sequence</span>
          )}
        </div>

        {/* Add tool to sequence */}
        {settings.useToolSequence && (
          <div className="flex flex-wrap gap-1">
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
                  className={`rounded-md px-2 py-1 text-[9px] font-bold transition-all ${
                    isDark
                      ? "border border-white/10 bg-white/5 hover:bg-white/10"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {React.createElement(info.icon, { size: 14 })}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Prefix/Suffix Settings */}
      <div
        className={`space-y-2 rounded-md border p-2 ${isDark ? "bg-white/2 border-white/5" : "border-slate-100 bg-slate-50"}`}
      >
        <label className="ml-1 flex items-center text-[9px] font-black uppercase tracking-widest opacity-40">
          Global Prefix
          <SettingInfo
            text="Text automatically added before every prompt (e.g., 'High quality, detailed')"
            isDark={isDark}
          />
        </label>
        <input
          value={settings.prefix}
          onChange={(e) => {
            onUpdateSettings({ prefix: e.target.value });
          }}
          placeholder="Text to prepend to all prompts..."
          className={`w-full rounded-md border p-2 text-xs outline-none ${isDark ? "border-white/10 bg-black/40" : "border-slate-200 bg-white"}`}
        />
      </div>

      <div
        className={`space-y-2 rounded-md border p-2 ${isDark ? "bg-white/2 border-white/5" : "border-slate-100 bg-slate-50"}`}
      >
        <label className="ml-1 flex items-center text-[9px] font-black uppercase tracking-widest opacity-40">
          Global Suffix
          <SettingInfo
            text="Text automatically added after every prompt (e.g., '4K resolution, cinematic')"
            isDark={isDark}
          />
        </label>
        <input
          value={settings.suffix}
          onChange={(e) => {
            onUpdateSettings({ suffix: e.target.value });
          }}
          placeholder="Text to append to all prompts..."
          className={`w-full rounded-md border p-2 text-xs outline-none ${isDark ? "border-white/10 bg-black/40" : "border-slate-200 bg-white"}`}
        />
      </div>

      {/* Sidebar Position */}
      <div
        className={`space-y-2 rounded-md border p-2 ${isDark ? "bg-white/2 border-white/5" : "border-slate-100 bg-slate-50"}`}
      >
        <div className="flex items-center justify-between px-1">
          <div>
            <label className="flex items-center text-[9px] font-black uppercase tracking-widest opacity-40">
              Sidebar Position
              <SettingInfo
                text="Choose which side of the screen to show the Nano Flow panel"
                isDark={isDark}
              />
            </label>
          </div>
          <button
            onClick={() => {
              onUpdateSettings({
                position:
                  settings.position === SidebarPosition.LEFT
                    ? SidebarPosition.RIGHT
                    : SidebarPosition.LEFT,
              });
            }}
            title={
              settings.position === SidebarPosition.LEFT
                ? "Move panel to right side"
                : "Move panel to left side"
            }
            className={`flex items-center gap-2 rounded-md border p-2 text-[10px] font-black uppercase transition-all ${
              isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"
            }`}
          >
            {settings.position === SidebarPosition.LEFT ? (
              <PanelLeft size={12} className="text-blue-500" />
            ) : (
              <PanelRight size={12} className="text-blue-500" />
            )}
            {settings.position === SidebarPosition.LEFT ? "Left Side" : "Right Side"}
          </button>
        </div>
      </div>

      {/* Global Negatives */}
      <div
        className={`space-y-2 rounded-md border p-2 ${isDark ? "bg-white/2 border-white/5" : "border-slate-100 bg-slate-50"}`}
      >
        <div className="mb-2 flex items-center justify-between px-1">
          <div>
            <label className="flex items-center text-[9px] font-black uppercase tracking-widest opacity-40">
              Negative Prompts
              <SettingInfo
                text="Elements to avoid in images: blurry, extra fingers, watermarks, etc."
                isDark={isDark}
              />
            </label>
          </div>
          <button
            onClick={() => {
              onUpdateSettings({ globalNegativesEnabled: !settings.globalNegativesEnabled });
            }}
            title={
              settings.globalNegativesEnabled
                ? "Disable negative prompts"
                : "Enable negative prompts"
            }
            className={`relative h-5 w-10 rounded-full transition-all ${settings.globalNegativesEnabled ? "bg-blue-600" : "bg-white/10"}`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-all ${settings.globalNegativesEnabled ? "left-5" : "left-0.5"}`}
            />
          </button>
        </div>
        <textarea
          value={settings.globalNegatives}
          onChange={(e) => {
            onUpdateSettings({ globalNegatives: e.target.value });
          }}
          placeholder="Things to avoid in all generations..."
          disabled={!settings.globalNegativesEnabled}
          className={`min-h-[60px] w-full rounded-md border p-2 text-xs outline-none transition-opacity ${
            isDark ? "border-white/10 bg-black/40" : "border-slate-200 bg-white"
          } ${!settings.globalNegativesEnabled ? "opacity-40" : ""}`}
        />
      </div>

      {/* Drip Feed Toggle */}
      <div
        className={`space-y-2 rounded-md border p-2 ${isDark ? "bg-white/2 border-white/5" : "border-slate-100 bg-slate-50"}`}
      >
        <div className="flex items-center justify-between px-1">
          <div>
            <label className="flex items-center text-[9px] font-black uppercase tracking-widest opacity-40">
              Drip Feed Mode
              <SettingInfo
                text="Adds random delays between prompts to avoid rate limiting"
                isDark={isDark}
              />
            </label>
          </div>
          <button
            onClick={() => {
              onUpdateSettings({ dripFeed: !settings.dripFeed });
            }}
            title={
              settings.dripFeed ? "Disable random delays" : "Enable random delays between prompts"
            }
            className={`relative h-5 w-10 rounded-full transition-all ${settings.dripFeed ? "bg-blue-600" : "bg-white/10"}`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-all ${settings.dripFeed ? "left-5" : "left-0.5"}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
