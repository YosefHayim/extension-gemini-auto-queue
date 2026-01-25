import { FileJson, FileSpreadsheet, FileText } from "lucide-react";

import type { FormatOption } from "./types";

export const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: "txt",
    name: "Plain Text",
    extension: ".txt",
    description: "One prompt per line, simple and universal",
    icon: FileText,
  },
  {
    id: "json",
    name: "JSON",
    extension: ".json",
    description: "Full data export with all fields preserved",
    icon: FileJson,
  },
  {
    id: "csv",
    name: "CSV",
    extension: ".csv",
    description: "Spreadsheet format with prompt, tool, mode, status",
    icon: FileSpreadsheet,
  },
];
