import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React from "react";

import { SortableQueueItem } from "@/extension/components/queue-panel/SortableQueueItem";

import type { QueueItem, QueueStatus } from "@/backend/types";
import type { QueueItemEditData } from "@/extension/components/queue-item-card/types";

interface QueueListProps {
  queue: QueueItem[];
  filteredQueue: QueueItem[];
  isDark: boolean;
  searchText: string;
  hasSelection: boolean;
  selectedIds: Set<string>;
  onRemoveFromQueue: (id: string) => void;
  onRetryQueueItem: (id: string) => void;
  onDuplicateItem: (id: string) => void;
  onDuplicateWithAI: (id: string) => void;
  onEditItem?: (id: string, data: QueueItemEditData) => void;
  onRunSingleItem?: (id: string) => void;
  onUpdateItemImages?: (id: string, images: string[]) => void;
  onReorderQueue: (newQueue: QueueItem[]) => void;
  onToggleSelect: (id: string) => void;
  pendingStatus: QueueStatus;
}

export const QueueList: React.FC<QueueListProps> = ({
  queue,
  filteredQueue,
  isDark,
  searchText,
  hasSelection,
  selectedIds,
  onRemoveFromQueue,
  onRetryQueueItem,
  onDuplicateItem,
  onDuplicateWithAI,
  onEditItem,
  onRunSingleItem,
  onUpdateItemImages,
  onReorderQueue,
  onToggleSelect,
  pendingStatus,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex((item) => item.id === active.id);
      const newIndex = queue.findIndex((item) => item.id === over.id);
      const newQueue = arrayMove(queue, oldIndex, newIndex);
      onReorderQueue(newQueue);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={filteredQueue.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {filteredQueue.map((item) => {
            const queueNumber = queue.findIndex((q) => q.id === item.id) + 1;
            return (
              <SortableQueueItem
                key={item.id}
                item={item}
                isDark={isDark}
                searchText={searchText}
                queueNumber={queueNumber}
                onRemove={onRemoveFromQueue}
                onRetry={onRetryQueueItem}
                onDuplicate={onDuplicateItem}
                onDuplicateWithAI={onDuplicateWithAI}
                onEdit={onEditItem}
                onRunSingle={onRunSingleItem}
                onUpdateImages={onUpdateItemImages}
                isSelected={selectedIds.has(item.id)}
                onToggleSelect={onToggleSelect}
                showCheckbox={hasSelection || item.status === pendingStatus}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};
