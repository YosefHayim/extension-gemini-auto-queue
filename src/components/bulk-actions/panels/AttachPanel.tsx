import { File, Paperclip, X } from "lucide-react";
import React from "react";
import { BackButton } from "../BackButton";
import type { AttachPanelProps } from "../types";

export const AttachPanel: React.FC<AttachPanelProps> = ({
  isDark,
  onBack,
  selectedFiles,
  setSelectedFiles,
  fileInputRef,
  onFileUpload,
}) => {
  return (
    <div className="space-y-4">
      <BackButton isDark={isDark} onClick={onBack} />

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-all ${
          isDark
            ? "border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800"
            : "border-slate-300 hover:border-indigo-500/50 hover:bg-slate-50"
        }`}
      >
        <Paperclip size={24} className={isDark ? "text-slate-500" : "text-slate-400"} />
        <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Click to select files (images, videos, etc.)
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={onFileUpload}
      />

      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="relative">
              {file.type.startsWith("image/") ? (
                <img
                  src={file.data}
                  className="h-12 w-12 rounded-lg object-cover"
                  alt={file.name}
                />
              ) : file.type.startsWith("video/") ? (
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                >
                  <span className="text-[10px] font-bold text-blue-500">VID</span>
                </div>
              ) : (
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                >
                  <File size={16} className={isDark ? "text-slate-400" : "text-slate-500"} />
                </div>
              )}
              <button
                onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
