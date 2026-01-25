import { GripVertical } from "lucide-react";
import React from "react";

interface DragHandleProps {
  isDark?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export const DragHandle: React.FC<DragHandleProps> = ({ dragHandleProps }) => {
  return (
    <div
      {...dragHandleProps}
      className="mt-0.5 flex min-h-[28px] min-w-[28px] cursor-grab items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
      title="Drag to reorder"
    >
      <GripVertical size={14} />
    </div>
  );
};
