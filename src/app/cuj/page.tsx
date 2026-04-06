import Link from "next/link";
import {
  Rocket,
  Settings,
  Hammer,
  Users,
  Plug,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Headphones,
  Monitor,
  Code2,
  Search,
  Phone,
  Workflow,
  Server,
  Target,
  Lock,
  FileText,
} from "lucide-react";
import { getAllCUJs, getCompaniesByCUJ } from "@/lib/data";
import { getScoreCssColor } from "@/lib/scoring";

const cujIcons: Record<string, typeof Headphones> = {
  "customer-support": Headphones,
  "it-helpdesk": Monitor,
  "code-development": Code2,
  "data-extraction": Search,
  "voice-telephony": Phone,
  "workflow-automation": Workflow,
  "devops-infra": Server,
  "sales-outreach": Target,
  "security-monitoring": Lock,
  "content-generation": FileText,
};

const cujColors: Record<string, { color: string; bg: string; border: string }> = {
  "customer-support": { color: "#1565c0", bg: "#e3f2fd", border: "#90caf9" },
  "it-helpdesk": { color: "#6a1b9a", bg: "#f3e5f5", border: "#ce93d8" },
  "code-development": { color: "#2e7d32", bg: "#e8f5e9", border: "#a5d6a7" },
  "data-extraction": { color: "#e65100", bg: "#fff3e0", border: "#ffcc80" },
  "voice-telephony": { color: "#00838f", bg: "#e0f7fa", border: "#80deea" },
  "workflow-automation": { color: "#3f51b5", bg: "#e8eaf6", border: "#9fa8da" },
  "devops-infra": { color: "#37474f", bg: "#eceff1", border: "#b0bec5" },
  "sales-outreach": { color: "#c62828", bg: "#ffebee", border: "#ef9a9a" },
  "security-monitoring": { color: "#4e342e", bg: "#efebe9", border: "#bcaaa4" },
  "content-generation": { color: "#ad1457", bg: "#fce4ec", border: "#f48fb1" },
};

