interface AdvancedSectionProps {
  isDark: boolean;
  dripFeed: boolean;
  onDripFeedToggle: () => void;
  analyticsEnabled: boolean;
  onAnalyticsToggle: () => void;
}

export function AdvancedSection({
  isDark: _isDark,
  dripFeed,
  onDripFeedToggle,
  analyticsEnabled,
  onAnalyticsToggle,
}: AdvancedSectionProps) {
  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">Advanced Settings</h2>

      <div className="flex items-center justify-between border-b border-border py-3">
        <div>
          <p className="font-bold">Drip Feed Mode</p>
          <p className="text-sm text-muted-foreground">
            Add random delays between generations to avoid rate limiting
          </p>
        </div>
        <button
          onClick={onDripFeedToggle}
          className={`relative h-6 w-12 rounded-full transition-all ${dripFeed ? "bg-blue-600" : "bg-muted"}`}
        >
          <div
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all ${dripFeed ? "left-6" : "left-0.5"}`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between py-3">
        <div>
          <p className="font-bold">Usage Analytics</p>
          <p className="text-sm text-muted-foreground">
            Help improve Groove by sharing anonymous usage data
          </p>
        </div>
        <button
          onClick={onAnalyticsToggle}
          className={`relative h-6 w-12 rounded-full transition-all ${analyticsEnabled ? "bg-blue-600" : "bg-muted"}`}
        >
          <div
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all ${analyticsEnabled ? "left-6" : "left-0.5"}`}
          />
        </button>
      </div>
    </div>
  );
}
