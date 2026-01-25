import { X } from "lucide-react";
import React from "react";

interface ImagePreviewProps {
  images: string[];
  onRemoveImage: (index: number) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemoveImage }) => {
  if (images.length === 0) return null;

  return (
    <div className="no-scrollbar absolute bottom-1 left-1 flex max-w-[160px] gap-1 overflow-x-auto rounded-md bg-black/60 p-1">
      {images.map((img, idx) => (
        <div key={idx} className="relative shrink-0">
          <img src={img} className="h-8 w-8 rounded-md object-cover" alt="ref" />
          <button
            onClick={() => {
              onRemoveImage(idx);
            }}
            title="Remove image"
            className="absolute -right-1 -top-1 rounded-md bg-red-600 p-0.5 text-white"
          >
            <X size={6} />
          </button>
        </div>
      ))}
    </div>
  );
};
