import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getMarketBySlug, getAllMarkets } from "@/lib/data";
import { getScoreColor, getProgressFillClass, getScoreCssColor } from "@/lib/scoring";
import ScoreRadar from "@/components/charts/ScoreRadar";
import ScoreCard from "@/components/cards/ScoreCard";

export async function generateStaticParams() {
  const markets = getAllMarkets();
  return markets.map((m) => ({ sector: m.slug }));
}

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ sector: string }>;
}) {
  const { sector } = await params;
  const market = getMarketBySlug(sector);

  const backLink = (
    <Link
      href="/markets"
      className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors"
      style={{
        color: "var(--md-sys-color-primary)",
        textDecoration: "none",
      }}
    >
      <ArrowLeft style={{ width: 15, height: 15 }} />
      Back to Markets
    </Link>
  );

  if (!market) {
    return (
      <div className="min-h-screen" style={{ background: "var(--md-sys-color-background)" }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
          {backLink}
          <div
            className="rounded-xl p-10 text-center"
            style={{
              background: "#ffffff",
              border: "1px solid var(--md-sys-color-outline)",
              boxShadow: "var(--elevation-1)",
            }}
          >
            <h1 className="text-xl font-bold capitalize mb-2" style={{ color: "var(--md-sys-color-on-surface)" }}>
              {sector.replace(/-/g, " ")}
            </h1>
            <p style={{ color: "var(--md-sys-color-on-surface-variant)", fontSize: 14 }}>
              Market data not found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalPct = market.pactScore.total / 100;
  const accentColor = getScoreCssColor(market.pactScore.total, 100);

  return (
    <div className="min-h-screen" style={{ background: "var(--md-sys-color-background)" }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        {backLink}

        {/* Hero card */}
        <div
          className="rounded-xl p-6 mb-5"
          style={{
            background: "#ffffff",
            border: "1px solid var(--md-sys-color-outline)",
            boxShadow: "var(--elevation-2)",
            borderTop: `3px solid ${accentColor}`,
          }}
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "var(--md-sys-color-primary)" }}
              >
                Market Analysis
              </div>
              <h1
                className="text-2xl font-bold mb-4"
                style={{ color: "var(--md-sys-color-on-surface)", letterSpacing: "-0.02em" }}
              >
                {market.sector}
              </h1>
              <p
                className="text-base leading-relaxed mb-5 max-w-2xl"
                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
              >
                {market.narrative}
              </p>
              <div
                className="rounded-xl p-4"
                style={{
                  background: "var(--md-sys-color-primary-container)",
                  border: "1px solid #9fa8da",
                }}
              >
                <div
                  className="text-xs font-semibold uppercase tracking-wide mb-1.5"
                  style={{ color: "var(--md-sys-color-primary)" }}
                >
                  Buyer Promise
                </div>
                <p
                  className="text-sm font-medium italic"
                  style={{ color: "var(--md-sys-color-on-primary-container)" }}
                >
                  &ldquo;{market.buyerPromise}&rdquo;
                </p>
              </div>
            </div>

            {/* WACT score block */}
            <div
              className="flex-shrink-0 text-center rounded-2xl px-6 py-4"
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
                className="text-xs font-semibold uppercase tracking-wide mb-1"
                style={{ color: "var(--md-sys-color-on-surface-muted)" }}
              >
                WACT Score
              </div>
              <div
                className={`stat-number font-bold leading-none ${getScoreColor(market.pactScore.total, 100)}`}
                style={{ fontSize: 56 }}
              >
                {market.pactScore.total}
              </div>
              <div
                className="text-xs font-medium uppercase tracking-wide mt-1"
                style={{ color: "var(--md-sys-color-on-surface-muted)" }}
              >
                out of 100
              </div>
            </div>
          </div>
        </div>

        {/* WACT Scores */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          <div
            className="rounded-xl p-5"
            style={{
              background: "#ffffff",
              border: "1px solid var(--md-sys-color-outline)",
              boxShadow: "var(--elevation-1)",
            }}
          >
            <h2
              className="text-sm font-semibold mb-4"
              style={{ color: "var(--md-sys-color-on-surface)" }}
            >
              WACT 3.0 Market Score
            </h2>
            <ScoreRadar scores={[market.pactScore]} labels={[market.sector]} size={240} />

            {/* Dimension bars */}
            <div className="mt-4 space-y-3">
              {market.pactScore.dimensions.map((d) => (
                <div key={d.key} className="flex items-center gap-3">
                  <span
                    className="text-xs font-bold flex-shrink-0 rounded px-1.5 py-0.5"
                    style={{
                      background: "var(--md-sys-color-primary-container)",
                      color: "var(--md-sys-color-primary)",
                      minWidth: 28,
                      textAlign: "center",
                    }}
                  >
                    {d.key}
                  </span>
                  <div className="flex-1 progress-track">
                    <div
                      className={getProgressFillClass(d.score, 25)}
                      style={{ width: `${(d.score / 25) * 100}%` }}
                    />
                  </div>
                  <span
                    className={`w-8 text-right text-sm stat-number font-semibold flex-shrink-0 ${getScoreColor(d.score, 25)}`}
                  >
                    {d.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Approach */}
          <div className="space-y-4">
            <div
              className="rounded-xl p-5"
              style={{
                background: "#ffffff",
                border: "1px solid var(--md-sys-color-outline)",
                boxShadow: "var(--elevation-1)",
              }}
            >
              <h2
                className="text-sm font-semibold mb-3 flex items-center gap-1.5"
                style={{ color: "var(--score-high)" }}
              >
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--score-high)" }} />
                Quick Start
              </h2>
              <ul className="space-y-2">
                {market.quickStart.map((s, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-sm"
                    style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                  >
                    <span style={{ color: "var(--score-high)", flexShrink: 0, marginTop: 1 }}>✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-xl p-5"
              style={{
                background: "#ffffff",
                border: "1px solid var(--md-sys-color-outline)",
                boxShadow: "var(--elevation-1)",
              }}
            >
              <h2
                className="text-sm font-semibold mb-3 flex items-center gap-1.5"
                style={{ color: "var(--score-low)" }}
              >
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--score-low)" }} />
                Avoid
              </h2>
              <ul className="space-y-2">
                {market.avoid.map((a, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-sm"
                    style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                  >
                    <span style={{ color: "var(--score-low)", flexShrink: 0, marginTop: 1 }}>✕</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Real Examples */}
        <div
          className="rounded-xl p-6 mb-5"
          style={{
            background: "#ffffff",
            border: "1px solid var(--md-sys-color-outline)",
            boxShadow: "var(--elevation-1)",
          }}
        >
          <h2
            className="text-base font-semibold mb-5"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            Real-World Examples
          </h2>
          <div className="space-y-6">
            {market.examples.map((ex, i) => (
              <div
                key={i}
                className="rounded-xl p-5"
                style={{
                  background: "var(--md-sys-color-surface-variant)",
                  border: "1px solid var(--md-sys-color-outline-variant)",
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3
                    className="font-semibold text-base"
                    style={{ color: "var(--md-sys-color-on-surface)" }}
                  >
                    {ex.name}
                  </h3>
                  <span
                    className="text-xs flex-shrink-0 rounded-full px-2.5 py-0.5 font-medium"
                    style={{
                      background: "var(--md-sys-color-primary-container)",
                      color: "var(--md-sys-color-primary)",
                    }}
                  >
                    {ex.source}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: "Challenge", value: ex.challenge, color: "var(--md-sys-color-on-surface-muted)" },
                    { label: "Scale", value: ex.scale, color: "var(--md-sys-color-on-surface-muted)" },
                    { label: "Impact", value: ex.humanHoursAndDollarImpact, color: "var(--md-sys-color-primary)" },
                    { label: "Why It Matters", value: ex.whyItMatters, color: "var(--score-mid)" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div
                        className="text-xs font-semibold uppercase tracking-wide mb-1.5"
                        style={{ color }}
                      >
                        {label}
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consultant Signals + Obstacles */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          <div
            className="rounded-xl p-5"
            style={{
              background: "#ffffff",
              border: "1px solid var(--md-sys-color-outline)",
              boxShadow: "var(--elevation-1)",
            }}
          >
            <h2
              className="text-sm font-semibold mb-3 flex items-center gap-1.5"
              style={{ color: "var(--score-mid)" }}
            >
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--score-mid)" }} />
              Consultant Signals
            </h2>
            <ul className="space-y-3">
              {market.consultantSignals.map((s, i) => (
                <li
                  key={i}
                  className="text-sm leading-relaxed pl-4 py-1"
                  style={{
                    color: "var(--md-sys-color-on-surface-variant)",
                    borderLeft: "3px solid var(--score-mid-border)",
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-xl p-5"
            style={{
              background: "#ffffff",
              border: "1px solid var(--md-sys-color-outline)",
              boxShadow: "var(--elevation-1)",
            }}
          >
            <h2
              className="text-sm font-semibold mb-3 flex items-center gap-1.5"
              style={{ color: "var(--score-low)" }}
            >
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--score-low)" }} />
              Obstacles
            </h2>
            <ul className="space-y-2">
              {market.obstacles.map((o, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-sm"
                  style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                >
                  <span style={{ color: "var(--score-mid)", flexShrink: 0, marginTop: 1 }}>!</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Open Questions */}
        <div
          className="rounded-xl p-6"
          style={{
            background: "#ffffff",
            border: "1px solid var(--md-sys-color-outline)",
            boxShadow: "var(--elevation-1)",
          }}
        >
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            Open Questions to Win
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {market.openQuestions.map((q, i) => (
              <div
                key={i}
                className="flex gap-3 text-sm rounded-xl p-4"
                style={{
                  background: "var(--md-sys-color-primary-container)",
                  color: "var(--md-sys-color-on-surface-variant)",
                }}
              >
                <span
                  style={{
                    color: "var(--md-sys-color-primary)",
                    flexShrink: 0,
                    fontWeight: 700,
                    marginTop: 1,
                  }}
                >
                  ?
                </span>
                {q}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
