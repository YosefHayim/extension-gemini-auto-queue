import { Search, X } from "lucide-react";
import React from "react";

interface SearchInputProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  isDark?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({ searchText, onSearchChange }) => {
  return (
    <div className="relative flex-1">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Search size={14} />
      </div>
      <input
        type="text"
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search prompts..."
        title="Search queue items by prompt text"
        className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-8 text-sm text-foreground placeholder-muted-foreground outline-none transition-all duration-200 focus:border-border focus:shadow-sm"
      />
      {searchText && (
        <button
          onClick={() => onSearchChange("")}
          title="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};
