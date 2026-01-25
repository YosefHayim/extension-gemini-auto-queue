import type { QueueItem } from "@/backend/types";
import type { ExportFormat } from "@/extension/components/export-dialog/types";

export const escapeCSV = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const generateTimestamp = (): string => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
};

export const generateExportContent = (queue: QueueItem[], format: ExportFormat): string => {
  switch (format) {
    case "txt":
      return queue.map((item) => item.finalPrompt || item.originalPrompt).join("\n");

    case "json":
      return JSON.stringify(queue, null, 2);

    case "csv": {
      const headers = ["Prompt", "Tool", "Mode", "Status"];
      const rows = queue.map((item) => [
        escapeCSV(item.finalPrompt || item.originalPrompt),
        escapeCSV(item.tool ?? ""),
        escapeCSV(item.mode ?? ""),
        escapeCSV(item.status),
      ]);
      return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    }

    default:
      return "";
  }
};

export const downloadExport = (
  queue: QueueItem[],
  format: ExportFormat,
  onClose: () => void
): void => {
  const content = generateExportContent(queue, format);
  const timestamp = generateTimestamp();
  const filename = `nano-flow-queue-${timestamp}.${format}`;

  const mimeTypes: Record<ExportFormat, string> = {
    txt: "text/plain",
    json: "application/json",
    csv: "text/csv",
  };

  const blob = new Blob([content], { type: `${mimeTypes[format]};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  onClose();
};
