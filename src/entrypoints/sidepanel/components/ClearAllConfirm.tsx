interface ClearAllConfirmProps {
  isDark: boolean;
  itemCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ClearAllConfirm({ isDark, itemCount, onCancel, onConfirm }: ClearAllConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`mx-4 w-full max-w-sm rounded-lg border p-4 shadow-2xl ${
          isDark ? "border-white/20 bg-gray-900" : "border-slate-200 bg-white"
        }`}
      >
        <h3 className={`mb-2 text-sm font-black ${isDark ? "text-white" : "text-gray-900"}`}>
          Clear All Queue Items?
        </h3>
        <p className={`mb-4 text-xs ${isDark ? "text-white/70" : "text-gray-600"}`}>
          This will permanently delete all {itemCount} item{itemCount !== 1 ? "s" : ""} in the
          queue. This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className={`min-h-[44px] flex-1 rounded-lg border px-3 py-2.5 text-xs font-semibold uppercase transition-all ${
              isDark
                ? "border-white/20 bg-white/5 hover:bg-white/10"
                : "border-slate-200 bg-slate-100 hover:bg-slate-200"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="min-h-[44px] flex-1 rounded-lg bg-red-600 px-3 py-2.5 text-xs font-semibold uppercase text-white transition-all hover:bg-red-700 active:scale-95"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
