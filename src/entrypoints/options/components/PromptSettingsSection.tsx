interface PromptSettingsSectionProps {
  isDark: boolean;
  prefix: string;
  suffix: string;
  globalNegatives: string;
  onPrefixChange: (value: string) => void;
  onSuffixChange: (value: string) => void;
  onNegativesChange: (value: string) => void;
}

export function PromptSettingsSection({
  isDark: _isDark,
  prefix,
  suffix,
  globalNegatives,
  onPrefixChange,
  onSuffixChange,
  onNegativesChange,
}: PromptSettingsSectionProps) {
  const inputClass =
    "w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none transition-all focus:border-blue-500";

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">Default Prompt Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-muted-foreground">
            Global Prefix
          </label>
          <input
            value={prefix}
            onChange={(e) => {
              onPrefixChange(e.target.value);
            }}
            placeholder="Text to prepend to all prompts..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-muted-foreground">
            Global Suffix
          </label>
          <input
            value={suffix}
            onChange={(e) => {
              onSuffixChange(e.target.value);
            }}
            placeholder="Text to append to all prompts..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-muted-foreground">
            Negative Prompts
          </label>
          <textarea
            value={globalNegatives}
            onChange={(e) => {
              onNegativesChange(e.target.value);
            }}
            placeholder="Things to avoid in generations..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>
    </div>
  );
}
