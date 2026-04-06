import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, Shield } from "lucide-react";
import { getCompanyBySlug, getAllCompanies } from "@/lib/data";
import { getScoreColor, getProgressFillClass, formatScore, getScoreCssColor } from "@/lib/scoring";
import { getCategoryLabel, getCategoryColor } from "@/lib/filtering";
import ScoreRadar from "@/components/charts/ScoreRadar";
import ScoreCard from "@/components/cards/ScoreCard";
import ProductWalkthrough from "@/components/cards/ProductWalkthrough";
import ScoreBreakdown from "@/components/cards/ScoreBreakdown";

export async function generateStaticParams() {
  const companies = getAllCompanies();
  return companies.map((c) => ({ slug: c.slug }));
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  const backLink = (
    <Link
      href="/companies"
      className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors"
      style={{
        color: "var(--md-sys-color-primary)",
        textDecoration: "none",
      }}
    >
      <ArrowLeft style={{ width: 15, height: 15 }} />
      Back to Companies
    </Link>
  );

  if (!company) {
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
              {slug.replace(/-/g, " ")}
            </h1>
            <p style={{ color: "var(--md-sys-color-on-surface-variant)", fontSize: 14 }}>
              Research data for this company will appear once the deep dive is complete.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalPct = company.scores.total / 100;
  const accentColor = getScoreCssColor(company.scores.total, 100);

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
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1
                  className="text-2xl font-bold"
                  style={{ color: "var(--md-sys-color-on-surface)", letterSpacing: "-0.02em" }}
                >
                  {company.name}
                </h1>
                <span
                  className={`inline-flex rounded-full px-3 py-0.5 text-xs font-medium ${getCategoryColor(company.category)}`}
                >
                  {getCategoryLabel(company.category)}
                </span>
                {company.confidenceLevel !== "high" && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-medium"
                    style={{
                      background: "var(--score-mid-bg)",
                      color: "var(--score-mid)",
                      border: "1px solid var(--score-mid-border)",
                    }}
                  >
                    <Shield style={{ width: 11, height: 11 }} />
                    {company.confidenceLevel} confidence
                  </span>
                )}
              </div>
              <p
                className="text-base leading-relaxed max-w-2xl mb-4"
                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
              >
                {company.description}
              </p>
              <div className="flex items-center gap-5 flex-wrap">
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{ color: "var(--md-sys-color-primary)", textDecoration: "none" }}
                >
                  {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  <ExternalLink style={{ width: 12, height: 12 }} />
                </a>
                {company.githubRepo && (
                  <a
                    href={`https://github.com/${company.githubRepo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors"
                    style={{ color: "var(--md-sys-color-on-surface-variant)", textDecoration: "none" }}
                  >
                    GitHub{company.githubStars ? ` (${(company.githubStars / 1000).toFixed(1)}k ★)` : ""}
                  </a>
                )}
                {company.pricing && (
                  <span className="text-sm" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>
                    {company.pricing}
                  </span>
                )}
              </div>
            </div>

            {/* Big score */}
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
                className={`stat-number font-bold leading-none ${getScoreColor(company.scores.total, 100)}`}
                style={{ fontSize: 56 }}
              >
                {company.scores.total}
              </div>
              <div
                className="text-xs font-medium uppercase tracking-wide mt-1"
                style={{ color: "var(--md-sys-color-on-surface-muted)" }}
              >
                out of 100
              </div>
              <div
                className="flex items-center gap-1.5 mt-2 justify-center text-xs"
                style={{ color: "var(--md-sys-color-on-surface-muted)" }}
              >
                <Calendar style={{ width: 11, height: 11 }} />
                {company.lastResearched}
              </div>
            </div>
          </div>
        </div>

        {/* Score dimension cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-5">
          <ScoreCard label="Total" score={company.scores.total} max={100} />
          {company.scores.dimensions.map((d) => (
            <ScoreCard key={d.key} label={d.name} score={Math.round(d.score)} max={20} />
          ))}
        </div>

        {/* Radar + Dimension breakdown */}
        <div className="grid lg:grid-cols-2 gap-5 mb-5">
          <div
            className="rounded-xl p-5"
            style={{
              background: "#ffffff",
              border: "1px solid var(--md-sys-color-outline)",
              boxShadow: "var(--elevation-1)",
            }}
          >
            <h2
              className="text-sm font-semibold mb-1"
              style={{ color: "var(--md-sys-color-on-surface)" }}
            >
              Agent Factory Score
            </h2>
            <p
              className="text-xs mb-4"
              style={{ color: "var(--md-sys-color-on-surface-muted)" }}
            >
              5 dimensions: Creation · Orchestration · Integration · Governance · Operations
            </p>
            <ScoreRadar scores={[company.scores]} labels={[company.name]} size={300} />
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
              className="text-sm font-semibold mb-1"
              style={{ color: "var(--md-sys-color-on-surface)" }}
            >
              Dimension Breakdown
            </h2>
            <p
              className="text-xs mb-4"
              style={{ color: "var(--md-sys-color-on-surface-muted)" }}
            >
              Click any sub-criterion to see the scoring rationale and rubric
            </p>
            <ScoreBreakdown scores={company.scores} />
            {company.scoringRationale && (
              <p
                className="mt-5 text-xs leading-relaxed pt-4"
                style={{
                  color: "var(--md-sys-color-on-surface-muted)",
                  borderTop: "1px solid var(--md-sys-color-outline-variant)",
                }}
              >
                {company.scoringRationale}
              </p>
            )}
          </div>
        </div>

        {/* How It Works + Video Reviews */}
        <div className="mb-5">
          <ProductWalkthrough
            walkthrough={company.walkthrough}
            youtubeReviews={company.youtubeReviews}
            companyName={company.name}
          />
        </div>

        {/* UX Analysis + Capabilities */}
        <div className="grid lg:grid-cols-2 gap-5 mb-5">
          <div
            className="rounded-xl p-5"
            style={{
              background: "#ffffff",
              border: "1px solid var(--md-sys-color-outline)",
              boxShadow: "var(--elevation-1)",
            }}
          >
            <h2
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--md-sys-color-on-surface)" }}
            >
              UX Analysis
            </h2>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "var(--md-sys-color-on-surface-variant)" }}
            >
              {company.uxAnalysis.builderFlow}
            </p>
            <div className="space-y-4">
              <div>
                <div
                  className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5"
                  style={{ color: "var(--score-high)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--score-high)" }} />
                  Strengths
                </div>
                <ul className="space-y-1.5">
                  {company.uxAnalysis.strengths.map((s, i) => (
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
              <div>
                <div
                  className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5"
                  style={{ color: "var(--score-low)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--score-low)" }} />
                  Weaknesses
                </div>
                <ul className="space-y-1.5">
                  {company.uxAnalysis.weaknesses.map((w, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-sm"
                      style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                    >
                      <span style={{ color: "var(--score-low)", flexShrink: 0, marginTop: 1 }}>✕</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div
                  className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5"
                  style={{ color: "var(--md-sys-color-primary)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--md-sys-color-primary)" }} />
                  Notable Features
                </div>
                <ul className="space-y-1.5">
                  {company.uxAnalysis.notableFeatures.map((f, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-sm"
                      style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                    >
                      <span style={{ color: "var(--md-sys-color-primary)", flexShrink: 0, marginTop: 1 }}>◆</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div
              className="rounded-xl p-5"
              style={{
                background: "#ffffff",
                border: "1px solid var(--md-sys-color-outline)",
                boxShadow: "var(--elevation-1)",
              }}
            >
              <h2
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--md-sys-color-on-surface)" }}
              >
                Capabilities
              </h2>
              <div className="flex flex-wrap gap-2">
                {company.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      background: "var(--md-sys-color-primary-container)",
                      color: "var(--md-sys-color-on-primary-container)",
                    }}
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {company.recentDevelopments.length > 0 && (
              <div
                className="rounded-xl p-5"
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--md-sys-color-outline)",
                  boxShadow: "var(--elevation-1)",
                }}
              >
                <h2
                  className="text-sm font-semibold mb-3"
                  style={{ color: "var(--md-sys-color-on-surface)" }}
                >
                  Recent Developments
                </h2>
                <ol className="space-y-2">
                  {company.recentDevelopments.map((d, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm"
                      style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                    >
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5"
                        style={{
                          background: "var(--md-sys-color-primary-container)",
                          color: "var(--md-sys-color-primary)",
                        }}
                      >
                        {i + 1}
                      </span>
                      {d}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Market Intelligence */}
        {company.marketIntelligence && (
          <div className="grid lg:grid-cols-2 gap-5 mb-5">
            {company.marketIntelligence.communityBuzz && company.marketIntelligence.communityBuzz.length > 0 && (
              <div
                className="rounded-xl p-5"
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--md-sys-color-outline)",
                  boxShadow: "var(--elevation-1)",
                }}
              >
                <h2
                  className="text-sm font-semibold mb-3"
                  style={{ color: "var(--md-sys-color-on-surface)" }}
                >
                  Community Buzz
                </h2>
                <ul className="space-y-2.5">
                  {company.marketIntelligence.communityBuzz.map((buzz, i) => (
                    <li
                      key={i}
                      className="text-sm leading-relaxed flex gap-2.5"
                      style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                    >
                      <span
                        className="flex-shrink-0 mt-1 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: "var(--md-sys-color-primary-container)", color: "var(--md-sys-color-primary)", fontSize: 10 }}
                      >
                        ▸
                      </span>
                      {buzz}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(company.marketIntelligence.reviews || company.marketIntelligence.metrics) && (
              <div
                className="rounded-xl p-5"
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--md-sys-color-outline)",
                  boxShadow: "var(--elevation-1)",
                }}
              >
                {company.marketIntelligence.reviews && company.marketIntelligence.reviews.length > 0 && (
                  <>
                    <h2
                      className="text-sm font-semibold mb-3"
                      style={{ color: "var(--md-sys-color-on-surface)" }}
                    >
                      Reviews
                    </h2>
                    <div className="space-y-3 mb-5">
                      {company.marketIntelligence.reviews.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-lg p-3"
                          style={{
                            background: "var(--score-mid-bg)",
                            border: "1px solid var(--score-mid-border)",
                          }}
                        >
                          <span
                            className="font-bold stat-number flex-shrink-0"
                            style={{ color: "var(--score-mid)", fontSize: 20 }}
                          >
                            {r.rating}
                          </span>
                          <div>
                            <div
                              className="text-sm font-medium"
                              style={{ color: "var(--md-sys-color-on-surface)" }}
                            >
                              {r.source}{r.reviewCount ? ` (${r.reviewCount} reviews)` : ""}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "var(--md-sys-color-on-surface-muted)" }}
                            >
                              {r.summary}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {company.marketIntelligence.metrics && company.marketIntelligence.metrics.length > 0 && (
                  <>
                    <h2
                      className="text-sm font-semibold mb-3"
                      style={{ color: "var(--md-sys-color-on-surface)" }}
                    >
                      Key Metrics
                    </h2>
                    <div className="space-y-0">
                      {company.marketIntelligence.metrics.map((m, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm py-2"
                          style={{
                            color: "var(--md-sys-color-on-surface-variant)",
                            borderBottom: "1px solid var(--md-sys-color-outline-variant)",
                          }}
                        >
                          <span>{m.metric}</span>
                          <span
                            className="stat-number font-semibold"
                            style={{ color: "var(--md-sys-color-on-surface)" }}
                          >
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Data Sources */}
        {company.dataSources.length > 0 && (
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
              Data Sources
            </h2>
            <div className="space-y-2">
              {company.dataSources.map((ds, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm py-2"
                  style={{
                    color: "var(--md-sys-color-on-surface-muted)",
                    borderBottom: "1px solid var(--md-sys-color-outline-variant)",
                  }}
                >
                  <span
                    className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase flex-shrink-0"
                    style={{
                      background: "var(--md-sys-color-surface-variant)",
                      color: "var(--md-sys-color-on-surface-variant)",
                      border: "1px solid var(--md-sys-color-outline)",
                    }}
                  >
                    {ds.type}
                  </span>
                  <a
                    href={ds.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate"
                    style={{ color: "var(--md-sys-color-primary)", textDecoration: "none" }}
                  >
                    {ds.url}
                  </a>
                  <span className="flex-shrink-0 text-xs">
                    {ds.accessedAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