const stages = [
  {
    num: 1,
    title: "Discovery & Evaluation",
    icon: Rocket,
    color: "#3f51b5",
    bg: "#e8eaf6",
    border: "#9fa8da",
    agentDash: {
      description:
        "Buyers discover AgentDash through industry-specific playbooks, ROI calculators, and live sandbox demos. Self-serve evaluation path with guided templates for their vertical.",
      features: [
        "Interactive sandbox with pre-loaded industry workflows",
        "ROI calculator tied to real deployment benchmarks",
        "Vertical playbooks (healthcare, financial services, public sector)",
      ],
    },
    competitors: [
      {
        name: "Salesforce Agentforce",
        approach: "Bundled with CRM. Discovery is product-led within existing Salesforce admin console. Strong for existing customers, invisible to non-Salesforce orgs.",
      },
      {
        name: "ServiceNow",
        approach: "IT-first discovery via Now Platform. Buyers typically find it through ITSM expansion, not agent-first search.",
      },
      {
        name: "CrewAI",
        approach: "Developer-first discovery via GitHub, docs, and tutorials. Open-source try-before-buy. No enterprise sandbox.",
      },
    ],
    gaps: ["No organic developer community yet", "Brand awareness lower than incumbents"],
    advantages: ["Vertical-specific messaging vs horizontal platforms", "Sandbox lets buyers prove value before procurement"],
  },
  {
    num: 2,
    title: "Onboarding & Platform Setup",
    icon: Settings,
    color: "#b45309",
    bg: "#fef3e2",
    border: "#fcd29b",
    agentDash: {
      description:
        "Guided setup wizard configures tenant, SSO, data connections, and compliance policies. Pre-built industry templates get teams to first agent in hours, not weeks.",
      features: [
        "Guided setup wizard with SSO, RBAC, and data residency config",
        "Pre-built industry templates (HIPAA, FedRAMP, SOC2 presets)",
        "Air-gap deployment option for classified environments",
      ],
    },
    competitors: [
      {
        name: "LangGraph",
        approach: "Code-first setup. pip install, write Python, manage infrastructure yourself. Steep learning curve, maximum flexibility.",
      },
      {
        name: "Moveworks",
        approach: "White-glove onboarding with dedicated CSM. 4-6 week implementation. High-touch but slow.",
      },
      {
        name: "Amazon Bedrock Agents",
        approach: "AWS Console setup. Fast if you live in AWS, but requires deep cloud expertise and IAM configuration.",
      },
    ],
    gaps: ["White-glove onboarding not yet available for largest enterprise deals"],
    advantages: ["Air-gap deployment is unique differentiator for gov/defense", "Hours to first agent vs weeks for competitors"],
  },
  {
    num: 3,
    title: "Agent Design & Creation",
    icon: Hammer,
    color: "#1e8a3c",
    bg: "#e6f4ea",
    border: "#b7dfbf",
    agentDash: {
      description:
        "Forge Agent Factory provides a hybrid visual + code builder. Drag-and-drop for business users, full code access for developers. Every agent gets deterministic guardrails from day one.",
      features: [
        "Visual workflow builder with code escape hatches",
        "Domain-specific agent templates per industry vertical",
        "Built-in Rules of Engagement (guardrails) at creation time",
        "Version control and rollback for agent definitions",
      ],
    },
    competitors: [
      {
        name: "Lindy.ai",
        approach: "Pure visual builder. Great for simple workflows, struggles with complex multi-step logic. No code access.",
      },
      {
        name: "AutoGen (Microsoft)",
        approach: "Pure code (Python). Maximum power and flexibility but zero visual tooling. Research-grade, not production-ready UX.",
      },
      {
        name: "Vapi",
        approach: "Voice-agent focused builder. Excellent for telephony use cases, limited for non-voice workflows.",
      },
    ],
    gaps: ["Visual builder less mature than Lindy for simple flows"],
    advantages: ["Hybrid visual+code is rare", "Guardrails built-in at creation, not bolted on later"],
  },
  {
    num: 4,
    title: "Squad Orchestration",
    icon: Users,
    color: "#7b1fa2",
    bg: "#f3e5f5",
    border: "#ce93d8",
    agentDash: {
      description:
        "The 7-Squad Model coordinates multiple specialized agents as a team: Commander routes tasks, Specialists execute, Guardian enforces policy, and Auditor logs decisions. Native multi-agent orchestration.",
      features: [
        "7-Squad topology: Commander, Specialists, Guardian, Auditor, Messenger, Librarian, Optimizer",
        "Visual squad designer with role assignment",
        "Inter-agent communication protocols with audit trails",
        "Dynamic squad scaling based on workload",
      ],
    },
    competitors: [
      {
        name: "CrewAI",
        approach: "Crew metaphor with roles and tasks. Good multi-agent support but lacks deterministic policy enforcement between agents.",
      },
      {
        name: "LangGraph",
        approach: "Graph-based agent orchestration. Powerful state machines but requires significant engineering to coordinate multiple agents.",
      },
      {
        name: "Salesforce Agentforce",
        approach: "Agent topics and actions, not true multi-agent orchestration. Each agent is largely independent.",
      },
    ],
    gaps: ["Squad model adds complexity for simple single-agent use cases"],
    advantages: ["Only platform with native multi-agent governance", "Squad roles map directly to enterprise org structures"],
  },
  {
    num: 5,
    title: "Integration & Deployment",
    icon: Plug,
    color: "#00838f",
    bg: "#e0f7fa",
    border: "#80deea",
    agentDash: {
      description:
        "Pre-built connectors for enterprise systems, API-first architecture, and unique legacy system bridges. Supports cloud, VPC, and air-gapped deployment modes.",
      features: [
        "Pre-built connectors for Salesforce, ServiceNow, SAP, Epic, Workday",
        "Legacy system bridges (mainframe, COBOL, proprietary protocols)",
        "Cloud, VPC, and air-gapped deployment modes",
        "Industry-standard data models (FHIR, OCSF, eTOM)",
      ],
    },
    competitors: [
      {
        name: "Workato",
        approach: "Integration-first platform with 1000+ connectors. Best connector coverage but agents are secondary to integration.",
      },
      {
        name: "Moveworks",
        approach: "Deep IT system integrations (ServiceNow, Jira, Okta). Narrow but deep. Limited outside IT workflows.",
      },
      {
        name: "Amazon Bedrock Agents",
        approach: "Native AWS integrations. Excellent in AWS ecosystem, limited for multi-cloud or on-prem.",
      },
    ],
    gaps: ["Connector library smaller than integration-first platforms like Workato"],
    advantages: ["Air-gapped deployment is unique for gov/defense", "Legacy system bridges reach where API-only platforms can't"],
  },
  {
    num: 6,
    title: "Governance & Trust",
    icon: ShieldCheck,
    color: "#c0392b",
    bg: "#fce8e6",
    border: "#f4b8b4",
    agentDash: {
      description:
        "Guardian provides deterministic policy enforcement with Rules of Engagement. Every agent action is logged with chain-of-thought reasoning, citations, and confidence scores. Built for regulated industries.",
      features: [
        "Guardian: deterministic Rules of Engagement engine",
        "Chain-of-thought audit trails for every decision",
        "Compliance-ready reporting (HIPAA, FedRAMP, SOC2)",
        "Human-in-the-loop routing with configurable escalation thresholds",
      ],
    },
    competitors: [
      {
        name: "Salesforce Agentforce",
        approach: "Einstein Trust Layer with toxicity detection and grounding. Good baseline but non-deterministic guardrails.",
      },
      {
        name: "ServiceNow",
        approach: "Now Platform audit trails. Governance inherited from ITSM platform. Limited agent-specific controls.",
      },
      {
        name: "CrewAI",
        approach: "Basic guardrails via prompt engineering. No deterministic policy layer. Limited audit trails.",
      },
    ],
    gaps: ["Guardian Rules of Engagement require upfront policy definition work"],
    advantages: ["Only deterministic policy enforcement in the market", "Audit trails exceed regulatory requirements, not just meet them"],
  },
  {
    num: 7,
    title: "Optimization & Scaling",
    icon: TrendingUp,
    color: "#2e7d32",
    bg: "#e8f5e9",
    border: "#a5d6a7",
    agentDash: {
      description:
        "Darwin Engine continuously improves agent performance using deployment data. Each customer deployment makes the system smarter. Fleet management scales from 1 agent to thousands.",
      features: [
        "Darwin Engine: automated performance optimization from real-world data",
        "Fleet management dashboard for enterprise-scale deployments",
        "Cross-deployment learning (anonymized patterns improve all customers)",
        "Cost optimization with intelligent routing and caching",
      ],
    },
    competitors: [
      {
        name: "LangSmith (LangChain)",
        approach: "Observability and tracing. Good monitoring but optimization is manual. Developer must interpret data and improve prompts.",
      },
      {
        name: "Arize Phoenix",
        approach: "LLM observability platform. Strong diagnostics but no automated optimization loop.",
      },
      {
        name: "Amazon Bedrock",
        approach: "CloudWatch metrics and model evaluation. AWS-native monitoring but no agent-specific optimization.",
      },
    ],
    gaps: ["Darwin Engine is early-stage, less proven than established observability tools"],
    advantages: ["Automated optimization loop is unique", "Cross-deployment learning creates a data flywheel moat"],
  },
];

