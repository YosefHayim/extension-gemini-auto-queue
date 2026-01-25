import { Download, Pause, Play } from "lucide-react";

import { QueueStatus, type QueueItem } from "@/types";

interface FooterControlsProps {
  isDark: boolean;
  queue: QueueItem[];
  isProcessing: boolean;
  isPaused: boolean;
  onToggleProcessing: () => void;
}

export function FooterControls({
  isDark,
  queue,
  isProcessing,
  isPaused,
  onToggleProcessing,
}: FooterControlsProps) {
  const completedItems = queue.filter((item) => item.status === QueueStatus.Completed);

  return (
    <div
      className={`space-y-3 border-t p-3 ${isDark ? "border-white/10 bg-black/80 backdrop-blur-xl" : "border-slate-200 bg-slate-50"}`}
    >
      <div className="flex gap-3">
        <button
          data-onboarding="start-button"
          onClick={onToggleProcessing}
          disabled={queue.length === 0}
          title={
            isProcessing
              ? "Pause processing queue"
              : isPaused
                ? "Continue processing queue"
                : "Start processing queue"
          }
          className={`flex min-h-[48px] flex-[4] items-center justify-center gap-2.5 rounded-xl p-3 text-sm font-bold uppercase tracking-wide shadow-xl transition-all active:scale-[0.98] ${
            isProcessing
              ? "bg-amber-500 shadow-amber-500/30"
              : isPaused
                ? "bg-green-600 shadow-green-600/30"
                : "bg-blue-600 shadow-blue-600/30"
          } text-white disabled:opacity-30`}
        >
          {isProcessing ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
          {isProcessing ? "Pause" : isPaused ? "Continue" : "Start"}
        </button>
      </div>

      {/* Results Preview */}
      {completedItems.length > 0 && (
        <div className="no-scrollbar flex gap-1 overflow-x-auto py-1">
          {completedItems.slice(-5).map((item) => {
            const resultUrl = item.results?.flash?.url ?? item.results?.pro?.url;
            return resultUrl ? (
              <div key={item.id} className="group relative shrink-0">
                <img
                  src={resultUrl}
                  className="h-12 w-12 rounded-md border border-white/10 object-cover"
                  alt="Result"
                />
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = resultUrl;
                    link.download = `nano_flow_${item.id}.png`;
                    link.click();
                  }}
                  title="Download image"
                  className="absolute inset-0 flex items-center justify-center rounded-md bg-black/60 opacity-0 transition-all group-hover:opacity-100"
                >
                  <Download size={12} className="text-white" />
                </button>
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
