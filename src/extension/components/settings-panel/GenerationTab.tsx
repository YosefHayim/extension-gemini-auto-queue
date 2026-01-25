import { X } from "lucide-react";
import React from "react";

import { type AppSettings, GEMINI_TOOL_INFO, GeminiModel, GeminiTool } from "@/backend/types";
import {
  getSectionClasses,
  labelClasses,
  getInputClasses,
  getSelectClasses,
  getToggleButtonClasses,
  getToggleKnobClasses,
} from "@/extension/components/settings-panel/styles";

interface GenerationTabProps {
  settings: AppSettings;
  isDark?: boolean;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export const GenerationTab: React.FC<GenerationTabProps> = ({ settings, onUpdateSettings }) => {
  const sectionClasses = getSectionClasses();
  const inputClasses = getInputClasses();
  const selectClasses = getSelectClasses();

  return (
    <div className="animate-in fade-in space-y-4 duration-200">
      <div data-onboarding="model-selector" className={sectionClasses}>
        <label className={labelClasses}>Active Synthesis Model</label>
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
        <label className={labelClasses}>Default Tool</label>
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
          <label className={labelClasses}>Tool Sequence</label>
          <button
            onClick={() => onUpdateSettings({ useToolSequence: !settings.useToolSequence })}
            title={
              settings.useToolSequence ? "Disable tool sequence" : "Enable tool sequence cycling"
            }
            className={getToggleButtonClasses(settings.useToolSequence || false)}
          >
            <div className={getToggleKnobClasses(settings.useToolSequence || false)} />
          </button>
        </div>

        <div
          className={`flex min-h-[44px] flex-wrap gap-1.5 rounded-lg border border-border bg-background p-2.5 transition-opacity duration-150 ${!settings.useToolSequence ? "opacity-40" : ""}`}
        >
          {(settings.toolSequence ?? []).map((tool, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 rounded-lg bg-primary/20 px-2.5 py-1.5 text-xs font-medium text-primary"
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
                  className="ml-0.5 text-muted-foreground transition-colors duration-150 hover:text-foreground"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          {(settings.toolSequence ?? []).length === 0 && (
            <span className="text-xs text-muted-foreground">No tools in sequence</span>
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
                  className="min-h-[44px] rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium transition-colors duration-150 hover:bg-muted"
                >
                  {React.createElement(info.icon, { size: 16 })}
                </button>
              ))}
          </div>
        )}
      </div>

      <div className={sectionClasses}>
        <label className={labelClasses}>Global Prefix</label>
        <input
          value={settings.prefix}
          onChange={(e) => onUpdateSettings({ prefix: e.target.value })}
          placeholder="Text to prepend to all prompts..."
          className={inputClasses}
        />
      </div>

      <div className={sectionClasses}>
        <label className={labelClasses}>Global Suffix</label>
        <input
          value={settings.suffix}
          onChange={(e) => onUpdateSettings({ suffix: e.target.value })}
          placeholder="Text to append to all prompts..."
          className={inputClasses}
        />
      </div>

      <div className={sectionClasses}>
        <div className="mb-2 flex items-center justify-between px-1">
          <label className={labelClasses}>Negative Prompts</label>
          <button
            onClick={() =>
              onUpdateSettings({ globalNegativesEnabled: !settings.globalNegativesEnabled })
            }
            title={
              settings.globalNegativesEnabled
                ? "Disable negative prompts"
                : "Enable negative prompts"
            }
            className={getToggleButtonClasses(settings.globalNegativesEnabled || false)}
          >
            <div className={getToggleKnobClasses(settings.globalNegativesEnabled || false)} />
          </button>
        </div>
        <textarea
          value={settings.globalNegatives}
          onChange={(e) => onUpdateSettings({ globalNegatives: e.target.value })}
          placeholder="Things to avoid in all generations..."
          disabled={!settings.globalNegativesEnabled}
          className={`min-h-[80px] w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground outline-none transition-all duration-150 placeholder:text-muted-foreground ${!settings.globalNegativesEnabled ? "opacity-40" : ""}`}
        />
      </div>
    </div>
  );
};
