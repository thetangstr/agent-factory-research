"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { getCategoryLabel, getCategoryColor } from "@/lib/filtering";

interface FilterBarProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortField: string;
  onSortChange: (field: string) => void;
  sortDirection: "asc" | "desc";
  onSortDirectionChange: (dir: "asc" | "desc") => void;
  resultCount: number;
}

const sortOptions = [
  { value: "scoreTotal", label: "Sort by Score" },
  { value: "name", label: "Sort by Name" },
];

export default function FilterBar({
  categories,
  selectedCategories,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortField,
  onSortChange,
  sortDirection,
  onSortDirectionChange,
  resultCount,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      onCategoryChange(selectedCategories.filter((c) => c !== cat));
    } else {
      onCategoryChange([...selectedCategories, cat]);
    }
  };

  const inputBase: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid var(--md-sys-color-outline)",
    color: "var(--md-sys-color-on-surface)",
    borderRadius: 8,
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1" style={{ maxWidth: 380 }}>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ width: 15, height: 15, color: "var(--md-sys-color-on-surface-muted)" }}
          />
          <input
            type="text"
            placeholder="Search platforms..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2"
            style={inputBase}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--md-sys-color-on-surface-muted)" }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
          style={{
            background:
              showFilters || selectedCategories.length > 0
                ? "var(--md-sys-color-primary-container)"
                : "#ffffff",
            border:
              showFilters || selectedCategories.length > 0
                ? "1px solid var(--md-sys-color-primary)"
                : "1px solid var(--md-sys-color-outline)",
            color:
              showFilters || selectedCategories.length > 0
                ? "var(--md-sys-color-primary)"
                : "var(--md-sys-color-on-surface-variant)",
          }}
        >
          <SlidersHorizontal style={{ width: 14, height: 14 }} />
          Filter
          {selectedCategories.length > 0 && (
            <span
              className="w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-bold"
              style={{
                background: "var(--md-sys-color-primary)",
                color: "#ffffff",
              }}
            >
              {selectedCategories.length}
            </span>
          )}
          {showFilters ? (
            <ChevronUp style={{ width: 13, height: 13 }} />
          ) : (
            <ChevronDown style={{ width: 13, height: 13 }} />
          )}
        </button>

        {/* Sort */}
        <select
          value={sortField}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg"
          style={{ ...inputBase, cursor: "pointer" }}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={() =>
            onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")
          }
          className="px-3 py-2 text-sm rounded-lg transition-colors"
          style={{
            ...inputBase,
            cursor: "pointer",
            color: "var(--md-sys-color-on-surface-variant)",
            minWidth: 40,
          }}
          title={sortDirection === "asc" ? "Ascending" : "Descending"}
        >
          {sortDirection === "asc" ? "↑" : "↓"}
        </button>

        {/* Result count */}
        <span
          className="ml-auto text-sm"
          style={{ color: "var(--md-sys-color-on-surface-muted)" }}
        >
          {resultCount} {resultCount === 1 ? "platform" : "platforms"}
        </span>
      </div>

      {/* Category filter chips */}
      {showFilters && (
        <div
          className="flex items-center gap-2 flex-wrap px-4 py-3 rounded-xl"
          style={{
            background: "#ffffff",
            border: "1px solid var(--md-sys-color-outline)",
            boxShadow: "var(--elevation-1)",
          }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--md-sys-color-on-surface-muted)" }}
          >
            Type:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all ${
                selectedCategories.includes(cat) ? getCategoryColor(cat) : ""
              }`}
              style={
                !selectedCategories.includes(cat)
                  ? {
                      background: "var(--md-sys-color-surface-variant)",
                      color: "var(--md-sys-color-on-surface-variant)",
                      border: "1px solid var(--md-sys-color-outline)",
                    }
                  : {}
              }
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
          {selectedCategories.length > 0 && (
            <button
              onClick={() => onCategoryChange([])}
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{
                color: "var(--md-sys-color-primary)",
                background: "var(--md-sys-color-primary-container)",
              }}
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
