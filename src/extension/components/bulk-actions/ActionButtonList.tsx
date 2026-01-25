import React from "react";

import { ActionButton } from "@/extension/components/bulk-actions/ActionButton";
import { getActionButtonConfigs } from "@/extension/components/bulk-actions/actionButtonConfigs";

import type { BulkActionType, ChatMediaCounts } from "@/extension/components/bulk-actions/types";

interface ActionButtonListProps {
  isDark: boolean;
  hasApiKey: boolean;
  pendingCount: number;
  totalCount: number;
  resettableCount: number;
  allUniqueImagesCount: number;
  chatMediaCounts: ChatMediaCounts | null;
  copySuccess: boolean;
  onDownloadChatMedia?: boolean;
  onActionSelect: (type: Exclude<BulkActionType, null>) => void;
  onCopyAll: () => void;
}

export const ActionButtonList: React.FC<ActionButtonListProps> = ({
  isDark: _isDark,
  hasApiKey,
  pendingCount,
  totalCount,
  resettableCount,
  allUniqueImagesCount,
  chatMediaCounts,
  copySuccess,
  onDownloadChatMedia,
  onActionSelect,
  onCopyAll,
}) => {
  const actionButtons = getActionButtonConfigs({
    hasApiKey,
    pendingCount,
    totalCount,
    resettableCount,
    allUniqueImagesCount,
    chatMediaCounts,
    onDownloadChatMedia,
  });

  const handleActionSelect = (type: Exclude<BulkActionType, null>) => {
    if (type === "copy") {
      onCopyAll();
    } else {
      onActionSelect(type);
    }
  };

  return (
    <div className="h-[300px] space-y-2 overflow-y-auto">
      {actionButtons.map((action) => (
        <ActionButton
          key={action.type}
          action={action}
          copySuccess={copySuccess}
          onSelect={() => handleActionSelect(action.type)}
        />
      ))}
    </div>
  );
};
