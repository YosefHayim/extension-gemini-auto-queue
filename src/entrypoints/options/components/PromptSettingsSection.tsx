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
  isDark,
  prefix,
  suffix,
  globalNegatives,
  onPrefixChange,
  onSuffixChange,
  onNegativesChange,
}: PromptSettingsSectionProps) {
  const inputClass = `w-full rounded-lg border p-3 text-sm outline-none transition-all ${
    isDark
      ? "border-white/10 bg-black/40 focus:border-blue-500/50"
      : "border-slate-200 bg-slate-50 focus:border-blue-500"
  }`;

  return (
    <div
      className={`mb-6 rounded-xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}
    >
      <h2 className="mb-4 text-lg font-bold">Default Prompt Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold opacity-60">Global Prefix</label>
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
          <label className="mb-2 block text-sm font-bold opacity-60">Global Suffix</label>
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
          <label className="mb-2 block text-sm font-bold opacity-60">Negative Prompts</label>
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
