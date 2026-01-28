import React, { useState } from "react";

import { QueueStatus } from "@/backend/types";
import { ActionButtons } from "@/extension/components/queue-item-card/ActionButtons";
import { CardFooter } from "@/extension/components/queue-item-card/CardFooter";
import { DragHandle } from "@/extension/components/queue-item-card/DragHandle";
import { ImageThumbnails } from "@/extension/components/queue-item-card/ImageThumbnails";
import { PromptDisplay } from "@/extension/components/queue-item-card/PromptDisplay";
import { PromptEditDialog } from "@/extension/components/queue-item-card/PromptEditDialog";
import { SelectionCheckbox } from "@/extension/components/queue-item-card/SelectionCheckbox";
import { StatusSection } from "@/extension/components/queue-item-card/StatusSection";

import type { PromptEditData } from "@/extension/components/queue-item-card/PromptEditDialog";
import type { QueueItemCardProps } from "@/extension/components/queue-item-card/types";

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
  dragHandleProps,
  isSelected = false,
  onToggleSelect,
  showCheckbox = false,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const isPending = item.status === QueueStatus.Pending;
  const isFailed = item.status === QueueStatus.Failed;

  const handleOpenEditDialog = () => {
    if (isPending && onEdit) {
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = (data: PromptEditData) => {
    if (onEdit) {
      onEdit(item.id, {
        prompt: data.prompt,
        mode: data.mode,
        tool: data.tool,
      });
    }
  };

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
            isEditing={isEditDialogOpen}
            onRemove={onRemove}
            onRetry={onRetry}
            onDuplicate={onDuplicate}
            onDuplicateWithAI={onDuplicateWithAI}
            onEdit={onEdit ? handleOpenEditDialog : undefined}
            onRunSingle={onRunSingle}
          />
        </div>

        <PromptDisplay
          prompt={item.originalPrompt}
          searchText={searchText}
          isDark={isDark}
          isPending={isPending}
          onEdit={onEdit ? handleOpenEditDialog : undefined}
        />

        <ImageThumbnails
          images={item.images}
          isDark={isDark}
          isPending={isPending}
          onUpdateImages={onUpdateImages}
          itemId={item.id}
        />

        <CardFooter item={item} />
      </div>

      <PromptEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEdit}
        initialPrompt={item.originalPrompt}
        initialMode={item.mode}
        initialTool={item.tool}
      />
    </div>
  );
};

export default QueueItemCard;
