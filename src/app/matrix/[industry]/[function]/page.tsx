import Link from "next/link";
import { ArrowLeft, Target, Shield, Clock, DollarSign, Users, AlertTriangle, TrendingUp, BookOpen, Zap, Building2 } from "lucide-react";
import { getMatrixCell, getCompanyBySlug, getAllMatrixCells } from "@/lib/data";

export async function generateStaticParams() {
  const cells = getAllMatrixCells();
  return cells.map((c) => ({ industry: c.industrySlug, function: c.functionSlug }));
}

const card: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid var(--md-sys-color-outline)",
  boxShadow: "var(--elevation-1)",
  borderRadius: 12,
};

const sectionTitle = (icon: React.ReactNode, title: string, color?: string) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: color ? `${color}18` : "var(--md-sys-color-primary-container)", color: color || "var(--md-sys-color-primary)" }}>
      {icon}
    </div>
    <h2 className="text-base font-semibold" style={{ color: "var(--md-sys-color-on-surface)" }}>{title}</h2>
  </div>
);

export default async function MatrixCellPage({ params }: { params: Promise<{ industry: string; function: string }> }) {
  const { industry, function: fn } = await params;
  const cell = getMatrixCell(industry, fn);

  if (!cell) {
    return (
      <div className="min-h-screen" style={{ background: "var(--md-sys-color-background)" }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/matrix" className="inline-flex items-center gap-1.5 text-sm font-medium mb-6" style={{ color: "var(--md-sys-color-primary)", textDecoration: "none" }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Back to Matrix
          </Link>
          <div style={card} className="p-10 text-center">
            <h1 className="text-xl font-bold capitalize mb-2" style={{ color: "var(--md-sys-color-on-surface)" }}>
              {industry.replace(/-/g, " ")} × {fn.replace(/-/g, " ")}
            </h1>
            <p style={{ color: "var(--md-sys-color-on-surface-variant)", fontSize: 14 }}>This cell has not been researched yet.</p>
          </div>
        </div>
      </div>
    );
  }

  const scoreColor = cell.disruptionScore >= 7 ? "var(--score-high)" : cell.disruptionScore >= 4 ? "var(--score-mid)" : "var(--score-low)";
  const scoreBg = cell.disruptionScore >= 7 ? "var(--score-high-bg)" : cell.disruptionScore >= 4 ? "var(--score-mid-bg)" : "var(--score-low-bg)";
  const scoreBorder = cell.disruptionScore >= 7 ? "var(--score-high-border)" : cell.disruptionScore >= 4 ? "var(--score-mid-border)" : "var(--score-low-border)";
  const pb = cell.playbook;

  return (
    <div className="min-h-screen" style={{ background: "var(--md-sys-color-background)" }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/matrix" className="inline-flex items-center gap-1.5 text-sm font-medium mb-6" style={{ color: "var(--md-sys-color-primary)", textDecoration: "none" }}>
          <ArrowLeft style={{ width: 15, height: 15 }} /> Back to Matrix
        </Link>

        {/* Hero */}
        <div style={{ ...card, borderTop: `3px solid ${scoreColor}`, boxShadow: "var(--elevation-2)" }} className="p-6 mb-5">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--md-sys-color-primary)" }}>
                Agentification Playbook
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--md-sys-color-on-surface)", letterSpacing: "-0.02em" }}>
                {cell.industry} × {cell.jobFunction}
              </h1>
              <p className="text-base leading-relaxed max-w-2xl" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
                {cell.summary}
              </p>
              {cell.tier === "deep" && (
                <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium mt-3" style={{ background: "var(--md-sys-color-primary-container)", color: "var(--md-sys-color-primary)" }}>
                  Full Strategic Assessment
                </span>
              )}
            </div>
            <div className="flex-shrink-0 text-center rounded-2xl px-6 py-4" style={{ background: scoreBg, border: `1px solid ${scoreBorder}` }}>
              <div className="stat-number font-bold leading-none" style={{ fontSize: 48, color: scoreColor }}>{cell.disruptionScore}</div>
              <div className="text-xs font-medium uppercase tracking-wide mt-1" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>Disruption<br/>Score /10</div>
            </div>
          </div>
        </div>

        {/* Current State */}
        {pb?.currentState && (
          <div style={card} className="p-5 mb-5">
            {sectionTitle(<BookOpen style={{ width: 16, height: 16 }} />, "How This Work Is Done Today")}
            <p className="text-sm leading-relaxed" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{pb.currentState}</p>
          </div>
        )}

        {/* Market Sizing */}
        {pb?.marketSizing && (
          <div style={card} className="p-5 mb-5">
            {sectionTitle(<DollarSign style={{ width: 16, height: 16 }} />, "Market Sizing", "#1e8a3c")}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "TAM", sublabel: "Total Addressable Market", value: pb.marketSizing.tam },
                { label: "SAM", sublabel: "Serviceable Addressable Market", value: pb.marketSizing.sam },
                { label: "SOM", sublabel: "Serviceable Obtainable Market", value: pb.marketSizing.som },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-4" style={{ background: "var(--score-high-bg)", border: "1px solid var(--score-high-border)" }}>
                  <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--score-high)" }}>{m.label}</div>
                  <div className="text-[10px] uppercase tracking-wide mb-2" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>{m.sublabel}</div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--md-sys-color-on-surface)" }}>{m.value}</p>
                </div>
              ))}
            </div>
            {pb.marketSizing.source && <p className="text-xs mt-3" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>Source: {pb.marketSizing.source}</p>}
          </div>
        )}

        {/* Workflows */}
        <div style={card} className="p-5 mb-5">
          {sectionTitle(<Zap style={{ width: 16, height: 16 }} />, "Workflows Agents Can Transform", "#b45309")}
          <div className="space-y-3">
            {cell.workflows.map((wf, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: "var(--md-sys-color-surface-variant)", border: "1px solid var(--md-sys-color-outline-variant)" }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold" style={{ color: "var(--md-sys-color-on-surface)" }}>{wf.name}</h3>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{
                    background: wf.agentPotential === "high" ? "var(--score-high-bg)" : wf.agentPotential === "medium" ? "var(--score-mid-bg)" : "var(--score-low-bg)",
                    color: wf.agentPotential === "high" ? "var(--score-high)" : wf.agentPotential === "medium" ? "var(--score-mid)" : "var(--score-low)",
                    border: `1px solid ${wf.agentPotential === "high" ? "var(--score-high-border)" : wf.agentPotential === "medium" ? "var(--score-mid-border)" : "var(--score-low-border)"}`,
                  }}>{wf.agentPotential} potential</span>
                </div>
                <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{wf.description}</p>
                <p className="text-xs" style={{ color: "var(--md-sys-color-on-surface-muted)" }}><strong>Current pain:</strong> {wf.currentPain}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Entry Wedge + ICP */}
        {pb && (pb.entryWedge || pb.idealCustomerProfile) && (
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {pb.entryWedge && (
              <div style={card} className="p-5">
                {sectionTitle(<Target style={{ width: 16, height: 16 }} />, "Entry Wedge", "#3f51b5")}
                <div className="space-y-3">
                  <div><div className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--md-sys-color-primary)" }}>Starting Workflow</div>
                    <p className="text-sm" style={{ color: "var(--md-sys-color-on-surface)" }}>{pb.entryWedge.workflow}</p></div>
                  <div><div className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--md-sys-color-primary)" }}>Why This First</div>
                    <p className="text-sm" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{pb.entryWedge.why}</p></div>
                  <div><div className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--md-sys-color-primary)" }}>Proof of Concept</div>
                    <p className="text-sm" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{pb.entryWedge.proofOfConcept}</p></div>
                  <div className="rounded-lg p-3" style={{ background: "var(--md-sys-color-primary-container)" }}>
                    <div className="text-xs font-semibold uppercase mb-0.5" style={{ color: "var(--md-sys-color-primary)" }}>Time to Value</div>
                    <p className="text-sm font-medium" style={{ color: "var(--md-sys-color-on-primary-container)" }}>{pb.entryWedge.timeToValue}</p>
                  </div>
                </div>
              </div>
            )}
            {pb.idealCustomerProfile && (
              <div style={card} className="p-5">
                {sectionTitle(<Users style={{ width: 16, height: 16 }} />, "Ideal Customer Profile", "#6d28d9")}
                {Object.entries(pb.idealCustomerProfile).map(([key, val]) => (
                  <div key={key} className="mb-3">
                    <div className="text-xs font-semibold uppercase mb-0.5" style={{ color: "#6d28d9" }}>{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <p className="text-sm" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{val}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Success Metrics */}
        {pb?.successMetrics && pb.successMetrics.length > 0 && (
          <div style={card} className="p-5 mb-5">
            {sectionTitle(<TrendingUp style={{ width: 16, height: 16 }} />, "Success Metrics", "#1e8a3c")}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--md-sys-color-outline)" }}>
                    <th className="text-left pb-3 font-semibold" style={{ color: "var(--md-sys-color-on-surface)" }}>Metric</th>
                    <th className="text-left pb-3 font-semibold" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>Baseline</th>
                    <th className="text-left pb-3 font-semibold" style={{ color: "var(--score-high)" }}>Target</th>
                    <th className="text-left pb-3 font-semibold" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>Timeframe</th>
                  </tr>
                </thead>
                <tbody>
                  {pb.successMetrics.map((m, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--md-sys-color-outline-variant)" }}>
                      <td className="py-2.5 font-medium" style={{ color: "var(--md-sys-color-on-surface)" }}>{m.metric}</td>
                      <td className="py-2.5" style={{ color: "var(--score-low)" }}>{m.baseline}</td>
                      <td className="py-2.5 font-medium" style={{ color: "var(--score-high)" }}>{m.target}</td>
                      <td className="py-2.5" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>{m.timeframe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Risk Assessment */}
        {pb?.riskAssessment && pb.riskAssessment.length > 0 && (
          <div style={card} className="p-5 mb-5">
            {sectionTitle(<AlertTriangle style={{ width: 16, height: 16 }} />, "Risk Assessment", "#c0392b")}
            <div className="space-y-3">
              {pb.riskAssessment.map((r, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: r.severity === "high" ? "var(--score-low-bg)" : r.severity === "medium" ? "var(--score-mid-bg)" : "var(--score-high-bg)", border: `1px solid ${r.severity === "high" ? "var(--score-low-border)" : r.severity === "medium" ? "var(--score-mid-border)" : "var(--score-high-border)"}` }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: r.severity === "high" ? "var(--score-low)" : r.severity === "medium" ? "var(--score-mid)" : "var(--score-high)", color: "#fff" }}>{r.severity}</span>
                    <span className="text-sm font-medium" style={{ color: "var(--md-sys-color-on-surface)" }}>{r.risk}</span>
                  </div>
                  <p className="text-xs leading-relaxed ml-0" style={{ color: "var(--md-sys-color-on-surface-variant)" }}><strong>Mitigation:</strong> {r.mitigation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buyer Journey */}
        {pb?.buyerJourney && pb.buyerJourney.length > 0 && (
          <div style={card} className="p-5 mb-5">
            {sectionTitle(<Users style={{ width: 16, height: 16 }} />, "Buyer Journey", "#3f51b5")}
            <div className="space-y-0">
              {pb.buyerJourney.map((s, i) => (
                <div key={i} className="flex gap-4 relative pb-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--md-sys-color-primary)", color: "#fff" }}>{i + 1}</div>
                    {i < pb.buyerJourney!.length - 1 && <div className="w-0.5 flex-1 mt-1" style={{ background: "var(--md-sys-color-outline-variant)" }} />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="text-sm font-semibold mb-0.5" style={{ color: "var(--md-sys-color-on-surface)" }}>{s.stage}</div>
                    <p className="text-sm mb-1" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{s.action}</p>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--md-sys-color-surface-variant)", color: "var(--md-sys-color-on-surface-muted)" }}>{s.stakeholder}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deployment Timeline */}
        {pb?.deploymentTimeline && pb.deploymentTimeline.length > 0 && (
          <div style={card} className="p-5 mb-5">
            {sectionTitle(<Clock style={{ width: 16, height: 16 }} />, "Deployment Timeline", "#b45309")}
            <div className="space-y-2">
              {pb.deploymentTimeline.map((p, i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg p-3" style={{ background: "var(--md-sys-color-surface-variant)" }}>
                  <div className="text-xs font-bold stat-number flex-shrink-0 w-16 text-center" style={{ color: "var(--score-mid)" }}>{p.duration}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: "var(--md-sys-color-on-surface)" }}>{p.phase}</div>
                    <div className="text-xs" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>{p.milestone}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform Fit */}
        {cell.platformFit && cell.platformFit.length > 0 && (
          <div style={card} className="p-5 mb-5">
            {sectionTitle(<Building2 style={{ width: 16, height: 16 }} />, "Best Platforms for This Workflow")}
            <div className="space-y-2">
              {cell.platformFit.map((pf) => {
                const company = getCompanyBySlug(pf.companySlug);
                return (
                  <Link key={pf.companySlug} href={`/companies/${pf.companySlug}`} className="flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-gray-50" style={{ border: "1px solid var(--md-sys-color-outline-variant)", textDecoration: "none" }}>
                    <div>
                      <span className="text-sm font-semibold" style={{ color: "var(--md-sys-color-on-surface)" }}>{company?.name ?? pf.companySlug}</span>
                      <p className="text-xs mt-0.5" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>{pf.rationale}</p>
                    </div>
                    <div className="stat-number font-bold text-base flex-shrink-0 ml-4" style={{ color: pf.fitScore >= 4 ? "var(--score-high)" : pf.fitScore >= 3 ? "var(--score-mid)" : "var(--score-low)" }}>{pf.fitScore}/5</div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Competitive Landscape + Pricing Model */}
        {pb && (pb.competitiveLandscape || pb.pricingModel) && (
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {pb.competitiveLandscape && (
              <div style={card} className="p-5">
                {sectionTitle(<Shield style={{ width: 16, height: 16 }} />, "Competitive Landscape")}
                <p className="text-sm leading-relaxed" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{pb.competitiveLandscape}</p>
              </div>
            )}
            {pb.pricingModel && (
              <div style={card} className="p-5">
                {sectionTitle(<DollarSign style={{ width: 16, height: 16 }} />, "Pricing Model Recommendation")}
                <p className="text-sm leading-relaxed" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{pb.pricingModel}</p>
              </div>
            )}
          </div>
        )}

        {/* Business Outcome + Obstacles + Regulatory */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {cell.businessOutcome && (
            <div style={card} className="p-5">
              {sectionTitle(<TrendingUp style={{ width: 16, height: 16 }} />, "Expected Business Impact", "#1e8a3c")}
              <p className="text-sm leading-relaxed" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{cell.businessOutcome}</p>
            </div>
          )}
          {cell.obstacles && cell.obstacles.length > 0 && (
            <div style={card} className="p-5">
              {sectionTitle(<AlertTriangle style={{ width: 16, height: 16 }} />, "Obstacles & Challenges", "#c0392b")}
              <ul className="space-y-1.5">
                {cell.obstacles.map((o, i) => (
                  <li key={i} className="text-sm flex gap-2" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
                    <span style={{ color: "var(--score-mid)", flexShrink: 0 }}>!</span> {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Regulatory */}
        {pb?.regulatoryConsiderations && pb.regulatoryConsiderations.length > 0 && (
          <div style={card} className="p-5 mb-5">
            {sectionTitle(<Shield style={{ width: 16, height: 16 }} />, "Regulatory Considerations", "#c0392b")}
            <ul className="space-y-2">
              {pb.regulatoryConsiderations.map((r, i) => (
                <li key={i} className="text-sm leading-relaxed flex gap-2" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
                  <span className="text-xs font-bold rounded-full px-1.5 py-0.5 flex-shrink-0 mt-0.5" style={{ background: "var(--score-low-bg)", color: "var(--score-low)", border: "1px solid var(--score-low-border)" }}>§</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Real-World Examples */}
        {cell.examples && cell.examples.length > 0 && (
          <div style={card} className="p-5 mb-5">
            {sectionTitle(<BookOpen style={{ width: 16, height: 16 }} />, "Real-World Examples")}
            <ul className="space-y-3">
              {cell.examples.map((ex, i) => (
                <li key={i} className="text-sm leading-relaxed border-l-2 pl-4" style={{ color: "var(--md-sys-color-on-surface-variant)", borderColor: "var(--md-sys-color-primary)" }}>{ex}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
