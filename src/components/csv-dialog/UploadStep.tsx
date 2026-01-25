import { Download, FolderOpen, Image, Info, Link2, Upload } from "lucide-react";
import React from "react";

interface UploadStepProps {
  isDark: boolean;
  csvInputRef: React.RefObject<HTMLInputElement>;
  onDownloadTemplate: () => void;
  onCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  isDark,
  csvInputRef,
  onDownloadTemplate,
  onCsvUpload,
}) => {
  return (
    <div className="space-y-2 p-2">
      <div
        className={`rounded-md border border-border p-3 text-[10px] leading-relaxed ${
          isDark ? "bg-muted" : "bg-muted"
        }`}
      >
        <div className="mb-2 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
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

        <div className="mt-3 space-y-1 border-t border-border pt-2">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-foreground">
            <Image size={10} /> Image Reference Options:
          </div>
          <div className="ml-3 space-y-0.5 text-muted-foreground">
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

        <div className="mt-2 rounded bg-amber-500/10 p-1.5 text-[9px] text-amber-600 dark:text-amber-400">
          Tip: Use quotes for prompts with commas. Example: "A red, blue, green design"
        </div>
      </div>

      <button
        onClick={onDownloadTemplate}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-muted p-2.5 text-xs font-black text-foreground transition-all hover:bg-muted/80"
      >
        <Download size={16} /> Download Template CSV
      </button>

      <button
        onClick={() => csvInputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary p-2.5 text-xs font-black text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
      >
        <Upload size={16} /> Upload CSV File
      </button>

      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,.txt"
        className="hidden"
        onChange={onCsvUpload}
      />
    </div>
  );
};
