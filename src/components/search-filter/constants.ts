import { CheckCircle, Circle, Image, Layers, Loader2, Type, XCircle } from "lucide-react";

import { ContentType, GeminiMode, QueueStatus } from "@/types";

export const MODE_PILL_STYLES: Record<GeminiMode, { selected: string; unselected: string }> = {
  [GeminiMode.Quick]: {
    selected: "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/25",
    unselected: "border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10",
  },
  [GeminiMode.Deep]: {
    selected: "bg-blue-500 text-white border-blue-500 shadow-blue-500/25",
    unselected: "border-blue-500/40 text-blue-500 hover:bg-blue-500/10",
  },
  [GeminiMode.Pro]: {
    selected: "bg-purple-500 text-white border-purple-500 shadow-purple-500/25",
    unselected: "border-purple-500/40 text-purple-500 hover:bg-purple-500/10",
  },
};

export const CONTENT_TYPE_INFO: Record<ContentType, { label: string; icon: typeof Type }> = {
  [ContentType.TextOnly]: { label: "Text Only", icon: Type },
  [ContentType.WithImages]: { label: "With Images", icon: Image },
  [ContentType.TextAndImages]: { label: "Text + Images", icon: Layers },
};

export const STATUS_INFO: Record<
  QueueStatus,
  { label: string; icon: typeof Circle; selectedStyle: string; unselectedStyle: string }
> = {
  [QueueStatus.Pending]: {
    label: "Pending",
    icon: Circle,
    selectedStyle: "bg-slate-500 text-white border-slate-500 shadow-slate-500/25",
    unselectedStyle: "border-slate-400/40 text-slate-500 hover:bg-slate-500/10",
  },
  [QueueStatus.Processing]: {
    label: "Processing",
    icon: Loader2,
    selectedStyle: "bg-amber-500 text-white border-amber-500 shadow-amber-500/25",
    unselectedStyle: "border-amber-500/40 text-amber-500 hover:bg-amber-500/10",
  },
  [QueueStatus.Completed]: {
    label: "Completed",
    icon: CheckCircle,
    selectedStyle: "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/25",
    unselectedStyle: "border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10",
  },
  [QueueStatus.Failed]: {
    label: "Failed",
    icon: XCircle,
    selectedStyle: "bg-red-500 text-white border-red-500 shadow-red-500/25",
    unselectedStyle: "border-red-500/40 text-red-500 hover:bg-red-500/10",
  },
};
