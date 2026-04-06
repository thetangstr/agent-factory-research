"use client";

import { useState } from "react";
import Link from "next/link";
import type { MatrixCell, FunctionCategory } from "@/types";

interface HeatmapGridProps {
  cells: MatrixCell[];
  industries: string[];
  functionCategories: FunctionCategory[];
}

const catColors: Record<string, string> = {
  sales: "#3f51b5",
  "customer-support": "#1e8a3c",
  hr: "#6d28d9",
  finance: "#b45309",
  "it-engineering": "#c0392b",
  operations: "#0277bd",
};

function getHeatColor(score: number): string {
  if (score >= 8) return "#1e8a3c";
  if (score >= 6) return "#2e7d32";
  if (score >= 4) return "#b45309";
  if (score >= 2) return "#d84315";
  return "#9e9e9e";
}

function getHeatBg(score: number): string {
  if (score >= 8) return "#e6f4ea";
  if (score >= 6) return "#e8f5e9";
  if (score >= 4) return "#fff3e0";
  if (score >= 2) return "#fbe9e7";
  return "#f5f5f5";
}

export default function HeatmapGrid({ cells, industries, functionCategories }: HeatmapGridProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const getCell = (ind: string, fn: string) =>
    cells.find(
      (c) => c.industry.toLowerCase() === ind.toLowerCase() && c.functionSlug === fn
    );

  // Also try matching by jobFunction for backward compat
  const getCellFlex = (ind: string, fn: string) => {
    return getCell(ind, fn) || cells.find(
      (c) => c.industry.toLowerCase() === ind.toLowerCase() &&
        c.jobFunction.toLowerCase().replace(/[^a-z0-9]/g, "-") === fn
    );
  };

  const totalSubFunctions = functionCategories.reduce((s, c) => s + c.subFunctions.length, 0);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: totalSubFunctions * 70 + 160 }}>
          {/* Two-row header: parent categories + sub-functions */}
          <thead>
            {/* Parent category row */}
            <tr>
              <th
                rowSpan={2}
                className="sticky left-0 z-20 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide align-bottom"
                style={{ background: "#ffffff", color: "var(--md-sys-color-on-surface-muted)", minWidth: 140, borderBottom: "2px solid var(--md-sys-color-outline)" }}
              >
                Industry
              </th>
              {functionCategories.map((cat) => (
                <th
                  key={cat.key}
                  colSpan={cat.subFunctions.length}
                  className="px-1 py-2 text-center text-xs font-bold uppercase tracking-wide"
                  style={{
                    color: catColors[cat.key] || "var(--md-sys-color-on-surface)",
                    borderBottom: `2px solid ${catColors[cat.key] || "var(--md-sys-color-outline)"}`,
                    borderLeft: "1px solid var(--md-sys-color-outline-variant)",
                  }}
                >
                  {cat.name}
                </th>
              ))}
            </tr>
            {/* Sub-function row */}
            <tr>
              {functionCategories.map((cat) =>
                cat.subFunctions.map((sf, i) => (
                  <th
                    key={sf.key}
                    className="px-1 py-1.5 text-center"
                    style={{
                      borderBottom: "1px solid var(--md-sys-color-outline)",
                      borderLeft: i === 0 ? `1px solid ${catColors[cat.key] || "var(--md-sys-color-outline)"}30` : "none",
                    }}
                  >
                    <div
                      className="text-[9px] font-medium leading-tight"
                      style={{ color: "var(--md-sys-color-on-surface-muted)", maxWidth: 70 }}
                    >
                      {sf.name}
                    </div>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {industries.map((ind) => (
              <tr key={ind}>
                <td
                  className="sticky left-0 z-10 px-3 py-1.5 text-xs font-medium"
                  style={{
                    background: "#ffffff",
                    color: "var(--md-sys-color-on-surface)",
                    borderBottom: "1px solid var(--md-sys-color-outline-variant)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ind}
                </td>
                {functionCategories.map((cat) =>
                  cat.subFunctions.map((sf, sfIdx) => {
                    const cell = getCellFlex(ind, sf.key);
                    const score = cell?.disruptionScore ?? 0;
                    const cellKey = `${ind}-${sf.key}`;
                    const isHovered = hoveredCell === cellKey;

                    return (
                      <td
                        key={sf.key}
                        className="px-0.5 py-0.5"
                        style={{
                          borderBottom: "1px solid var(--md-sys-color-outline-variant)",
                          borderLeft: sfIdx === 0 ? `1px solid ${catColors[cat.key] || "var(--md-sys-color-outline)"}15` : "none",
                        }}
                      >
                        {cell ? (
                          <Link
                            href={`/matrix/${cell.industrySlug}/${cell.functionSlug}`}
                            className="block rounded-md p-1 text-center transition-all"
                            style={{
                              background: isHovered ? getHeatColor(score) : getHeatBg(score),
                              color: isHovered ? "#ffffff" : getHeatColor(score),
                              textDecoration: "none",
                              fontSize: 12,
                              fontWeight: 700,
                              minHeight: 28,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transform: isHovered ? "scale(1.1)" : "scale(1)",
                              boxShadow: isHovered ? "var(--elevation-2)" : "none",
                              position: "relative",
                              zIndex: isHovered ? 5 : 1,
                            }}
                            onMouseEnter={() => setHoveredCell(cellKey)}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {score}
                          </Link>
                        ) : (
                          <div
                            className="rounded-md p-1 text-center"
                            style={{
                              background: "var(--md-sys-color-surface-variant)",
                              color: "var(--md-sys-color-on-surface-muted)",
                              fontSize: 10,
                              minHeight: 28,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0.4,
                            }}
                          >
                            —
                          </div>
                        )}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {hoveredCell && (() => {
        const parts = hoveredCell.split("-");
        const indName = parts[0];
        const sfKey = parts.slice(1).join("-");
        const cell = getCellFlex(indName, sfKey);
        if (!cell) return null;
        return (
          <div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-3 max-w-md"
            style={{ background: "#ffffff", border: "1px solid var(--md-sys-color-outline)", boxShadow: "var(--elevation-3)" }}
          >
            <div className="text-sm font-semibold" style={{ color: "var(--md-sys-color-on-surface)" }}>
              {cell.industry} × {cell.jobFunction}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
              {cell.summary}
            </div>
          </div>
        );
      })()}

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3 justify-center" style={{ borderTop: "1px solid var(--md-sys-color-outline-variant)" }}>
        <span className="text-xs" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>Disruption:</span>
        {[
          { label: "Low (1-3)", score: 2 },
          { label: "Medium (4-5)", score: 5 },
          { label: "High (6-7)", score: 7 },
          { label: "Very High (8+)", score: 9 },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ background: getHeatBg(l.score), border: `1px solid ${getHeatColor(l.score)}40` }} />
            <span className="text-[10px]" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
