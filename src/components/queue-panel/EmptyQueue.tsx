import { Inbox } from "lucide-react";
import React from "react";

interface EmptyQueueProps {
  isDark?: boolean;
}

export const EmptyQueue: React.FC<EmptyQueueProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12">
      <Inbox size={48} className="text-muted-foreground/50" />
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium text-muted-foreground">Your queue is empty</span>
        <span className="text-xs text-muted-foreground/70">Add prompts above to get started</span>
      </div>
    </div>
  );
};
