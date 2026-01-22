import { Clock } from "lucide-react";

interface HeaderProps {
  isDark: boolean;
  isProcessing: boolean;
  activeTimer: number;
}

export function Header({ isDark, isProcessing, activeTimer }: HeaderProps) {
  return (
    <div
      data-onboarding="sidebar-header"
      className={`flex items-center justify-between border-b p-2 ${isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50"}`}
    >
      <div className="flex items-center gap-2">
        <img src="/icons/icon-32.png" alt="Gemini" className="h-6 w-6" />
        <h1 className="text-sm font-black tracking-tight">Nano Flow</h1>
      </div>
      {isProcessing && (
        <div className="flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5">
          <Clock size={10} className="animate-spin text-blue-500" />
          <span className="text-[10px] font-black text-blue-500">
            {(activeTimer / 1000).toFixed(1)}s
          </span>
        </div>
      )}
    </div>
  );
}
