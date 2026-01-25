import { FileText, X } from "lucide-react";
import React, { useRef, useState } from "react";

import { ImagesStep } from "./ImagesStep";
import { UploadStep } from "./UploadStep";
import { parseCSV, downloadTemplate, getUnmatchedFiles } from "./utils";

import type { CsvDialogProps, CsvStep, ParsedRow } from "./types";

export const CsvDialog: React.FC<CsvDialogProps> = ({ isOpen, isDark, onClose, onUpload }) => {
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
    const files = Array.from(e.target.files || []);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md">
      <div
        className={`w-full max-w-lg rounded-md border p-2 shadow-2xl ${
          isDark ? "glass-panel border-border" : "border-border bg-background"
        }`}
      >
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            <h2 className="text-sm font-black text-foreground">
              {step === "upload" ? "Import Batch" : "Attach Images"}
            </h2>
          </div>
          <button onClick={handleClose} className="rounded-md p-1 transition-all hover:bg-muted">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {step === "upload" && (
          <UploadStep
            isDark={isDark}
            csvInputRef={csvInputRef}
            onDownloadTemplate={downloadTemplate}
            onCsvUpload={handleCsvUpload}
          />
        )}

        {step === "images" && (
          <ImagesStep
            isDark={isDark}
            parsedRows={parsedRows}
            imageMap={imageMap}
            imageInputRef={imageInputRef}
            unmatchedFiles={getUnmatchedFiles(parsedRows, imageMap)}
            onBack={handleBack}
            onFinish={() => finishUpload(parsedRows, imageMap)}
            onImageFilesUpload={handleImageFilesUpload}
          />
        )}
      </div>
    </div>
  );
};

export default CsvDialog;

export type { CsvDialogProps } from "./types";
