import type { QueueItem } from "@/backend/types";
import type { FileText } from "lucide-react";

export type ExportFormat = "txt" | "json" | "csv";

export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  queue: QueueItem[];
  isDark: boolean;
}

export interface FormatOption {
  id: ExportFormat;
  name: string;
  extension: string;
  description: string;
  icon: typeof FileText;
}
