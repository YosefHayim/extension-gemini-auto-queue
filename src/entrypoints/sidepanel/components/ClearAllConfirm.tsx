interface ClearAllConfirmProps {
  isDark: boolean;
  itemCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ClearAllConfirm({
  isDark: _isDark,
  itemCount,
  onCancel,
  onConfirm,
}: ClearAllConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-lg border border-border bg-card p-4 shadow-2xl">
        <h3 className="mb-2 text-sm font-black text-card-foreground">Clear All Queue Items?</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          This will permanently delete all {itemCount} item{itemCount !== 1 ? "s" : ""} in the
          queue. This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="min-h-[44px] flex-1 rounded-lg border border-border bg-secondary px-3 py-2.5 text-xs font-semibold uppercase transition-all hover:bg-secondary/80"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="min-h-[44px] flex-1 rounded-lg bg-destructive px-3 py-2.5 text-xs font-semibold uppercase text-destructive-foreground transition-all hover:bg-destructive/90 active:scale-95"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
