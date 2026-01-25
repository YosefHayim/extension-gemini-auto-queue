import { ChevronDown, Filter, X } from "lucide-react";
import React, { useState } from "react";

import { FilterPanel } from "./FilterPanel";
import { SearchInput } from "./SearchInput";

import type { SearchFilterProps } from "./types";
import type { ContentType, GeminiMode, GeminiTool, QueueStatus } from "@/backend/types";

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchText,
  onSearchChange,
  selectedTools,
  onToolsChange,
  selectedModes,
  onModesChange,
  selectedContentTypes,
  onContentTypesChange,
  selectedStatuses,
  onStatusesChange,
  isDark,
  totalItems,
  filteredCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    searchText.length > 0 ||
    selectedTools.length > 0 ||
    selectedModes.length > 0 ||
    selectedContentTypes.length > 0 ||
    selectedStatuses.length > 0;
  const isFiltered = filteredCount !== totalItems;

  const handleToolToggle = (tool: GeminiTool) => {
    if (selectedTools.includes(tool)) {
      onToolsChange(selectedTools.filter((t) => t !== tool));
    } else {
      onToolsChange([...selectedTools, tool]);
    }
  };

  const handleModeToggle = (mode: GeminiMode) => {
    if (selectedModes.includes(mode)) {
      onModesChange(selectedModes.filter((m) => m !== mode));
    } else {
      onModesChange([...selectedModes, mode]);
    }
  };

  const handleContentTypeToggle = (type: ContentType) => {
    if (selectedContentTypes.includes(type)) {
      onContentTypesChange(selectedContentTypes.filter((t) => t !== type));
    } else {
      onContentTypesChange([...selectedContentTypes, type]);
    }
  };

  const handleStatusToggle = (status: QueueStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusesChange([...selectedStatuses, status]);
    }
  };

  const handleClearAll = () => {
    onSearchChange("");
    onToolsChange([]);
    onModesChange([]);
    onContentTypesChange([]);
    onStatusesChange([]);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-muted transition-all duration-300">
      <div className="relative flex items-center gap-2 p-2.5">
        <SearchInput searchText={searchText} onSearchChange={onSearchChange} isDark={isDark} />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Collapse filters" : "Expand filters"}
          className={`relative flex items-center gap-1.5 rounded-md border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            isExpanded
              ? "border-border bg-secondary text-foreground"
              : "border-border text-muted-foreground hover:border-border hover:text-foreground"
          }`}
        >
          <Filter size={12} />
          <ChevronDown
            size={12}
            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
          {hasActiveFilters && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-info text-[9px] font-bold text-white">
              {selectedTools.length +
                selectedModes.length +
                selectedContentTypes.length +
                selectedStatuses.length +
                (searchText ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      <div
        className={`grid transition-all duration-300 ease-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <FilterPanel
            selectedTools={selectedTools}
            onToolToggle={handleToolToggle}
            selectedModes={selectedModes}
            onModeToggle={handleModeToggle}
            selectedContentTypes={selectedContentTypes}
            onContentTypeToggle={handleContentTypeToggle}
            selectedStatuses={selectedStatuses}
            onStatusToggle={handleStatusToggle}
            isDark={isDark}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <span
          className={`text-[10px] font-medium ${
            isFiltered ? "text-info" : "text-muted-foreground"
          }`}
        >
          Showing <span className={`font-bold ${isFiltered ? "" : ""}`}>{filteredCount}</span> of{" "}
          <span className="font-bold">{totalItems}</span> items
        </span>

        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            title="Clear all filters"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-destructive/70 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
          >
            <X size={10} />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;

export type { SearchFilterProps } from "./types";
