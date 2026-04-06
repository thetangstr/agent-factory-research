"use client";

import { useState, useMemo } from "react";
import CompanyCard from "@/components/cards/CompanyCard";
import FilterBar from "@/components/filters/FilterBar";
import { searchCompanies } from "@/lib/search";
import { filterCompanies, defaultFilter } from "@/lib/filtering";
import { compareCompanies } from "@/lib/scoring";
import type { Company, SortDirection } from "@/types";

export default function CompaniesClient({ companies }: { companies: Company[] }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("scoreTotal");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const filteredCompanies = useMemo(() => {
    let result = companies;

    if (searchQuery.trim()) {
      result = searchCompanies(searchQuery, result);
    }

    result = filterCompanies(result, {
      ...defaultFilter,
      categories: selectedCategories,
    });

    result = [...result].sort((a, b) =>
      compareCompanies(a, b, sortField, sortDirection)
    );

    return result;
  }, [companies, searchQuery, selectedCategories, sortField, sortDirection]);

  const categories = [...new Set(companies.map((c) => c.category))].sort();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--md-sys-color-background)" }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--md-sys-color-primary)" }}
          >
            Competitive Intelligence
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              color: "var(--md-sys-color-on-surface)",
              letterSpacing: "-0.02em",
            }}
          >
            Company Analysis
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            {companies.length} enterprise agent factory platforms with dual-framework scoring
          </p>
        </div>

        <FilterBar
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortField={sortField}
          onSortChange={setSortField}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
          resultCount={filteredCompanies.length}
        />

        {filteredCompanies.length > 0 ? (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.slug} company={company} />
            ))}
          </div>
        ) : (
          <div className="mt-20 text-center">
            <div
              className="text-4xl mb-4"
            >
              🔍
            </div>
            <div
              className="text-base font-medium mb-2"
              style={{ color: "var(--md-sys-color-on-surface)" }}
            >
              {companies.length === 0
                ? "Research in progress"
                : "No platforms match your filters"}
            </div>
            <p
              className="text-sm"
              style={{ color: "var(--md-sys-color-on-surface-muted)" }}
            >
              {companies.length === 0
                ? "Company data will appear here as deep-dive research is completed."
                : "Try adjusting your filters or search query."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
