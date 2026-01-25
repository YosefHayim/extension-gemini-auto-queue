import type { ResetFilter, SelectedFile } from "@/extension/components/bulk-actions/types";

export async function readFilesAsBase64(files: File[]): Promise<SelectedFile[]> {
  const readPromises = files.map((file) => {
    return new Promise<SelectedFile | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        if (typeof data === "string" && data.length > 0) {
          resolve({ data, name: file.name, type: file.type });
        } else {
          console.warn(`[Groove] Failed to read file: ${file.name}`);
          resolve(null);
        }
      };
      reader.onerror = () => {
        console.warn(`[Groove] Error reading file: ${file.name}`);
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  });

  const results = await Promise.all(readPromises);
  return results.filter((f): f is SelectedFile => f !== null);
}

export function buildResetFilter(
  filterType: ResetFilter["type"],
  textMatch: string,
  tool: ResetFilter["tool"] | null,
  mode: ResetFilter["mode"] | null,
  status: ResetFilter["status"] | null
): ResetFilter {
  const filter: ResetFilter = { type: filterType };

  switch (filterType) {
    case "text":
      if (textMatch.trim()) {
        filter.textMatch = textMatch.trim();
      }
      break;
    case "tool":
      if (tool) {
        filter.tool = tool;
      }
      break;
    case "mode":
      if (mode) {
        filter.mode = mode;
      }
      break;
    case "status":
      if (status) {
        filter.status = status;
      }
      break;
  }

  return filter;
}
