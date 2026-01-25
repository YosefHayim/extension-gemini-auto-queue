import { File, X } from "lucide-react";
import React from "react";

import { AddImageMenu } from "./AddImageMenu";
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
  const currentImageCount = images?.length ?? 0;
  const canAddMoreImages = currentImageCount < MAX_IMAGES_PER_CARD;
  const hasImages = images && images.length > 0;
  const displayedImages = hasImages ? images.slice(0, 5) : [];
  const remainingImagesCount = hasImages && images.length > 5 ? images.length - 5 : 0;

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
          img.startsWith("data:image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.exec(img);
        const isVideo = img.startsWith("data:video/") || /\.(mp4|webm|mov|avi)$/i.exec(img);
        return (
          <div
            key={idx}
            className="group/img relative overflow-hidden rounded ring-1 ring-border transition-transform hover:scale-105"
          >
            {isImage ? (
              <img src={img} alt={`Reference ${idx + 1}`} className="h-7 w-7 object-cover" />
            ) : isVideo ? (
              <div className="flex h-7 w-7 items-center justify-center bg-secondary">
                <span className="text-[8px] font-bold text-blue-500">VID</span>
              </div>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center bg-secondary">
                <File size={12} className="text-muted-foreground" />
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
        <div className="flex h-7 w-7 items-center justify-center rounded bg-secondary text-[9px] font-bold text-muted-foreground">
          +{remainingImagesCount}
        </div>
      )}
      {isPending && onUpdateImages && canAddMoreImages && (
        <AddImageMenu
          images={images}
          isDark={isDark}
          itemId={itemId}
          onUpdateImages={onUpdateImages}
        />
      )}
    </div>
  );
};
