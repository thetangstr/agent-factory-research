import Fuse from "fuse.js";
import type { Company } from "@/types";

let fuseInstance: Fuse<Company> | null = null;

export function buildSearchIndex(companies: Company[]): Fuse<Company> {
  fuseInstance = new Fuse(companies, {
    keys: [
      { name: "name", weight: 2 },
      { name: "description", weight: 1.5 },
      { name: "oneLiner", weight: 1.5 },
      { name: "capabilities", weight: 1 },
      { name: "uxAnalysis.builderFlow", weight: 0.8 },
      { name: "uxAnalysis.strengths", weight: 0.8 },
      { name: "uxAnalysis.notableFeatures", weight: 1 },
      { name: "recentDevelopments", weight: 0.5 },
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
  });
  return fuseInstance;
}

export function searchCompanies(
  query: string,
  companies: Company[]
): Company[] {
  if (!query.trim()) return companies;

  if (!fuseInstance) {
    buildSearchIndex(companies);
  }

  const results = fuseInstance!.search(query);
  return results.map((r) => r.item);
}
