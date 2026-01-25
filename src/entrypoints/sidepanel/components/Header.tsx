import { Clock } from "lucide-react";

import { UserAvatar } from "@/components/auth";
import type { AuthUser } from "@/types";

interface HeaderProps {
  isDark: boolean;
  isProcessing: boolean;
  activeTimer: number;
  completedCount: number;
  totalCount: number;
  user: AuthUser | null;
  onSignOut: () => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function Header({
  isDark: _isDark,
  isProcessing,
  activeTimer,
  completedCount,
  totalCount,
  user,
  onSignOut,
}: HeaderProps) {
  return (
    <div
      data-onboarding="sidebar-header"
      className="flex items-center justify-between border-b border-border bg-muted/50 p-2"
    >
      <div className="flex items-center gap-2">
        <img src="/icons/icon-32.png" alt="Gemini" className="h-6 w-6" />
        <h1 className="text-sm font-black tracking-tight">Nano Flow</h1>
      </div>

      <div className="flex items-center gap-2">
        {isProcessing && (
          <div className="flex animate-pulse items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5">
            <Clock size={10} className="text-blue-500" />
            <span className="text-[10px] font-black text-blue-500">
              Running {formatTime(activeTimer)} · {completedCount}/{totalCount}
            </span>
          </div>
        )}
        {user && <UserAvatar user={user} onSignOut={onSignOut} />}
      </div>
    </div>
  );
}
