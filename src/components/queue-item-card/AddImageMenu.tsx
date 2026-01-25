import { Link, Paperclip, Upload } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

import { MAX_IMAGES_PER_CARD } from "./types";

interface AddImageMenuProps {
  images: string[] | undefined;
  isDark?: boolean;
  itemId: string;
  onUpdateImages: (id: string, images: string[]) => void;
}

export const AddImageMenu: React.FC<AddImageMenuProps> = ({ images, itemId, onUpdateImages }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentCount = images?.length ?? 0;

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES_PER_CARD - currentCount;
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
    setShowMenu(false);
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onUpdateImages(itemId, [...(images ?? []), urlInput.trim()]);
    setUrlInput("");
    setShowMenu(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        title={`Add files (${currentCount}/${MAX_IMAGES_PER_CARD})`}
        className="flex h-7 w-7 items-center justify-center rounded border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Paperclip size={12} />
      </button>

      {showMenu && (
        <div className="absolute bottom-full left-0 z-[9999] mb-2 w-56 rounded-lg border border-border bg-background p-2 shadow-xl">
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
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Upload size={14} />
              Upload files
            </button>
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex gap-1">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                placeholder="Paste image URL..."
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={handleAddUrl}
                disabled={!urlInput.trim()}
                className="rounded-md bg-primary px-2 py-1.5 text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Link size={12} />
              </button>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            {currentCount}/{MAX_IMAGES_PER_CARD} files
          </p>
        </div>
      )}
    </div>
  );
};
