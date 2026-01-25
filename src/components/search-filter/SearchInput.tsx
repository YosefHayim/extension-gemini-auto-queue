import { Search, X } from "lucide-react";
import React from "react";

interface SearchInputProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  isDark: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({ searchText, onSearchChange, isDark }) => {
  return (
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
        className={`w-full rounded-md border py-2.5 pl-9 pr-8 text-sm outline-none transition-all duration-200 ${
          isDark
            ? "border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:border-slate-500"
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
  );
};
