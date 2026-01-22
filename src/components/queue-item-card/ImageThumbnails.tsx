import { File, Link, Paperclip, Upload, X } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

import { MAX_IMAGES_PER_CARD } from "./types";

interface ImageThumbnailsProps {
  images: string[] | undefined;
  isDark: boolean;
  isPending: boolean;
  onUpdateImages?: (id: string, images: string[]) => void;
  itemId: string;
}

export const ImageThumbnails: React.FC<ImageThumbnailsProps> = ({
  images,
  isDark,
  isPending,
  onUpdateImages,
  itemId,
}) => {
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageMenuRef = useRef<HTMLDivElement>(null);

  const currentImageCount = images?.length ?? 0;
  const canAddMoreImages = currentImageCount < MAX_IMAGES_PER_CARD;
  const hasImages = images && images.length > 0;
  const displayedImages = hasImages ? images.slice(0, 5) : [];
  const remainingImagesCount = hasImages && images.length > 5 ? images.length - 5 : 0;

  useEffect(() => {
    if (!showImageMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (imageMenuRef.current && !imageMenuRef.current.contains(event.target as Node)) {
        setShowImageMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showImageMenu]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || !onUpdateImages) return;

    const remainingSlots = MAX_IMAGES_PER_CARD - currentImageCount;
    const filesToProcess = files.slice(0, remainingSlots);

    const readPromises = filesToProcess.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readPromises).then((newImages) => {
      onUpdateImages(itemId, [...(images ?? []), ...newImages]);
    });

    e.target.value = "";
    setShowImageMenu(false);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim() || !onUpdateImages || !canAddMoreImages) return;
    onUpdateImages(itemId, [...(images ?? []), imageUrlInput.trim()]);
    setImageUrlInput("");
    setShowImageMenu(false);
  };

  const handleRemoveImage = (index: number) => {
    if (!onUpdateImages) return;
    const newImages = [...(images ?? [])];
    newImages.splice(index, 1);
    onUpdateImages(itemId, newImages);
  };

  if (!hasImages && !(isPending && onUpdateImages)) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1">
      {displayedImages.map((img, idx) => {
        const isImage =
          img.startsWith("data:image/") || img.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
        const isVideo = img.startsWith("data:video/") || img.match(/\.(mp4|webm|mov|avi)$/i);
        return (
          <div
            key={idx}
            className={`group/img relative overflow-hidden rounded transition-transform hover:scale-105 ${isDark ? "ring-1 ring-slate-600" : "ring-1 ring-slate-200"}`}
          >
            {isImage ? (
              <img src={img} alt={`Reference ${idx + 1}`} className="h-7 w-7 object-cover" />
            ) : isVideo ? (
              <div
                className={`flex h-7 w-7 items-center justify-center ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
              >
                <span className="text-[8px] font-bold text-blue-500">VID</span>
              </div>
            ) : (
              <div
                className={`flex h-7 w-7 items-center justify-center ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
              >
                <File size={12} className={isDark ? "text-slate-400" : "text-slate-500"} />
              </div>
            )}
            {isPending && onUpdateImages && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(idx);
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover/img:opacity-100"
              >
                <X size={10} className="text-white" />
              </button>
            )}
          </div>
        );
      })}
      {remainingImagesCount > 0 && (
        <div
          className={`flex h-7 w-7 items-center justify-center rounded text-[9px] font-bold ${isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}
        >
          +{remainingImagesCount}
        </div>
      )}
      {isPending && onUpdateImages && canAddMoreImages && (
        <div ref={imageMenuRef} className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowImageMenu(!showImageMenu);
            }}
            title={`Add files (${currentImageCount}/${MAX_IMAGES_PER_CARD})`}
            className={`flex h-7 w-7 items-center justify-center rounded border border-dashed transition-colors ${
              isDark
                ? "border-slate-600 text-slate-500 hover:border-indigo-500 hover:text-indigo-400"
                : "border-slate-300 text-slate-400 hover:border-indigo-500 hover:text-indigo-500"
            }`}
          >
            <Paperclip size={12} />
          </button>

          {showImageMenu && (
            <div
              className={`absolute bottom-full left-0 z-[9999] mb-2 w-56 rounded-lg border p-2 shadow-xl ${
                isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                    isDark
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Upload size={14} />
                  Upload files
                </button>
              </div>
              <div className={`border-t pt-2 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddImageUrl()}
                    placeholder="Paste image URL..."
                    className={`flex-1 rounded-md border px-2 py-1.5 text-xs outline-none ${
                      isDark
                        ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                        : "border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400"
                    }`}
                  />
                  <button
                    onClick={handleAddImageUrl}
                    disabled={!imageUrlInput.trim()}
                    className={`rounded-md px-2 py-1.5 transition-colors disabled:opacity-50 ${
                      isDark
                        ? "bg-indigo-600 text-white hover:bg-indigo-500"
                        : "bg-indigo-500 text-white hover:bg-indigo-600"
                    }`}
                  >
                    <Link size={12} />
                  </button>
                </div>
              </div>
              <p className={`mt-2 text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {currentImageCount}/{MAX_IMAGES_PER_CARD} files
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