export default function CUJPage() {
  const cujs = getAllCUJs();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--md-sys-color-background)" }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "var(--md-sys-color-primary)" }}
          >
            Agentic User Journeys
          </div>
          <h1
            className="text-xl font-bold mb-1"
            style={{ color: "var(--md-sys-color-on-surface)", letterSpacing: "-0.02em" }}
          >
            Canonical Agentic User Journeys
          </h1>
          <p
            className="text-sm max-w-3xl"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            Top 10 agentic user journeys with platform coverage. Each journey shows which products can fulfill it and example workflows.
          </p>
        </div>

        {/* Canonical CUJ Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {cujs.map((cuj) => {
            const companies = getCompaniesByCUJ(cuj.id);
            const colors = cujColors[cuj.id] ?? { color: "#546e7a", bg: "#eceff1", border: "#b0bec5" };
            const Icon = cujIcons[cuj.id] ?? Workflow;

            return (
              <div
                key={cuj.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--md-sys-color-outline)",
                  boxShadow: "var(--elevation-1)",
                }}
              >
                {/* CUJ Header */}
                <div
                  className="px-5 py-3 flex items-center gap-3"
                  style={{ borderBottom: `2px solid ${colors.border}`, background: colors.bg }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "#ffffff", border: `2px solid ${colors.border}`, color: colors.color }}
                  >
                    <Icon style={{ width: 14, height: 14 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-sm truncate" style={{ color: "var(--md-sys-color-on-surface)" }}>
                      {cuj.name}
                    </h2>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "#ffffff", color: colors.color, border: `1px solid ${colors.border}` }}>
                      {cuj.category}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold" style={{ color: colors.color }}>{companies.length}</div>
                    <div className="text-[10px]" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>platforms</div>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
                    {cuj.description}
                  </p>

                  {/* Companies that support this CUJ */}
                  {companies.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>
                        Supported By
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {companies.map((company) => (
                          <Link
                            key={company.slug}
                            href={`/companies/${company.slug}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors hover:opacity-80"
                            style={{
                              background: "var(--md-sys-color-surface-container)",
                              color: "var(--md-sys-color-on-surface)",
                              border: "1px solid var(--md-sys-color-outline-variant)",
                              textDecoration: "none",
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: getScoreCssColor(company.scores.total, 100) }}
                            />
                            {company.name}
                            <span className="text-[10px]" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
                              {company.scores.total}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Example workflows */}
                  <details className="group">
                    <summary className="text-[10px] font-bold uppercase tracking-wide cursor-pointer select-none" style={{ color: colors.color }}>
                      Example Workflows
                    </summary>
                    <ul className="mt-1.5 space-y-1">
                      {cuj.exampleWorkflows.map((wf, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <ChevronRight style={{ width: 9, height: 9, color: colors.color, marginTop: 3, flexShrink: 0 }} />
                          <span className="text-[11px] leading-snug" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{wf}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mb-6">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "var(--md-sys-color-primary)" }}
          >
            Product Journey Map
          </div>
          <h2
            className="text-xl font-bold mb-1"
            style={{ color: "var(--md-sys-color-on-surface)", letterSpacing: "-0.02em" }}
          >
            AgentDash CUJ Map
          </h2>
          <p
            className="text-sm max-w-3xl"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            End-to-end journey mapping across 7 lifecycle stages. Each stage compares AgentDash capabilities against top competitors, identifying gaps and advantages.
          </p>
        </div>

        {/* Journey timeline */}
        <div className="space-y-4">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.num}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--md-sys-color-outline)",
                  boxShadow: "var(--elevation-1)",
                }}
              >
                {/* Stage header */}
                <div
                  className="px-5 py-3 flex items-center gap-3"
                  style={{ borderBottom: `2px solid ${stage.border}`, background: stage.bg }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "#ffffff", border: `2px solid ${stage.border}`, color: stage.color }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "#ffffff", color: stage.color, border: `1px solid ${stage.border}` }}
                    >
                      {stage.num}/7
                    </span>
                    <h2 className="font-semibold text-sm" style={{ color: "var(--md-sys-color-on-surface)" }}>
                      {stage.title}
                    </h2>
                  </div>
                </div>

                {/* Stage content — 3-column layout */}
                <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x" style={{ borderColor: "var(--md-sys-color-outline-variant)" }}>
                  {/* AgentDash column */}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles style={{ width: 12, height: 12, color: stage.color }} />
                      <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: stage.color }}>
                        AgentDash
                      </h3>
                    </div>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
                      {stage.agentDash.description}
                    </p>
                    <ul className="space-y-1.5">
                      {stage.agentDash.features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5">
                          <ChevronRight style={{ width: 10, height: 10, color: stage.color, marginTop: 3, flexShrink: 0 }} />
                          <span className="text-xs" style={{ color: "var(--md-sys-color-on-surface)" }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Competitors column */}
                  <div className="p-4">
                    <h3
                      className="text-xs font-bold uppercase tracking-wide mb-2"
                      style={{ color: "var(--md-sys-color-on-surface-muted)" }}
                    >
                      Competitors
                    </h3>
                    <div className="space-y-2.5">
                      {stage.competitors.map((c) => (
                        <div key={c.name}>
                          <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--md-sys-color-on-surface)" }}>
                            {c.name}
                          </div>
                          <p className="text-[11px] leading-snug" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
                            {c.approach}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gaps & Advantages column */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h3
                        className="text-xs font-bold uppercase tracking-wide mb-1.5 flex items-center gap-1"
                        style={{ color: "var(--score-high)" }}
                      >
                        <CheckCircle2 style={{ width: 11, height: 11 }} />
                        Advantages
                      </h3>
                      <ul className="space-y-1">
                        {stage.advantages.map((a) => (
                          <li key={a} className="text-[11px] leading-snug" style={{ color: "var(--md-sys-color-on-surface)" }}>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3
                        className="text-xs font-bold uppercase tracking-wide mb-1.5 flex items-center gap-1"
                        style={{ color: "var(--score-low)" }}
                      >
                        <AlertTriangle style={{ width: 11, height: 11 }} />
                        Gaps
                      </h3>
                      <ul className="space-y-1">
                        {stage.gaps.map((g) => (
                          <li key={g} className="text-[11px] leading-snug" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
