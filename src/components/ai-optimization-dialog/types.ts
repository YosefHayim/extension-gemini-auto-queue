import type { QueueItem } from "@/types";

export type OptimizationPersona = "creative" | "technical" | "punchy";

export interface AIOptimizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  hasApiKey: boolean;
  pendingCount: number;
  pendingItems: QueueItem[];
  onOptimize: (instructions: string, persona: string) => void;
}

export interface PersonaOption {
  id: OptimizationPersona;
  label: string;
}
