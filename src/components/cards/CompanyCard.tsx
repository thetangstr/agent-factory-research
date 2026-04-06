import Link from "next/link";
import type { Company } from "@/types";
import { getCategoryLabel, getCategoryColor } from "@/lib/filtering";
import { getScoreColor, getProgressFillClass, getScoreCssColor } from "@/lib/scoring";

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const totalPct = company.scores.total / 100;
  const scoreColorClass = getScoreColor(company.scores.total, 100);
  const accentColor = getScoreCssColor(company.scores.total, 100);

  return (
    <Link
      href={`/companies/${company.slug}`}
      className="block group"
      style={{ textDecoration: "none" }}
    >
      <div
        className="relative overflow-hidden h-full rounded-xl transition-shadow duration-200 hover:shadow-md"
        style={{
          background: "#ffffff",
          border: "1px solid var(--md-sys-color-outline)",
          boxShadow: "var(--elevation-1)",
        }}
      >
        {/* Score-colored left accent bar */}
        <div
          className="absolute top-0 left-0 bottom-0 w-1 rounded-l-xl"
          style={{ background: accentColor, opacity: 0.7 }}
        />

        <div className="pl-4 pr-4 pt-4 pb-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-base truncate mb-1"
                style={{ color: "var(--md-sys-color-on-surface)", letterSpacing: "-0.01em" }}
              >
                {company.name}
              </h3>
              <p
                className="text-sm leading-snug line-clamp-2"
                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
              >
                {company.oneLiner}
              </p>
            </div>

            {/* Score badge */}
            <div
              className="flex-shrink-0 text-center rounded-xl px-3 py-2"
              style={{
                background: totalPct >= 0.8
                  ? "var(--score-high-bg)"
                  : totalPct >= 0.6
                  ? "var(--score-mid-bg)"
                  : "var(--score-low-bg)",
                border: `1px solid ${totalPct >= 0.8
                  ? "var(--score-high-border)"
                  : totalPct >= 0.6
                  ? "var(--score-mid-border)"
                  : "var(--score-low-border)"}`,
              }}
            >
              <div
                className={`stat-number font-bold leading-none ${scoreColorClass}`}
                style={{ fontSize: 22 }}
              >
                {company.scores.total}
              </div>
              <div
                className="text-[10px] font-medium mt-0.5"
                style={{ color: "var(--md-sys-color-on-surface-muted)" }}
              >
                /100
              </div>
            </div>
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(company.category)}`}
            >
              {getCategoryLabel(company.category)}
            </span>
            {company.subcategory && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs"
                style={{
                  background: "var(--md-sys-color-surface-variant)",
                  color: "var(--md-sys-color-on-surface-variant)",
                  border: "1px solid var(--md-sys-color-outline-variant)",
                }}
              >
                {company.subcategory}
              </span>
            )}
            {company.confidenceLevel !== "high" && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs"
                style={{
                  background: "var(--score-mid-bg)",
                  color: "var(--score-mid)",
                  border: "1px solid var(--score-mid-border)",
                }}
              >
                {company.confidenceLevel} confidence
              </span>
            )}
          </div>

          {/* Dimension bars */}
          <div
            className="rounded-lg p-3 space-y-2"
            style={{
              background: "var(--md-sys-color-surface-variant)",
            }}
          >
            <div
              className="text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: "var(--md-sys-color-on-surface-muted)" }}
            >
              Dimensions
            </div>
            {company.scores.dimensions.map((d) => (
              <div key={d.key} className="flex items-center gap-2">
                <span
                  className="w-7 text-xs font-bold flex-shrink-0"
                  style={{ color: "var(--md-sys-color-on-surface-muted)" }}
                >
                  {d.key}
                </span>
                <div className="flex-1 progress-track">
                  <div
                    className={getProgressFillClass(d.score, 20)}
                    style={{ width: `${(d.score / 20) * 100}%` }}
                  />
                </div>
                <span
                  className={`w-8 text-right text-xs font-semibold stat-number flex-shrink-0 ${getScoreColor(d.score, 20)}`}
                >
                  {Math.round(d.score)}
                </span>
              </div>
            ))}
          </div>

          {/* Capabilities */}
          {company.capabilities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {company.capabilities.slice(0, 3).map((cap) => (
                <span
                  key={cap}
                  className="inline-block rounded-full px-2.5 py-0.5 text-xs"
                  style={{
                    background: "var(--md-sys-color-primary-container)",
                    color: "var(--md-sys-color-on-primary-container)",
                  }}
                >
                  {cap}
                </span>
              ))}
              {company.capabilities.length > 3 && (
                <span
                  className="inline-block rounded-full px-2.5 py-0.5 text-xs"
                  style={{
                    background: "var(--md-sys-color-surface-variant)",
                    color: "var(--md-sys-color-on-surface-muted)",
                  }}
                >
                  +{company.capabilities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
