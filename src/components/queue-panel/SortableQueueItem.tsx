import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

import { QueueItemCard } from "../QueueItemCard";

import type { SortableQueueItemProps } from "./types";

export const SortableQueueItem: React.FC<SortableQueueItemProps> = ({
  item,
  isDark,
  searchText,
  onRemove,
  onRetry,
  onDuplicate,
  onDuplicateWithAI,
  onEdit,
  onRunSingle,
  onUpdateImages,
  isEditing,
  isSelected,
  onToggleSelect,
  showCheckbox,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QueueItemCard
        item={item}
        isDark={isDark}
        searchText={searchText}
        onRemove={onRemove}
        onRetry={onRetry}
        onDuplicate={onDuplicate}
        onDuplicateWithAI={onDuplicateWithAI}
        onEdit={onEdit}
        onRunSingle={onRunSingle}
        onUpdateImages={onUpdateImages}
        isEditing={isEditing}
        dragHandleProps={{ ...attributes, ...listeners }}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        showCheckbox={showCheckbox}
      />
    </div>
  );
};
