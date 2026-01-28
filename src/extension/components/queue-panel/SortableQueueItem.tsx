import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

import { QueueItemCard } from "@/extension/components/QueueItemCard";

import type { SortableQueueItemProps } from "@/extension/components/queue-panel/types";

export const SortableQueueItem: React.FC<SortableQueueItemProps> = ({
  item,
  isDark,
  searchText,
  queueNumber,
  onRemove,
  onRetry,
  onDuplicate,
  onDuplicateWithAI,
  onEdit,
  onRunSingle,
  onUpdateImages,
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
        queueNumber={queueNumber}
        onRemove={onRemove}
        onRetry={onRetry}
        onDuplicate={onDuplicate}
        onDuplicateWithAI={onDuplicateWithAI}
        onEdit={onEdit}
        onRunSingle={onRunSingle}
        onUpdateImages={onUpdateImages}
        dragHandleProps={{ ...attributes, ...listeners }}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        showCheckbox={showCheckbox}
      />
    </div>
  );
};
