/**
 * Data loading utilities.
 * Uses Node.js fs for server-side data loading in Next.js App Router.
 */

import * as fs from "fs";
import * as path from "path";
import type { Company, Framework, VerticalMarket, MatrixCell, AgenticUserJourney } from "@/types";

const DATA_DIR = path.join(process.cwd(), "src", "data");

function loadJsonDir<T>(subdir: string): T[] {
  const dir = path.join(DATA_DIR, subdir);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const content = fs.readFileSync(path.join(dir, f), "utf-8");
      return JSON.parse(content) as T;
    });
}

export function getAllCompanies(): Company[] {
  return loadJsonDir<Company>("companies");
}

export function getCompanyBySlug(slug: string): Company | undefined {
  const companies = getAllCompanies();
  return companies.find((c) => c.slug === slug);
}

export function getAllFrameworks(): Framework[] {
  return loadJsonDir<Framework>("frameworks");
}

export function getFrameworkByName(name: string): Framework | undefined {
  const frameworks = getAllFrameworks();
  return frameworks.find((f) =>
    f.name.toLowerCase().includes(name.toLowerCase())
  );
}

export function getAllMarkets(): VerticalMarket[] {
  return loadJsonDir<VerticalMarket>("markets");
}

export function getMarketBySlug(slug: string): VerticalMarket | undefined {
  const markets = getAllMarkets();
  return markets.find((m) => m.slug === slug);
}

// Matrix data
export function getAllMatrixCells(): MatrixCell[] {
  const indexPath = path.join(DATA_DIR, "matrix", "index.json");
  if (!fs.existsSync(indexPath)) return [];
  return JSON.parse(fs.readFileSync(indexPath, "utf-8")) as MatrixCell[];
}

export function getMatrixCell(industrySlug: string, functionSlug: string): MatrixCell | undefined {
  // Check for deep version first
  const deepPath = path.join(DATA_DIR, "matrix", "deep", `${industrySlug}-${functionSlug}.json`);
  if (fs.existsSync(deepPath)) {
    return JSON.parse(fs.readFileSync(deepPath, "utf-8")) as MatrixCell;
  }
  // Fall back to light version from index
  const cells = getAllMatrixCells();
  return cells.find((c) => c.industrySlug === industrySlug && c.functionSlug === functionSlug);
}

// Agentic User Journeys
export function getAllCUJs(): AgenticUserJourney[] {
  const cujPath = path.join(DATA_DIR, "cujs.json");
  if (!fs.existsSync(cujPath)) return [];
  return JSON.parse(fs.readFileSync(cujPath, "utf-8")) as AgenticUserJourney[];
}

export function getCUJById(id: string): AgenticUserJourney | undefined {
  return getAllCUJs().find((c) => c.id === id);
}

export function getCompaniesByCUJ(cujId: string): Company[] {
  return getAllCompanies().filter((c) => c.supportedCUJs?.includes(cujId));
}

export function getUniqueCategories(companies: Company[]): string[] {
  return [...new Set(companies.map((c) => c.category))].sort();
}

export function getAverageScore(companies: Company[]): number {
  if (companies.length === 0) return 0;
  return Math.round(
    companies.reduce((sum, c) => sum + c.scores.total, 0) / companies.length
  );
}
