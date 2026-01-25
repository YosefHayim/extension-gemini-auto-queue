import { useEffect, useMemo, useRef, useState } from "react";

import {
  type ContentType,
  type GeminiMode,
  GeminiTool,
  QueueStatus,
  type QueueItem,
} from "@/backend/types";

import { useFilteredQueue, usePromptPreviewCount } from "./useQueueFilters";
import { useQueueStats } from "./useQueueStats";

import type { TextSelection } from "../types";

interface UseQueuePanelStateProps {
  queue: QueueItem[];
  defaultTool?: GeminiTool;
  selectedMode: GeminiMode;
  onModeChange?: (mode: GeminiMode) => void;
  onAddToQueue: (
    text?: string,
    templateText?: string,
    images?: string[],
    tool?: GeminiTool,
    mode?: GeminiMode
  ) => void;
}

export function useQueuePanelState({
  queue,
  defaultTool,
  selectedMode,
  onModeChange,
  onAddToQueue,
}: UseQueuePanelStateProps) {
  const [bulkInput, setBulkInput] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [selectedTool, setSelectedTool] = useState<GeminiTool>(defaultTool ?? GeminiTool.IMAGE);
  const [localSelectedMode, setLocalSelectedMode] = useState<GeminiMode>(selectedMode);

  const [searchText, setSearchText] = useState("");
  const [selectedToolFilters, setSelectedToolFilters] = useState<GeminiTool[]>([]);
  const [selectedModeFilters, setSelectedModeFilters] = useState<GeminiMode[]>([]);
  const [selectedContentFilters, setSelectedContentFilters] = useState<ContentType[]>([]);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<QueueStatus[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stats = useQueueStats(queue);

  const filteredQueue = useFilteredQueue(queue, {
    searchText,
    selectedToolFilters,
    selectedModeFilters,
    selectedContentFilters,
    selectedStatusFilters,
  });

  const promptPreviewCount = usePromptPreviewCount(bulkInput);

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;

  const selectedItems = useMemo(() => {
    return queue.filter((item) => selectedIds.has(item.id));
  }, [queue, selectedIds]);

  const selectedPendingItems = useMemo(() => {
    return selectedItems.filter((item) => item.status === QueueStatus.Pending);
  }, [selectedItems]);

  useEffect(() => {
    if (defaultTool) {
      setSelectedTool(defaultTool);
    }
  }, [defaultTool]);

  useEffect(() => {
    setLocalSelectedMode(selectedMode);
  }, [selectedMode]);

  useEffect(() => {
    if (queue.length > 0) {
      const toolTypes = queue
        .map((item) => item.tool)
        .filter((tool): tool is GeminiTool => tool !== undefined);

      if (toolTypes.length > 0) {
        const firstTool = toolTypes[0];
        const allSameTool = toolTypes.every((tool) => tool === firstTool);
        if (allSameTool) {
          setSelectedTool(firstTool);
        }
      }
    }
  }, [queue]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const pendingIds = filteredQueue
      .filter((item) => item.status === QueueStatus.Pending)
      .map((item) => item.id);
    setSelectedIds(new Set(pendingIds));
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleModeSelect = (mode: GeminiMode) => {
    setLocalSelectedMode(mode);
    onModeChange?.(mode);
  };

  const handleEnqueue = () => {
    onAddToQueue(bulkInput, undefined, selectedImages, selectedTool, localSelectedMode);
    setBulkInput("");
    setSelectedImages([]);
  };

  return {
    bulkInput,
    setBulkInput,
    selectedImages,
    setSelectedImages,
    selection,
    setSelection,
    selectedTool,
    setSelectedTool,
    localSelectedMode,
    searchText,
    setSearchText,
    selectedToolFilters,
    setSelectedToolFilters,
    selectedModeFilters,
    setSelectedModeFilters,
    selectedContentFilters,
    setSelectedContentFilters,
    selectedStatusFilters,
    setSelectedStatusFilters,
    showBulkActions,
    setShowBulkActions,
    selectedIds,
    textareaRef,
    stats,
    filteredQueue,
    promptPreviewCount,
    selectedCount,
    hasSelection,
    selectedItems,
    selectedPendingItems,
    handleToggleSelect,
    handleSelectAll,
    handleClearSelection,
    handleModeSelect,
    handleEnqueue,
  };
}
