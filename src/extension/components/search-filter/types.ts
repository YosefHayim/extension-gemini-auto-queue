import type { ContentType, GeminiMode, GeminiTool, QueueStatus } from "@/backend/types";

export interface SearchFilterProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  selectedTools: GeminiTool[];
  onToolsChange: (tools: GeminiTool[]) => void;
  selectedModes: GeminiMode[];
  onModesChange: (modes: GeminiMode[]) => void;
  selectedContentTypes: ContentType[];
  onContentTypesChange: (types: ContentType[]) => void;
  selectedStatuses: QueueStatus[];
  onStatusesChange: (statuses: QueueStatus[]) => void;
  isDark: boolean;
  totalItems: number;
  filteredCount: number;
}
