"use client";

import type { Company } from "@/types";
import ScoreRadar from "@/components/charts/ScoreRadar";
import { getScoreColor, formatScore } from "@/lib/scoring";
import { getCategoryLabel, getCategoryColor } from "@/lib/filtering";
import { X } from "lucide-react";

interface ComparisonViewProps {
  companies: Company[];
  allCompanies: Company[];
  onRemove: (slug: string) => void;
  onAdd: (slug: string) => void;
}

const radarColors = ["#3f51b5", "#b45309", "#1e8a3c", "#c0392b"];

const dimensionNames: Record<string, string> = {
  CR: "Creation",
  OR: "Orchestration",
  IN: "Integration",
  GV: "Governance",
  OP: "Operations",
};

export default function ComparisonView({
  companies,
  allCompanies,
  onRemove,
  onAdd,
}: ComparisonViewProps) {
  const scores = companies.map((c) => c.scores);
  const labels = companies.map((c) => c.name);
  const dimensions = ["CR", "OR", "IN", "GV", "OP"];

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid var(--md-sys-color-outline)",
    borderRadius: 12,
    boxShadow: "var(--elevation-1)",
  };

  return (
    <div className="space-y-5">
      {/* Selected companies chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {companies.map((c, i) => (
          <div
            key={c.slug}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: `${radarColors[i % radarColors.length]}14`,
              border: `1px solid ${radarColors[i % radarColors.length]}50`,
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: radarColors[i % radarColors.length] }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--md-sys-color-on-surface)" }}
            >
              {c.name}
            </span>
            <button
              onClick={() => onRemove(c.slug)}
              className="rounded-full p-0.5 transition-colors"
              style={{ color: "var(--md-sys-color-on-surface-muted)" }}
            >
              <X style={{ width: 13, height: 13 }} />
            </button>
          </div>
        ))}
        {companies.length < 4 && (
          <select
            onChange={(e) => {
              if (e.target.value) onAdd(e.target.value);
              e.target.value = "";
            }}
            className="text-sm px-3 py-1.5 rounded-full"
            defaultValue=""
            style={{
              background: "#ffffff",
              border: "1px dashed var(--md-sys-color-outline)",
              color: "var(--md-sys-color-on-surface-variant)",
              cursor: "pointer",
            }}
          >
            <option value="" disabled>
              + Add platform
            </option>
            {allCompanies
              .filter((c) => !companies.find((s) => s.slug === c.slug))
              .map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
          </select>
        )}
      </div>

      {companies.length >= 2 ? (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Radar overlay */}
          <div style={cardStyle} className="p-5">
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: "var(--md-sys-color-on-surface)" }}
            >
              Score Overlay
            </h3>
            <ScoreRadar
              scores={scores}
              labels={labels}
              colors={radarColors}
              size={320}
            />
          </div>

          {/* Dimension comparison table */}
          <div style={cardStyle} className="p-5 overflow-x-auto">
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: "var(--md-sys-color-on-surface)" }}
            >
              Dimension Breakdown
            </h3>
            <table className="w-full text-sm table-terminal">
              <thead>
                <tr
                  style={{ borderBottom: "2px solid var(--md-sys-color-outline)" }}
                >
                  <th
                    className="text-left pb-3 font-semibold"
                    style={{ color: "var(--md-sys-color-on-surface-muted)" }}
                  >
                    Dimension
                  </th>
                  {companies.map((c, i) => (
                    <th
                      key={c.slug}
                      className="text-right pb-3 font-semibold"
                      style={{
                        color: radarColors[i],
                        fontSize: 12,
                      }}
                    >
                      {c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dimensions.map((key) => {
                  const dimScores = companies.map((c) => {
                    return c.scores.dimensions.find((d) => d.key === key)?.score ?? 0;
                  });
                  const maxScore = Math.max(...dimScores);

                  return (
                    <tr
                      key={key}
                      style={{ borderBottom: "1px solid var(--md-sys-color-outline-variant)" }}
                    >
                      <td className="py-2.5">
                        <span
                          className="text-xs font-bold rounded px-1.5 py-0.5 mr-2"
                          style={{
                            background: "var(--md-sys-color-primary-container)",
                            color: "var(--md-sys-color-primary)",
                          }}
                        >
                          {key}
                        </span>
                        <span style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
                          {dimensionNames[key]}
                        </span>
                      </td>
                      {dimScores.map((score, i) => (
                        <td
                          key={companies[i].slug}
                          className={`text-right py-2.5 font-semibold stat-number ${
                            score === maxScore && companies.length > 1
                              ? getScoreColor(score, 20)
                              : ""
                          }`}
                          style={
                            score !== maxScore || companies.length <= 1
                              ? { color: "var(--md-sys-color-on-surface-variant)" }
                              : {}
                          }
                        >
                          {formatScore(Math.round(score * 10) / 10, 20)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr
                  style={{ borderTop: "2px solid var(--md-sys-color-outline)" }}
                >
                  <td
                    className="py-3 font-semibold text-sm"
                    style={{ color: "var(--md-sys-color-on-surface)" }}
                  >
                    Total
                  </td>
                  {companies.map((c) => (
                    <td
                      key={c.slug}
                      className={`text-right py-3 font-bold stat-number ${getScoreColor(c.scores.total, 100)}`}
                      style={{ fontSize: 15 }}
                    >
                      {formatScore(c.scores.total, 100)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          className="p-16 text-center text-sm rounded-xl"
          style={{
            background: "#ffffff",
            border: "1px dashed var(--md-sys-color-outline)",
            color: "var(--md-sys-color-on-surface-muted)",
          }}
        >
          Select at least 2 platforms to compare
        </div>
      )}

      {/* Category + metadata comparison */}
      {companies.length >= 2 && (
        <div style={cardStyle} className="p-5 overflow-x-auto">
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            Overview
          </h3>
          <table className="w-full text-sm table-terminal">
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--md-sys-color-outline-variant)" }}>
                <td
                  className="py-3 font-semibold w-28 text-xs uppercase tracking-wide"
                  style={{ color: "var(--md-sys-color-on-surface-muted)" }}
                >
                  Category
                </td>
                {companies.map((c) => (
                  <td key={c.slug} className="py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(c.category)}`}
                    >
                      {getCategoryLabel(c.category)}
                    </span>
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: "1px solid var(--md-sys-color-outline-variant)" }}>
                <td
                  className="py-3 font-semibold text-xs uppercase tracking-wide"
                  style={{ color: "var(--md-sys-color-on-surface-muted)" }}
                >
                  Pricing
                </td>
                {companies.map((c) => (
                  <td
                    key={c.slug}
                    className="py-3"
                    style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                  >
                    {c.pricing}
                  </td>
                ))}
              </tr>
              <tr>
                <td
                  className="py-3 font-semibold text-xs uppercase tracking-wide"
                  style={{ color: "var(--md-sys-color-on-surface-muted)" }}
                >
                  Confidence
                </td>
                {companies.map((c) => (
                  <td
                    key={c.slug}
                    className="py-3 capitalize"
                    style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                  >
                    {c.confidenceLevel}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
