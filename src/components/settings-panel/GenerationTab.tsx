import { X } from "lucide-react";
import React from "react";

import { type AppSettings, GEMINI_TOOL_INFO, GeminiModel, GeminiTool } from "@/types";

import { Tooltip } from "../Tooltip";

import {
  getSectionClasses,
  labelClasses,
  getInputClasses,
  getSelectClasses,
  getToggleButtonClasses,
  getToggleKnobClasses,
} from "./styles";

interface GenerationTabProps {
  settings: AppSettings;
  isDark: boolean;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export const GenerationTab: React.FC<GenerationTabProps> = ({
  settings,
  isDark,
  onUpdateSettings,
}) => {
  const sectionClasses = getSectionClasses(isDark);
  const inputClasses = getInputClasses(isDark);
  const selectClasses = getSelectClasses(isDark);

  return (
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
              settings.useToolSequence ? "Disable tool sequence" : "Enable tool sequence cycling"
            }
            className={getToggleButtonClasses(settings.useToolSequence || false, isDark)}
          >
            <div className={getToggleKnobClasses(settings.useToolSequence || false)} />
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
                {GEMINI_TOOL_INFO[tool] && "icon" in GEMINI_TOOL_INFO[tool]
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
          className={`min-h-[80px] w-full rounded-lg border p-3 text-xs outline-none transition-all duration-150 ${
            isDark
              ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
              : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
          } ${!settings.globalNegativesEnabled ? "opacity-40" : ""}`}
        />
      </div>
    </div>
  );
};
