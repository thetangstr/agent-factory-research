"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FrameworkScores } from "@/types";
import { getScoreColor, getProgressFillClass } from "@/lib/scoring";

interface ScoreBreakdownProps {
  scores: FrameworkScores;
  title?: string;
}

// Framework rubric descriptions for each dimension's sub-criteria
const rubricHints: Record<string, Record<string, { low: string; mid: string; high: string }>> = {
  CR: {
    "Agent Builder UX": {
      low: "Code-only, no templates, 4+ hours to first agent",
      mid: "Visual builder OR good SDK with templates, 30-120 min",
      high: "Multi-modal: visual + code + NL + marketplace, under 10 min",
    },
    "Time-to-Value": {
      low: "Weeks of setup, expert-only",
      mid: "Days to first value with moderate effort",
      high: "Hours or minutes via templates, instant production readiness",
    },
    "Debugging & Testing": {
      low: "No built-in tools, print statements only",
      mid: "Trace visualization, basic replay, manual evaluation",
      high: "Interactive debugging, regression testing, A/B testing, CI/CD",
    },
    "Documentation & Learning": {
      low: "Minimal or outdated docs",
      mid: "Complete API reference, tutorials, quickstart",
      high: "Interactive tutorials, playground, 100+ examples, certification",
    },
  },
  OR: {
    "Multi-Agent Coordination": {
      low: "Single-agent only, no multi-agent support",
      mid: "Sequential/parallel execution, basic messaging, 2-10 agents",
      high: "Dynamic topologies, hundreds of agents, fault-tolerant, visual designer",
    },
    "Human-in-the-Loop Design": {
      low: "No HITL mechanisms, fully autonomous",
      mid: "Configurable approval gates, context-rich handoff, exception routing",
      high: "Intelligent routing, adaptive autonomy, evidence-packet handoffs",
    },
    "Workflow Templates": {
      low: "No templates, build from scratch",
      mid: "10-20 templates for common use cases",
      high: "100+ templates, AI-assisted selection, community marketplace",
    },
    "Team Development": {
      low: "Single-user, no sharing or version control",
      mid: "Team workspaces, Git integration, dev/prod separation",
      high: "Real-time collaboration, code review, CI/CD pipelines",
    },
  },
  IN: {
    "Native Connectors": {
      low: "No pre-built connectors",
      mid: "20-50 native connectors with read/write",
      high: "200+ connectors with enterprise depth, legacy adapters",
    },
    "API & Protocol Standards": {
      low: "Proprietary only, no MCP or standard protocols",
      mid: "REST API, major tool-use protocols, early MCP",
      high: "Full MCP ecosystem, universal tool-use, standards contributor",
    },
    "Authentication & Access": {
      low: "Raw API keys only, no OAuth",
      mid: "OAuth 2.0, SAML, encrypted storage, basic scoping",
      high: "Enterprise IAM, JIT provisioning, per-agent least-privilege",
    },
    "Data Pipeline & RAG": {
      low: "No data pipeline, prompt-only",
      mid: "Functional RAG, multiple vector stores, configurable chunking",
      high: "Multi-modal RAG, graph knowledge, terabyte-scale retrieval",
    },
  },
  GV: {
    "Guardrails & Kill Switches": {
      low: "No kill switch or guardrails",
      mid: "Per-agent kill switch, basic input/output filtering",
      high: "Multi-level kill switches, ML-powered guardrails, circuit breakers",
    },
    "Audit Trail & Compliance": {
      low: "Minimal logging, no compliance certs",
      mid: "Comprehensive audit trail, immutable storage, SOC2 in progress",
      high: "Tamper-proof, multi-jurisdiction compliance, privacy-preserving",
    },
    "RBAC & Access Control": {
      low: "No access control, single admin",
      mid: "Role-based with custom roles, SSO",
      high: "ABAC on RBAC, dynamic permissions, automated reviews",
    },
    "Explainability & Transparency": {
      low: "Black box, no reasoning visibility",
      mid: "Trace logs, technical teams can follow chain",
      high: "Plain-language explanations, confidence scores, citations",
    },
  },
  OP: {
    "Deployment Flexibility": {
      low: "Single deployment mode, no containers",
      mid: "Cloud + self-hosted, Docker, basic K8s",
      high: "Full spectrum: SaaS, Helm, K8s-native, serverless, FedRAMP",
    },
    "Scaling & Monitoring": {
      low: "No scaling, no monitoring",
      mid: "Auto-scaling, dozens of agents, basic dashboard and alerting",
      high: "Hyperscale, ML anomaly detection, predictive alerting",
    },
    "Cost Management": {
      low: "No cost tracking",
      mid: "Token/cost tracking per agent, budget alerts",
      high: "Real-time tracking, predictive modeling, ROI tracking",
    },
    "Ecosystem Maturity": {
      low: "Minimal community, unfunded, no enterprise customers",
      mid: "Growing community, Series A+, 10+ enterprise customers",
      high: "Industry-defining, major backing, 200+ enterprise customers",
    },
  },
};

