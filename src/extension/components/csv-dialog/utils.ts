import type { ParsedRow } from "@/extension/components/csv-dialog/types";

export const parseCSV = (text: string): ParsedRow[] => {
  const rows = text.split("\n");
  const items: ParsedRow[] = [];

  rows.forEach((row) => {
    const columns: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of row) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        columns.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    columns.push(current.trim());

    const prompt = columns[0]?.trim();
    const tool = columns[1]?.trim().toLowerCase();
    const imageField = columns[2]?.trim() || "";

    if (prompt && prompt.toLowerCase() !== "prompt") {
      const imageRefs = imageField
        ? imageField
            .split(/[|;]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      items.push({ prompt, tool: tool || undefined, imageRefs });
    }
  });

  return items;
};

export const downloadTemplate = (): void => {
  const csvContent = `Prompt,Type,Images
"A cyberpunk city at night with neon lights",image,
"A majestic dragon breathing fire",image,
"A cozy cabin in winter forest",image,https://example.com/cabin-ref.jpg
"Transform this photo into anime style",image,photo1.jpg
"Create variations of this logo",image,logo.png|sketch.png
"Multiple refs: combine these styles",image,style1.jpg;style2.jpg;style3.jpg
"Video of a sunset timelapse",video,
"Interactive canvas design",canvas,reference.png`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "nano_flow_batch_template.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getUnmatchedFiles = (
  parsedRows: ParsedRow[],
  imageMap: Map<string, string>
): string[] => {
  const unmatched: string[] = [];
  parsedRows.forEach((row) => {
    row.imageRefs.forEach((ref) => {
      if (!ref.startsWith("http://") && !ref.startsWith("https://") && !ref.startsWith("data:")) {
        if (!imageMap.has(ref.toLowerCase())) {
          if (!unmatched.includes(ref)) {
            unmatched.push(ref);
          }
        }
      }
    });
  });
  return unmatched;
};
