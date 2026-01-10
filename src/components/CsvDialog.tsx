import { Download, FileText, FolderOpen, Image, Info, Link2, Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";

interface CsvDialogProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onUpload: (items: { prompt: string; tool?: string; images?: string[] }[]) => void;
}

interface ParsedRow {
  prompt: string;
  tool?: string;
  imageRefs: string[]; // URLs or filenames
}

export const CsvDialog: React.FC<CsvDialogProps> = ({ isOpen, isDark, onClose, onUpload }) => {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [imageMap, setImageMap] = useState<Map<string, string>>(new Map());
  const [step, setStep] = useState<"upload" | "images">("upload");

  const downloadTemplate = () => {
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

  const parseCSV = (text: string): ParsedRow[] => {
    const rows = text.split("\n");
    const items: ParsedRow[] = [];

    rows.forEach((row) => {
      const columns: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
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
        // Parse image references (separated by | or ;)
        const imageRefs = imageField
          ? imageField.split(/[|;]/).map((s) => s.trim()).filter(Boolean)
          : [];

        items.push({ prompt, tool: tool || undefined, imageRefs });
      }
    });

    return items;
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      setParsedRows(rows);

      // Check if any rows have local file references (not URLs)
      const hasLocalFiles = rows.some((row) =>
        row.imageRefs.some((ref) => !ref.startsWith("http://") && !ref.startsWith("https://") && !ref.startsWith("data:"))
      );

      if (hasLocalFiles) {
        setStep("images");
      } else {
        // All URLs, proceed directly
        finishUpload(rows, new Map());
      }
    };
    reader.readAsText(file);

    if (csvInputRef.current) {
      csvInputRef.current.value = "";
    }
  };

  const handleImageFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImageMap = new Map(imageMap);

    const readPromises = files.map((file) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target?.result as string;
          // Store by filename (case-insensitive matching)
          newImageMap.set(file.name.toLowerCase(), data);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(() => {
      setImageMap(newImageMap);
    });

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const finishUpload = (rows: ParsedRow[], imgMap: Map<string, string>) => {
    const items = rows.map((row) => {
      const images: string[] = [];

      row.imageRefs.forEach((ref) => {
        if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:")) {
          // URL - use as-is
          images.push(ref);
        } else {
          // Local file reference - look up in image map
          const data = imgMap.get(ref.toLowerCase());
          if (data) {
            images.push(data);
          }
        }
      });

      return {
        prompt: row.prompt,
        tool: row.tool,
        images: images.length > 0 ? images : undefined,
      };
    });

    onUpload(items);
    handleClose();
  };

  const handleClose = () => {
    setParsedRows([]);
    setImageMap(new Map());
    setStep("upload");
    onClose();
  };

  const getUnmatchedFiles = (): string[] => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md">
      <div
        className={`w-full max-w-lg rounded-md border p-2 shadow-2xl ${
          isDark ? "glass-panel border-white/10" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-500" />
            <h2 className="text-sm font-black">
              {step === "upload" ? "Import Batch" : "Attach Images"}
            </h2>
          </div>
          <button onClick={handleClose} className="rounded-md p-1 transition-all hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        {step === "upload" && (
          <div className="space-y-2 p-2">
            <div
              className={`rounded-md border p-3 text-[10px] leading-relaxed ${
                isDark ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50"
              }`}
            >
              <div className="mb-2 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest opacity-60">
                <Info size={10} /> CSV Format Guide
              </div>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="shrink-0 rounded bg-blue-500/20 px-1.5 py-0.5 text-[8px] font-bold text-blue-400">
                    Column A
                  </span>
                  <span>Prompt text (required)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 rounded bg-purple-500/20 px-1.5 py-0.5 text-[8px] font-bold text-purple-400">
                    Column B
                  </span>
                  <span>Tool type: image, video, canvas, research, learning, layout</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[8px] font-bold text-emerald-400">
                    Column C
                  </span>
                  <span>Image references (optional)</span>
                </div>
              </div>

              <div className="mt-3 space-y-1 border-t border-white/10 pt-2">
                <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-80">
                  <Image size={10} /> Image Reference Options:
                </div>
                <div className="ml-3 space-y-0.5 opacity-70">
                  <div className="flex items-center gap-1">
                    <Link2 size={8} />
                    <span>Cloud URL: https://example.com/image.jpg</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FolderOpen size={8} />
                    <span>Local file: photo.jpg (upload files in next step)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px]">📎</span>
                    <span>Multiple: image1.jpg|image2.jpg or image1.jpg;image2.jpg</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 rounded bg-amber-500/10 p-1.5 text-[9px] text-amber-400">
                Tip: Use quotes for prompts with commas. Example: "A red, blue, green design"
              </div>
            </div>

            <button
              onClick={downloadTemplate}
              className={`flex w-full items-center justify-center gap-2 rounded-md border p-2.5 text-xs font-black transition-all ${
                isDark
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <Download size={16} /> Download Template CSV
            </button>

            <button
              onClick={() => csvInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 p-2.5 text-xs font-black text-white shadow-lg transition-all hover:bg-blue-500"
            >
              <Upload size={16} /> Upload CSV File
            </button>

            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleCsvUpload}
            />
          </div>
        )}

        {step === "images" && (
          <div className="space-y-2 p-2">
            <div
              className={`rounded-md border p-3 ${
                isDark ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50"
              }`}
            >
              <div className="mb-2 text-[10px] font-bold">
                Found {parsedRows.length} prompts with local image references
              </div>

              {getUnmatchedFiles().length > 0 ? (
                <div className="space-y-1">
                  <div className="text-[9px] font-bold text-amber-400">
                    Missing images ({getUnmatchedFiles().length}):
                  </div>
                  <div className="max-h-[100px] overflow-auto rounded bg-black/20 p-2">
                    {getUnmatchedFiles().map((file, i) => (
                      <div key={i} className="text-[9px] text-red-400">
                        • {file}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[9px] text-emerald-400">
                  All image references matched ({imageMap.size} images loaded)
                </div>
              )}
            </div>

            <button
              onClick={() => imageInputRef.current?.click()}
              className={`flex w-full items-center justify-center gap-2 rounded-md border p-2.5 text-xs font-black transition-all ${
                isDark
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <FolderOpen size={16} />
              {imageMap.size > 0 ? `Add More Images (${imageMap.size} loaded)` : "Select Image Files"}
            </button>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageFilesUpload}
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep("upload");
                  setParsedRows([]);
                  setImageMap(new Map());
                }}
                className={`flex-1 rounded-md border p-2 text-xs font-black ${
                  isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                }`}
              >
                Back
              </button>
              <button
                onClick={() => finishUpload(parsedRows, imageMap)}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 p-2 text-xs font-black text-white shadow-lg transition-all hover:bg-blue-500"
              >
                <Upload size={14} />
                Import {parsedRows.length} Prompts
              </button>
            </div>

            {getUnmatchedFiles().length > 0 && (
              <div className="text-center text-[9px] opacity-50">
                Prompts with missing images will be imported without attachments
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CsvDialog;
