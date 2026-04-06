import Link from "next/link";
import { ArrowRight, BarChart3, Shield, Sparkles, Building2, Layers, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "25+ Platforms Analyzed",
    desc: "Deep-dive profiles on every major agent factory platform, from open-source frameworks to enterprise SaaS.",
  },
  {
    icon: Shield,
    title: "Dual-Framework Scoring",
    desc: "Every platform scored against WACT 4.0 and the Agent Factory Evaluation Framework with 40+ sub-criteria.",
  },
  {
    icon: BarChart3,
    title: "Side-by-Side Comparison",
    desc: "Select platforms for direct comparison with radar overlays across all framework dimensions.",
  },
  {
    icon: TrendingUp,
    title: "Vertical Market Analysis",
    desc: "Sector-specific analyses with real-world deployment examples and approach guidance.",
  },
  {
    icon: Layers,
    title: "Industry x Function Matrix",
    desc: "Navigate agent opportunities across industries and business functions with readiness scores.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Assessment",
    desc: "Instant agent readiness analysis for any company, powered by the full research dataset.",
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--md-sys-color-background)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
            style={{
              background: "var(--md-sys-color-primary)",
              color: "var(--md-sys-color-on-primary)",
            }}
          >
            AF
          </div>
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            Agent Factory Research
          </span>
        </div>
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            background: "var(--md-sys-color-primary)",
            color: "var(--md-sys-color-on-primary)",
            textDecoration: "none",
          }}
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <div className="max-w-screen-xl mx-auto px-6 pt-16 pb-20 text-center">
        <div
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
          style={{
            background: "var(--md-sys-color-primary-container)",
            color: "var(--md-sys-color-primary)",
          }}
        >
          Intelligence Platform
        </div>
        <h1
          className="text-4xl sm:text-5xl font-bold mb-5 max-w-3xl mx-auto"
          style={{
            color: "var(--md-sys-color-on-surface)",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}
        >
          The definitive guide to enterprise agent factories
        </h1>
        <p
          className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          Comprehensive competitive research on 25+ agent factory platforms,
          scored against rigorous evaluation frameworks. Built for teams
          evaluating, building, and selling AI agent solutions.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--md-sys-color-primary)",
              color: "var(--md-sys-color-on-primary)",
              textDecoration: "none",
            }}
          >
            Get started
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </div>

      {/* Features grid */}
      <div
        className="py-16"
        style={{ background: "var(--md-sys-color-surface-variant)", opacity: 0.6 }}
      >
        <div style={{ opacity: 1 / 0.6 }}>
          <div className="max-w-screen-xl mx-auto px-6">
            <h2
              className="text-2xl font-bold mb-2 text-center"
              style={{ color: "var(--md-sys-color-on-surface)", letterSpacing: "-0.02em" }}
            >
              Everything you need to evaluate the market
            </h2>
            <p
              className="text-sm text-center mb-10 max-w-lg mx-auto"
              style={{ color: "var(--md-sys-color-on-surface-variant)" }}
            >
              Research-backed analysis across platforms, markets, and use cases.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="p-5 rounded-xl"
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--md-sys-color-outline)",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{
                        background: "var(--md-sys-color-primary-container)",
                      }}
                    >
                      <Icon
                        style={{
                          width: 16,
                          height: 16,
                          color: "var(--md-sys-color-primary)",
                        }}
                      />
                    </div>
                    <h3
                      className="font-semibold text-sm mb-1.5"
                      style={{ color: "var(--md-sys-color-on-surface)" }}
                    >
                      {f.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                    >
                      {f.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-10 text-center">
        <p className="text-xs" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
          Agent Factory Research
        </p>
      </div>
    </div>
  );
}
