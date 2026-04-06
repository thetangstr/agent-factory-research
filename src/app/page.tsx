import Link from "next/link";
import { getAllCompanies, getAllMarkets, getAllMatrixCells } from "@/lib/data";
import {
  Building2,
  Layers,
  TrendingUp,
  Route,
  ArrowRight,
  BarChart3,
  Shield,
  Sparkles,
} from "lucide-react";

const navCards = [
  {
    href: "/companies",
    icon: Building2,
    label: "Company Deep Dives",
    desc: "25+ enterprise agent factory platforms with capability analysis and dual-framework scoring.",
    cta: "Browse companies",
    colorVar: "--md-sys-color-primary",
    bgVar: "--md-sys-color-primary-container",
  },
  {
    href: "/companies/compare",
    icon: BarChart3,
    label: "Side-by-Side Compare",
    desc: "Select 2–4 platforms for direct comparison across all framework dimensions with radar overlays.",
    cta: "Compare platforms",
    colorVar: "--score-mid",
    bgVar: "--score-mid-bg",
  },
  {
    href: "/frameworks/pact",
    icon: Shield,
    label: "WACT 4.0 Framework",
    desc: "Evolved Workability, Access, Context, Trust framework with 40 sub-criteria for market evaluation.",
    cta: "View framework",
    colorVar: "--score-high",
    bgVar: "--score-high-bg",
  },
  {
    href: "/frameworks/product-eval",
    icon: Layers,
    label: "Product Eval Framework",
    desc: "Builder Experience, Deployment, Integration, Governance, Collaboration, and Ecosystem scoring.",
    cta: "View framework",
    colorVar: "--md-sys-color-primary",
    bgVar: "--md-sys-color-primary-container",
  },
  {
    href: "/assess",
    icon: Sparkles,
    label: "Agent Readiness Assessment",
    desc: "Paste a company description and get AI-powered analysis of agent deployment opportunities for revenue growth and cost reduction.",
    cta: "Run assessment",
    colorVar: "--md-sys-color-primary",
    bgVar: "--md-sys-color-primary-container",
  },
  {
    href: "/markets",
    icon: TrendingUp,
    label: "Vertical Markets",
    desc: "5 sector analyses with real-world examples, WACT scores, approach guidance, and consultant signals.",
    cta: "Explore markets",
    colorVar: "--score-high",
    bgVar: "--score-high-bg",
  },
  {
    href: "/cuj",
    icon: Route,
    label: "AgentDash CUJ Map",
    desc: "End-to-end customer journey: AgentDash vs. top competitors across onboarding, creation, deployment, and governance.",
    cta: "View CUJ map",
    colorVar: "--score-low",
    bgVar: "--score-low-bg",
  },
];

function getStats() {
  const companies = getAllCompanies();
  const markets = getAllMarkets();
  const matrixCells = getAllMatrixCells();
  const examples = markets.reduce((sum, m) => sum + (m.examples?.length ?? 0), 0);
  return [
    { value: String(companies.length), label: "Platforms Analyzed", colorVar: "--md-sys-color-primary" },
    { value: String(matrixCells.length), label: "Matrix Cells", colorVar: "--md-sys-color-on-surface" },
    { value: String(markets.length), label: "Vertical Markets", colorVar: "--score-mid" },
    { value: String(examples), label: "Real-World Examples", colorVar: "--md-sys-color-on-surface" },
  ];
}

const findings = [
  {
    title: "Open Source Leads in Flexibility",
    body: "Developer frameworks like LangGraph and CrewAI offer the deepest customization but require significant engineering investment. Enterprise platforms trade flexibility for faster time-to-value.",
    colorVar: "--md-sys-color-primary",
  },
  {
    title: "Trust is the #1 Design Problem",
    body: "2026 UX research shows trust as the primary hurdle. Platforms that provide transparent chain-of-thought and clean human handoffs score highest on the Trust dimension.",
    colorVar: "--score-mid",
  },
  {
    title: "Production Readiness Gap",
    body: "While 2/3 of organizations experiment with agents, fewer than 1 in 4 scale to production. State management and oversight handoffs remain critical bottlenecks.",
    colorVar: "--score-low",
  },
];

export default function Dashboard() {
  const stats = getStats();
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--md-sys-color-background)" }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--md-sys-color-primary)" }}
          >
            Intelligence Platform — 2026
          </div>
          <h1
            className="text-3xl font-bold mb-3"
            style={{
              color: "var(--md-sys-color-on-surface)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Agent Factory Research
          </h1>
          <p
            className="max-w-2xl text-base leading-relaxed"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            Comprehensive competitive analysis of enterprise agent factory
            platforms scored against WACT 4.0 and Agent Factory Evaluation Framework.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-5 rounded-xl"
              style={{
                background: "#ffffff",
                border: "1px solid var(--md-sys-color-outline)",
                boxShadow: "var(--elevation-1)",
              }}
            >
              <div
                className="stat-number font-bold leading-none mb-2"
                style={{ fontSize: 32, color: `var(${s.colorVar})` }}
              >
                {s.value}
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Nav cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group block"
                style={{ textDecoration: "none" }}
              >
                <div
                  className="h-full p-5 rounded-xl transition-shadow duration-200 hover:shadow-md"
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--md-sys-color-outline)",
                    boxShadow: "var(--elevation-1)",
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `var(${card.bgVar})`,
                        border: `1px solid var(${card.colorVar})22`,
                      }}
                    >
                      <Icon style={{ width: 16, height: 16, color: `var(${card.colorVar})` }} />
                    </div>
                    <h2
                      className="font-semibold text-base mt-0.5"
                      style={{
                        color: "var(--md-sys-color-on-surface)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {card.label}
                    </h2>
                  </div>

                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                  >
                    {card.desc}
                  </p>

                  <div
                    className="flex items-center gap-1.5 text-sm font-medium"
                    style={{ color: `var(${card.colorVar})` }}
                  >
                    {card.cta}
                    <ArrowRight style={{ width: 14, height: 14 }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Key findings */}
        <div
          className="rounded-xl p-6"
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
            Key Findings
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {findings.map((f) => (
              <div
                key={f.title}
                className="pl-4"
                style={{ borderLeft: `3px solid var(${f.colorVar})` }}
              >
                <h3
                  className="font-semibold text-sm mb-2"
                  style={{ color: "var(--md-sys-color-on-surface)" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                >
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
