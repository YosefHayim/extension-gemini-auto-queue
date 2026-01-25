import { Download, Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";

import { parseCSV, downloadTemplate, getUnmatchedFiles } from "./utils";

import type { CsvDialogProps, CsvStep, ParsedRow } from "./types";

export const CsvDialog: React.FC<CsvDialogProps> = ({ isOpen, onClose, onUpload }) => {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [imageMap, setImageMap] = useState<Map<string, string>>(new Map());
  const [step, setStep] = useState<CsvStep>("upload");

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      setParsedRows(rows);

      const hasLocalFiles = rows.some((row) =>
        row.imageRefs.some(
          (ref) =>
            !ref.startsWith("http://") && !ref.startsWith("https://") && !ref.startsWith("data:")
        )
      );

      if (hasLocalFiles) {
        setStep("images");
      } else {
        finishUpload(rows, new Map());
      }
    };
    reader.readAsText(file);

    if (csvInputRef.current) {
      csvInputRef.current.value = "";
    }
  };

  const handleImageFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newImageMap = new Map(imageMap);

    const readPromises = files.map((file) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target?.result as string;
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
          images.push(ref);
        } else {
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

  const handleBack = () => {
    setStep("upload");
    setParsedRows([]);
    setImageMap(new Map());
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const unmatchedFiles = getUnmatchedFiles(parsedRows, imageMap);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-[400px] rounded-lg border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">
              {step === "upload" ? "Import CSV" : "Attach Images"}
            </h2>
            <p className="text-[13px] text-muted-foreground">
              {step === "upload"
                ? "Upload a CSV file to bulk import prompts"
                : `Match ${unmatchedFiles.length} missing image files`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {step === "upload" ? (
            <>
              <button
                onClick={() => csvInputRef.current?.click()}
                className="flex h-[140px] flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border bg-muted transition-colors hover:border-muted-foreground"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
                  <Upload size={24} className="text-muted-foreground" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-medium text-foreground">
                    Drop your CSV file here
                  </span>
                  <span className="text-[13px] text-muted-foreground">or click to browse</span>
                </div>
              </button>

              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-semibold text-foreground">CSV Format</span>
                <div className="flex flex-col gap-2 rounded-md bg-muted p-3">
                  <code className="font-mono text-xs text-foreground">Prompt,Type,Images</code>
                  <code className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                    "A cyberpunk city",image,ref1.jpg
                    <br />
                    "Transform this photo",image,photo.jpg|mask.png
                  </code>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-semibold text-foreground">Preview</span>
                <div className="overflow-hidden rounded-md border border-border">
                  <div className="flex gap-2 bg-muted px-2.5 py-2">
                    <span className="text-[11px] font-semibold text-muted-foreground">prompt</span>
                    <span className="text-[11px] font-semibold text-muted-foreground">tool</span>
                    <span className="text-[11px] font-semibold text-muted-foreground">model</span>
                    <span className="text-[11px] font-semibold text-muted-foreground">images</span>
                  </div>
                  <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                    No data yet
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-semibold text-foreground">
                  Found {parsedRows.length} prompts with local image references
                </span>

                {unmatchedFiles.length > 0 ? (
                  <div className="max-h-[120px] overflow-auto rounded-md border border-destructive/30 bg-destructive/10 p-3">
                    <div className="mb-2 text-xs font-semibold text-destructive">
                      Missing images ({unmatchedFiles.length}):
                    </div>
                    {unmatchedFiles.map((file, i) => (
                      <div key={i} className="text-[11px] text-destructive">
                        • {file}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
                    All image references matched ({imageMap.size} images loaded)
                  </div>
                )}
              </div>

              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex h-[100px] flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted transition-colors hover:border-muted-foreground"
              >
                <Upload size={20} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {imageMap.size > 0
                    ? `Add More Images (${imageMap.size} loaded)`
                    : "Select Image Files"}
                </span>
              </button>

              {unmatchedFiles.length > 0 && (
                <p className="text-center text-[11px] text-muted-foreground">
                  Prompts with missing images will be imported without attachments
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border p-5">
          {step === "upload" ? (
            <>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Download size={16} />
                Download Template
              </button>
              <button
                onClick={handleClose}
                className="rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                className="rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={() => finishUpload(parsedRows, imageMap)}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Download size={16} />
                Import {parsedRows.length} prompts
              </button>
            </>
          )}
        </div>

        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={handleCsvUpload}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageFilesUpload}
        />
      </div>
    </div>
  );
};

export default CsvDialog;

export type { CsvDialogProps } from "./types";
