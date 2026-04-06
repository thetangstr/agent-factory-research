import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllMarkets } from "@/lib/data";
import { getScoreColor, getScoreCssColor } from "@/lib/scoring";

export default function MarketsPage() {
  const markets = getAllMarkets().sort(
    (a, b) => b.pactScore.total - a.pactScore.total
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--md-sys-color-background)" }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--md-sys-color-primary)" }}
          >
            Market Intelligence
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              color: "var(--md-sys-color-on-surface)",
              letterSpacing: "-0.02em",
            }}
          >
            Vertical Markets
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            {markets.length} sectors ranked by WACT 4.0 opportunity score
          </p>
        </div>

        <div className="space-y-3">
          {markets.map((market, i) => {
            const pct = market.pactScore.total / 100;
            const accentColor = getScoreCssColor(market.pactScore.total, 100);

            return (
              <Link
                key={market.slug}
                href={`/markets/${market.slug}`}
                className="group flex items-center gap-4 rounded-xl p-5 transition-shadow duration-150 hover:shadow-md"
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--md-sys-color-outline)",
                  boxShadow: "var(--elevation-1)",
                  textDecoration: "none",
                }}
              >
                {/* Rank */}
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center stat-number font-bold text-sm"
                  style={{
                    background: "var(--md-sys-color-surface-variant)",
                    color: "var(--md-sys-color-on-surface-muted)",
                  }}
                >
                  {i + 1}
                </div>

                {/* Score bar */}
                <div
                  className="flex-shrink-0 w-1.5 rounded-full self-stretch"
                  style={{
                    background: accentColor,
                    minHeight: 40,
                    opacity: 0.7,
                  }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h2
                    className="font-semibold text-base mb-0.5"
                    style={{ color: "var(--md-sys-color-on-surface)" }}
                  >
                    {market.sector}
                  </h2>
                  <p
                    className="text-sm truncate"
                    style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                  >
                    {market.buyerPromise}
                  </p>
                </div>

                {/* WACT score */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div
                      className="text-xs font-medium uppercase tracking-wide mb-0.5"
                      style={{ color: "var(--md-sys-color-on-surface-muted)" }}
                    >
                      WACT Score
                    </div>
                    <div
                      className={`stat-number font-bold leading-none ${getScoreColor(market.pactScore.total, 100)}`}
                      style={{ fontSize: 22 }}
                    >
                      {market.pactScore.total}
                      <span
                        className="font-normal"
                        style={{ fontSize: 12, color: "var(--md-sys-color-on-surface-muted)", marginLeft: 2 }}
                      >
                        /100
                      </span>
                    </div>
                  </div>

                  {/* Dimension mini scores */}
                  <div className="hidden md:flex items-center gap-3">
                    {market.pactScore.dimensions.map((d) => (
                      <div
                        key={d.key}
                        className="text-center"
                      >
                        <div
                          className="text-[10px] font-semibold uppercase mb-0.5"
                          style={{ color: "var(--md-sys-color-on-surface-muted)" }}
                        >
                          {d.key}
                        </div>
                        <div
                          className={`text-sm stat-number font-semibold ${getScoreColor(d.score, 25)}`}
                        >
                          {d.score}
                        </div>
                      </div>
                    ))}
                  </div>

                  <ArrowRight
                    style={{ width: 16, height: 16, color: "var(--md-sys-color-on-surface-muted)", flexShrink: 0 }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