export default function ScoreBreakdown({ scores, title }: ScoreBreakdownProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {scores.dimensions.map((dim) => (
        <div key={dim.key}>
          {/* Dimension header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center rounded-md text-xs font-bold w-8 h-6"
                style={{
                  background: "var(--md-sys-color-primary)",
                  color: "#ffffff",
                }}
              >
                {dim.key}
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--md-sys-color-on-surface)" }}
              >
                {dim.name}
              </span>
            </div>
            <span
              className={`text-sm font-bold stat-number ${getScoreColor(dim.score, 20)}`}
            >
              {Math.round(dim.score * 10) / 10}/20
            </span>
          </div>

          {/* Progress bar */}
          <div className="progress-track mb-2">
            <div
              className={getProgressFillClass(dim.score, 20)}
              style={{ width: `${(dim.score / 20) * 100}%` }}
            />
          </div>

          {/* Sub-criteria */}
          <div className="space-y-0.5 ml-1">
            {dim.subCriteria.map((sc) => {
              const isExpanded = expanded === `${dim.key}-${sc.name}`;
              const hints = rubricHints[dim.key]?.[sc.name];

              return (
                <div key={sc.name}>
                  <button
                    onClick={() =>
                      setExpanded(isExpanded ? null : `${dim.key}-${sc.name}`)
                    }
                    className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors hover:bg-gray-50 group"
                    style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                  >
                    <span className="flex items-center gap-1.5">
                      <ChevronDown
                        className="transition-transform"
                        style={{
                          width: 12,
                          height: 12,
                          transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                          color: "var(--md-sys-color-on-surface-muted)",
                        }}
                      />
                      {sc.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Mini score dots */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div
                            key={n}
                            className="rounded-full"
                            style={{
                              width: 6,
                              height: 6,
                              background:
                                n <= sc.score
                                  ? sc.score >= 4
                                    ? "var(--score-high)"
                                    : sc.score >= 3
                                    ? "var(--score-mid)"
                                    : "var(--score-low)"
                                  : "var(--md-sys-color-outline)",
                            }}
                          />
                        ))}
                      </div>
                      <span className="stat-number font-medium w-6 text-right">
                        {sc.score}/5
                      </span>
                    </div>
                  </button>

                  {/* Expanded rationale */}
                  {isExpanded && (
                    <div
                      className="ml-6 mr-2 mb-2 p-3 rounded-lg text-xs leading-relaxed"
                      style={{
                        background: "var(--md-sys-color-surface-container)",
                        border: "1px solid var(--md-sys-color-outline)",
                      }}
                    >
                      <p
                        className="font-medium mb-2"
                        style={{ color: "var(--md-sys-color-on-surface)" }}
                      >
                        {sc.rationale}
                      </p>

                      {hints && (
                        <div
                          className="pt-2 mt-2 space-y-1"
                          style={{
                            borderTop: "1px solid var(--md-sys-color-outline)",
                          }}
                        >
                          <p
                            className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                            style={{ color: "var(--md-sys-color-on-surface-muted)" }}
                          >
                            Rubric
                          </p>
                          <div className="flex items-start gap-1.5">
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold flex-shrink-0"
                              style={{
                                background: "var(--score-low-bg)",
                                color: "var(--score-low)",
                                border: "1px solid var(--score-low-border)",
                              }}
                            >
                              1
                            </span>
                            <span style={{ color: "var(--md-sys-color-on-surface-muted)" }}>
                              {hints.low}
                            </span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold flex-shrink-0"
                              style={{
                                background: "var(--score-mid-bg)",
                                color: "var(--score-mid)",
                                border: "1px solid var(--score-mid-border)",
                              }}
                            >
                              3
                            </span>
                            <span style={{ color: "var(--md-sys-color-on-surface-muted)" }}>
                              {hints.mid}
                            </span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold flex-shrink-0"
                              style={{
                                background: "var(--score-high-bg)",
                                color: "var(--score-high)",
                                border: "1px solid var(--score-high-border)",
                              }}
                            >
                              5
                            </span>
                            <span style={{ color: "var(--md-sys-color-on-surface-muted)" }}>
                              {hints.high}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
