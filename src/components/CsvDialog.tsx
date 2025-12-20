import { FileText, Info, Download, Upload, X } from "lucide-react";
import React, { useRef } from "react";

interface CsvDialogProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onUpload: (items: { prompt: string; modifier?: string }[]) => void;
}

export const CsvDialog: React.FC<CsvDialogProps> = ({ isOpen, isDark, onClose, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent =
      "Prompt,Template Modifier\nA cyberpunk city,hyper-realistic 8k resolution\nA majestic dragon,anime studio ghibli style\nA cozy cabin,winter forest background";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "nano_flow_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n");
      const items: { prompt: string; modifier?: string }[] = [];

      rows.forEach((row) => {
        const columns = row.split(",");
        const prompt = columns[0]?.trim();
        const modifier = columns[1]?.trim();

        if (prompt && prompt.toLowerCase() !== "prompt") {
          items.push({ prompt, modifier });
        }
      });

      onUpload(items);
      onClose();
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md">
      <div
        className={`w-full max-w-md rounded-md border p-2 shadow-2xl ${
          isDark ? "glass-panel border-white/10" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-500" />
            <h2 className="text-sm font-black">Import Batch</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 transition-all hover:bg-white/5">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-2 p-2">
          <div
            className={`rounded-md border p-2 text-[10px] leading-tight ${
              isDark ? "border-white/5 bg-white/5 opacity-70" : "border-slate-100 bg-slate-50"
            }`}
          >
            <div className="mb-1 flex items-center gap-1 font-black uppercase tracking-widest">
              <Info size={10} /> CSV Guide
            </div>
            Format: Prompt, Modifiers (Optional).
          </div>
          <button
            onClick={downloadTemplate}
            className={`flex w-full items-center justify-center gap-2 rounded-md border p-2 text-xs font-black ${
              isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
            }`}
          >
            <Download size={16} /> Get Template
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 p-2 text-xs font-black text-white shadow-lg hover:bg-blue-500"
          >
            <Upload size={16} /> Upload CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default CsvDialog;
