import React, { useRef } from 'react';
import { FileText, Info, Download, Upload, X } from 'lucide-react';

interface CsvDialogProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onUpload: (items: Array<{ prompt: string; modifier?: string }>) => void;
}

export const CsvDialog: React.FC<CsvDialogProps> = ({ isOpen, isDark, onClose, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent =
      'Prompt,Template Modifier\nA cyberpunk city,hyper-realistic 8k resolution\nA majestic dragon,anime studio ghibli style\nA cozy cabin,winter forest background';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'nano_flow_template.csv');
    link.style.visibility = 'hidden';
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
      const rows = text.split('\n');
      const items: Array<{ prompt: string; modifier?: string }> = [];

      rows.forEach((row) => {
        const columns = row.split(',');
        const prompt = columns[0]?.trim();
        const modifier = columns[1]?.trim();

        if (prompt && prompt.toLowerCase() !== 'prompt') {
          items.push({ prompt, modifier });
        }
      });

      onUpload(items);
      onClose();
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2">
      <div
        className={`max-w-md w-full p-2 rounded-md border shadow-2xl ${
          isDark ? 'glass-panel border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-500" />
            <h2 className="text-sm font-black">Import Batch</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded-md transition-all"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-2 space-y-2">
          <div
            className={`p-2 rounded-md border text-[10px] leading-tight ${
              isDark
                ? 'bg-white/5 border-white/5 opacity-70'
                : 'bg-slate-50 border-slate-100'
            }`}
          >
            <div className="flex items-center gap-1 font-black uppercase tracking-widest mb-1">
              <Info size={10} /> CSV Guide
            </div>
            Format: Prompt, Modifiers (Optional).
          </div>
          <button
            onClick={downloadTemplate}
            className={`w-full p-2 rounded-md font-black text-xs flex items-center justify-center gap-2 border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <Download size={16} /> Get Template
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-black text-xs flex items-center justify-center gap-2 shadow-lg"
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

