interface AdvancedSectionProps {
  isDark: boolean;
  dripFeed: boolean;
  onDripFeedToggle: () => void;
}

export function AdvancedSection({ isDark, dripFeed, onDripFeedToggle }: AdvancedSectionProps) {
  return (
    <div
      className={`mb-6 rounded-xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}
    >
      <h2 className="mb-4 text-lg font-bold">Advanced Settings</h2>

      <div className="flex items-center justify-between border-b border-white/5 py-3">
        <div>
          <p className="font-bold">Drip Feed Mode</p>
          <p className="text-sm opacity-40">
            Add random delays between generations to avoid rate limiting
          </p>
        </div>
        <button
          onClick={onDripFeedToggle}
          className={`relative h-6 w-12 rounded-full transition-all ${dripFeed ? "bg-blue-600" : "bg-white/10"}`}
        >
          <div
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all ${dripFeed ? "left-6" : "left-0.5"}`}
          />
        </button>
      </div>
    </div>
  );
}
