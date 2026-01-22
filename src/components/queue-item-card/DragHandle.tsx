import { GripVertical } from "lucide-react";
import React from "react";

interface DragHandleProps {
  isDark: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export const DragHandle: React.FC<DragHandleProps> = ({ isDark, dragHandleProps }) => {
  return (
    <div
      {...dragHandleProps}
      className={`mt-0.5 flex min-h-[28px] min-w-[28px] cursor-grab items-center justify-center rounded transition-colors active:cursor-grabbing ${isDark ? "text-slate-600 hover:text-slate-400" : "text-slate-300 hover:text-slate-400"}`}
      title="Drag to reorder"
    >
      <GripVertical size={14} />
    </div>
  );
};
