import { useMemo } from "react";

import {
  ContentType,
  type GeminiMode,
  type GeminiTool,
  type QueueItem,
  type QueueStatus,
} from "@/types";

export interface QueueFiltersState {
  searchText: string;
  selectedToolFilters: GeminiTool[];
  selectedModeFilters: GeminiMode[];
  selectedContentFilters: ContentType[];
  selectedStatusFilters: QueueStatus[];
}

export function useFilteredQueue(queue: QueueItem[], filters: QueueFiltersState): QueueItem[] {
  const {
    searchText,
    selectedToolFilters,
    selectedModeFilters,
    selectedContentFilters,
    selectedStatusFilters,
  } = filters;

  return useMemo(() => {
    return queue.filter((item) => {
      if (searchText && !item.originalPrompt.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      if (selectedToolFilters.length > 0 && item.tool && !selectedToolFilters.includes(item.tool)) {
        return false;
      }
      if (selectedModeFilters.length > 0 && item.mode && !selectedModeFilters.includes(item.mode)) {
        return false;
      }
      if (selectedContentFilters.length > 0) {
        const hasText = item.originalPrompt.trim().length > 0;
        const hasImages = item.images && item.images.length > 0;

        const matchesFilter = selectedContentFilters.some((filter) => {
          switch (filter) {
            case ContentType.TextOnly:
              return hasText && !hasImages;
            case ContentType.WithImages:
              return hasImages;
            case ContentType.TextAndImages:
              return hasText && hasImages;
            default:
              return true;
          }
        });

        if (!matchesFilter) return false;
      }
      if (selectedStatusFilters.length > 0 && !selectedStatusFilters.includes(item.status)) {
        return false;
      }
      return true;
    });
  }, [
    queue,
    searchText,
    selectedToolFilters,
    selectedModeFilters,
    selectedContentFilters,
    selectedStatusFilters,
  ]);
}

export function usePromptPreviewCount(bulkInput: string): number {
  return useMemo(() => {
    if (!bulkInput.trim()) return 0;
    const numberedPattern = /^(?:Prompt\s+)?\d+[.:)]\s+/i;
    const newlineSplit = bulkInput.split(/\n/);
    const lines = newlineSplit.flatMap((line) => {
      const trimmed = line.trim();
      if (!trimmed) return [];
      if (numberedPattern.test(trimmed)) return [trimmed];
      const hasMultipleCommas = (trimmed.match(/,/g) ?? []).length > 1;
      const commaBeforeCapital = /,\s+[A-Z]/;
      if (hasMultipleCommas && commaBeforeCapital.test(trimmed)) {
        return trimmed
          .split(/,\s+(?=[A-Z])/)
          .map((item) => item.trim())
          .filter((item) => item !== "");
      }
      return [trimmed];
    });
    return lines.length;
  }, [bulkInput]);
}
