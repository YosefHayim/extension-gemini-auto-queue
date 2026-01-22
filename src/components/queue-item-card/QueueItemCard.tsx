import React, { useState, useEffect } from "react";

import { QueueStatus } from "@/types";

import { ActionButtons } from "./ActionButtons";
import { DragHandle } from "./DragHandle";
import { EditModeForm } from "./EditModeForm";
import { ImageThumbnails } from "./ImageThumbnails";
import { PromptDisplay } from "./PromptDisplay";
import { SelectionCheckbox } from "./SelectionCheckbox";
import { StatusSection } from "./StatusSection";
import { STATUS_BORDER_STYLES } from "./types";

import type { QueueItemCardProps } from "./types";

export const QueueItemCard: React.FC<QueueItemCardProps> = ({
  item,
  isDark,
  searchText = "",
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
    <div
      className={`group relative overflow-hidden rounded-lg border-l-[3px] transition-all duration-150 ${STATUS_BORDER_STYLES[item.status]} ${
        isDark
          ? "bg-slate-800/50 shadow-sm shadow-black/10 hover:bg-slate-800/70"
          : "bg-white shadow-sm shadow-slate-200/60 hover:shadow-md hover:shadow-slate-200/80"
      }`}
    >
      <div className="relative flex items-start gap-2 p-3">
        {(showCheckbox || isSelected) && (
          <SelectionCheckbox
            isSelected={isSelected}
            isDark={isDark}
            onToggle={() => onToggleSelect?.(item.id)}
          />
        )}

        <DragHandle isDark={isDark} dragHandleProps={dragHandleProps} />

        <div className="min-w-0 flex-1">
          <StatusSection item={item} isDark={isDark} />

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
    </div>
  );
};

export default QueueItemCard;
