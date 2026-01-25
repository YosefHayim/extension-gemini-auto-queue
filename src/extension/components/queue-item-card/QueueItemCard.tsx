import React, { useState, useEffect } from "react";

import { QueueStatus } from "@/backend/types";

import { ActionButtons } from "./ActionButtons";
import { CardFooter } from "./CardFooter";
import { DragHandle } from "./DragHandle";
import { EditModeForm } from "./EditModeForm";
import { ImageThumbnails } from "./ImageThumbnails";
import { PromptDisplay } from "./PromptDisplay";
import { SelectionCheckbox } from "./SelectionCheckbox";
import { StatusSection } from "./StatusSection";

import type { QueueItemCardProps } from "./types";

export const QueueItemCard: React.FC<QueueItemCardProps> = ({
  item,
  isDark,
  searchText = "",
  queueNumber,
  onRemove,
  onRetry,
  onDuplicate,
  onDuplicateWithAI,
  onEdit,
  onRunSingle,
  onUpdateImages,
  isEditing = false,
  dragHandleProps,
  isSelected = false,
  onToggleSelect,
  showCheckbox = false,
}) => {
  const [editValue, setEditValue] = useState(item.originalPrompt);

  useEffect(() => {
    setEditValue(item.originalPrompt);
  }, [item.originalPrompt]);

  const handleEditSubmit = () => {
    if (onEdit) {
      onEdit(item.id, editValue.trim());
    }
  };

  const handleEditCancel = () => {
    setEditValue(item.originalPrompt);
    if (onEdit) {
      onEdit(item.id, item.originalPrompt);
    }
  };

  const isPending = item.status === QueueStatus.Pending;
  const isFailed = item.status === QueueStatus.Failed;

  return (
    <div className="group relative overflow-hidden rounded-md border border-border bg-background">
      <div className="flex flex-col gap-2.5 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(showCheckbox || isSelected) && (
              <SelectionCheckbox
                isSelected={isSelected}
                isDark={isDark}
                onToggle={() => onToggleSelect?.(item.id)}
              />
            )}
            <DragHandle isDark={isDark} dragHandleProps={dragHandleProps} />
            <StatusSection item={item} queueNumber={queueNumber} />
          </div>

          <ActionButtons
            itemId={item.id}
            isDark={isDark}
            isPending={isPending}
            isFailed={isFailed}
            isEditing={isEditing}
            onRemove={onRemove}
            onRetry={onRetry}
            onDuplicate={onDuplicate}
            onDuplicateWithAI={onDuplicateWithAI}
            onEdit={onEdit}
            onRunSingle={onRunSingle}
            originalPrompt={item.originalPrompt}
          />
        </div>

        {isEditing && isPending ? (
          <EditModeForm
            value={editValue}
            onChange={setEditValue}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
            isDark={isDark}
          />
        ) : (
          <PromptDisplay
            prompt={item.originalPrompt}
            searchText={searchText}
            isDark={isDark}
            isPending={isPending}
            onEdit={onEdit}
            itemId={item.id}
          />
        )}

        <ImageThumbnails
          images={item.images}
          isDark={isDark}
          isPending={isPending}
          onUpdateImages={onUpdateImages}
          itemId={item.id}
        />

        <CardFooter item={item} />
      </div>
    </div>
  );
};

export default QueueItemCard;
