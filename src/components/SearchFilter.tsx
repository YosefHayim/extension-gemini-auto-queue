import { ChevronDown, Filter, Search, X } from "lucide-react";
import React, { useState } from "react";

import { GEMINI_MODE_INFO, GEMINI_TOOL_INFO, GeminiMode, GeminiTool } from "@/types";

interface SearchFilterProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  selectedTools: GeminiTool[];
  onToolsChange: (tools: GeminiTool[]) => void;
  selectedModes: GeminiMode[];
  onModesChange: (modes: GeminiMode[]) => void;
  isDark: boolean;
  totalItems: number;
  filteredCount: number;
}

const MODE_PILL_STYLES: Record<GeminiMode, { selected: string; unselected: string }> = {
  [GeminiMode.Quick]: {
    selected: "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/25",
    unselected: "border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10",
  },
  [GeminiMode.Deep]: {
    selected: "bg-blue-500 text-white border-blue-500 shadow-blue-500/25",
    unselected: "border-blue-500/40 text-blue-500 hover:bg-blue-500/10",
  },
  [GeminiMode.Pro]: {
    selected: "bg-purple-500 text-white border-purple-500 shadow-purple-500/25",
    unselected: "border-purple-500/40 text-purple-500 hover:bg-purple-500/10",
  },
};

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchText,
  onSearchChange,
  selectedTools,
  onToolsChange,
  selectedModes,
  onModesChange,
  isDark,
  totalItems,
  filteredCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    searchText.length > 0 || selectedTools.length > 0 || selectedModes.length > 0;
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

  const handleClearAll = () => {
    onSearchChange("");
    onToolsChange([]);
    onModesChange([]);
  };

  const allTools = Object.values(GeminiTool);
  const allModes = Object.values(GeminiMode);

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all duration-300 ${
        isDark
          ? "border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.02]"
          : "border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 shadow-sm"
      }`}
    >
      <div className="relative flex items-center gap-2 p-2.5">
        <div className="relative flex-1">
          <div
            className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? "text-white/30" : "text-slate-400"
            }`}
          >
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search prompts..."
            title="Search queue items by prompt text"
            className={`w-full rounded-lg border py-2 pl-9 pr-8 text-xs outline-none transition-all duration-200 ${
              isDark
                ? "border-white/10 bg-white/5 text-white/90 placeholder-white/30 focus:border-white/20 focus:bg-white/[0.07]"
                : "border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:border-slate-300 focus:shadow-sm"
            }`}
          />
          {searchText && (
            <button
              onClick={() => onSearchChange("")}
              title="Clear search"
              className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors ${
                isDark
                  ? "text-white/40 hover:bg-white/10 hover:text-white/70"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`}
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Collapse filters" : "Expand filters"}
          className={`relative flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all duration-200 ${
            isExpanded
              ? isDark
                ? "border-white/20 bg-white/10 text-white"
                : "border-slate-300 bg-slate-100 text-slate-700"
              : isDark
                ? "border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
                : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
          }`}
        >
          <Filter size={12} />
          <ChevronDown
            size={12}
            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
          {hasActiveFilters && (
            <span
              className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                isDark ? "bg-blue-500 text-white" : "bg-blue-500 text-white"
              }`}
            >
              {selectedTools.length + selectedModes.length + (searchText ? 1 : 0)}
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
          <div
            className={`border-t px-3 py-3 ${
              isDark ? "border-white/5 bg-white/[0.01]" : "border-slate-100 bg-slate-50/50"
            }`}
          >
            <div className="mb-3">
              <div
                className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${
                  isDark ? "text-white/40" : "text-slate-500"
                }`}
              >
                Filter by Tool
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allTools.map((tool) => {
                  const toolInfo = GEMINI_TOOL_INFO[tool];
                  const isSelected = selectedTools.includes(tool);
                  return (
                    <button
                      key={tool}
                      onClick={() => handleToolToggle(tool)}
                      title={toolInfo.description}
                      className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold transition-all duration-200 ${
                        isSelected
                          ? isDark
                            ? "border-white/30 bg-white/15 text-white shadow-sm"
                            : "border-slate-400 bg-slate-700 text-white shadow-sm"
                          : isDark
                            ? "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                            : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                      }`}
                    >
                      {React.createElement(toolInfo.icon, { size: 10 })}
                      <span>{toolInfo.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div
                className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${
                  isDark ? "text-white/40" : "text-slate-500"
                }`}
              >
                Filter by Mode
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allModes.map((mode) => {
                  const modeInfo = GEMINI_MODE_INFO[mode];
                  const isSelected = selectedModes.includes(mode);
                  const pillStyles = MODE_PILL_STYLES[mode];
                  return (
                    <button
                      key={mode}
                      onClick={() => handleModeToggle(mode)}
                      title={modeInfo.description}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-all duration-200 ${
                        isSelected
                          ? `${pillStyles.selected} shadow-sm`
                          : `${pillStyles.unselected} bg-transparent`
                      }`}
                    >
                      {modeInfo.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`flex items-center justify-between border-t px-3 py-2 ${
          isDark ? "border-white/5" : "border-slate-100"
        }`}
      >
        <span
          className={`text-[10px] font-medium ${
            isFiltered
              ? isDark
                ? "text-blue-400"
                : "text-blue-600"
              : isDark
                ? "text-white/40"
                : "text-slate-500"
          }`}
        >
          Showing <span className={`font-bold ${isFiltered ? "" : ""}`}>{filteredCount}</span> of{" "}
          <span className="font-bold">{totalItems}</span> items
        </span>

        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            title="Clear all filters"
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-all duration-200 ${
              isDark
                ? "text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                : "text-red-500/70 hover:bg-red-50 hover:text-red-600"
            }`}
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
