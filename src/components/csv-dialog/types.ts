export interface CsvDialogProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onUpload: (items: { prompt: string; tool?: string; images?: string[] }[]) => void;
}

export interface ParsedRow {
  prompt: string;
  tool?: string;
  imageRefs: string[];
}

export type CsvStep = "upload" | "images";
