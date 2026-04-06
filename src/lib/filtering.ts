import type { Company, FilterState } from "@/types";

export const defaultFilter: FilterState = {
  categories: [],
  scoreRange: [0, 100],
  searchQuery: "",
};

export function filterCompanies(
  companies: Company[],
  filter: FilterState
): Company[] {
  return companies.filter((c) => {
    if (
      filter.categories.length > 0 &&
      !filter.categories.includes(c.category)
    ) {
      return false;
    }

    if (
      c.scores.total < filter.scoreRange[0] ||
      c.scores.total > filter.scoreRange[1]
    ) {
      return false;
    }

    return true;
  });
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case "open-source":
      return "Open Source";
    case "enterprise":
      return "Enterprise";
    case "use-case":
      return "Use Case";
    default:
      return category;
  }
}

/** Returns Tailwind classes for category chips — light Material chip style */
export function getCategoryColor(category: string): string {
  switch (category) {
    case "open-source":
      return "badge-open-source";
    case "enterprise":
      return "badge-enterprise";
    case "use-case":
      return "badge-use-case";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
}
