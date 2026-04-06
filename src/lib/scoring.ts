import type { Company, FrameworkScores, DimensionScore } from "@/types";

export function getScoreTotal(company: Company): number {
  return company.scores.total;
}

export function getDimensionScore(
  scores: FrameworkScores,
  dimensionKey: string
): DimensionScore | undefined {
  return scores.dimensions.find((d) => d.key === dimensionKey);
}

/** Returns a Tailwind text color class appropriate for light theme */
export function getScoreColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8) return "text-green-700";
  if (pct >= 0.6) return "text-amber-700";
  return "text-red-600";
}

/** Returns background + border classes for a score card on light theme */
export function getScoreBgColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8)
    return "bg-[var(--score-high-bg)] border-[var(--score-high-border)]";
  if (pct >= 0.6)
    return "bg-[var(--score-mid-bg)] border-[var(--score-mid-border)]";
  return "bg-[var(--score-low-bg)] border-[var(--score-low-border)]";
}

/** No glow on light theme — returns empty string */
export function getScoreGlowClass(_score: number, _max: number): string {
  return "";
}

/** Returns a raw CSS color string for a score value */
export function getScoreCssColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8) return "var(--score-high)";
  if (pct >= 0.6) return "var(--score-mid)";
  return "var(--score-low)";
}

/** Returns the correct progress fill class for light theme */
export function getProgressFillClass(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8) return "progress-fill-cyan";
  if (pct >= 0.6) return "progress-fill-amber";
  return "progress-fill-red";
}

export function formatScore(score: number, max: number): string {
  return `${score}/${max}`;
}

export function compareCompanies(
  a: Company,
  b: Company,
  field: string,
  direction: "asc" | "desc" = "desc"
): number {
  let aVal: number;
  let bVal: number;

  if (field === "name") {
    return direction === "asc"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  }

  if (field === "scoreTotal") {
    aVal = a.scores.total;
    bVal = b.scores.total;
  } else if (field.startsWith("score_")) {
    const key = field.replace("score_", "");
    aVal = getDimensionScore(a.scores, key)?.score ?? 0;
    bVal = getDimensionScore(b.scores, key)?.score ?? 0;
  } else {
    return 0;
  }

  return direction === "asc" ? aVal - bVal : bVal - aVal;
}
