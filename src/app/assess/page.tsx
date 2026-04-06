"use client";

import { useState, useRef, useCallback } from "react";
import {
  Send,
  Loader2,
  RotateCcw,
  Sparkles,
  Building2,
  ChevronRight,
  ChevronLeft,
  Settings,
  Target,
  Cpu,
  CheckCircle2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const INDUSTRIES = [
  "Public Sector","E-Commerce","Insurance","Healthcare","Logistics",
  "Financial Services","Manufacturing","Real Estate","Legal","Education",
  "Tech/SaaS","Retail","Energy/Utilities","Telecom",
  "Media/Entertainment","Construction","Hospitality","Agriculture",
];

function toSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const EMPLOYEE_RANGES = ["1-50","51-200","201-1,000","1,001-5,000","5,000+"];
const REVENUE_RANGES = ["< $5M","$5–25M","$25–100M","$100M–1B","> $1B"];
const AUTOMATION_LEVELS = [
  { value: "manual", label: "Mostly manual", desc: "Spreadsheets, email, phone" },
  { value: "basic", label: "Basic automation", desc: "Some RPA, simple scripts, Zapier" },
  { value: "advanced", label: "Advanced but hitting ceiling", desc: "Mature RPA/rules but breaks on edge cases" },
];
const GOALS = ["Revenue growth","Cost reduction","Both"];
const TIMELINES = ["Immediate need","3-6 months","Just exploring"];
const BUDGETS = ["< $50K","$50–150K","$150–500K","> $500K","Not sure yet"];

const FUNCTION_CATEGORIES = [
  {
    key: "sales", name: "Sales", icon: "💰",
    subs: [
      { key: "business-development", name: "Business Development" },
      { key: "account-management", name: "Account Management" },
      { key: "revenue-operations", name: "Revenue Operations" },
    ],
  },
  {
    key: "customer-support", name: "Customer Support", icon: "🎧",
    subs: [
      { key: "contact-center", name: "Contact Center" },
      { key: "field-service", name: "Field Service" },
      { key: "customer-success", name: "Success & Retention" },
    ],
  },
  {
    key: "hr", name: "HR", icon: "👥",
    subs: [
      { key: "talent-acquisition", name: "Talent Acquisition" },
      { key: "workforce-management", name: "Workforce Management" },
      { key: "hr-compliance", name: "Compliance & Benefits" },
    ],
  },
  {
    key: "finance", name: "Finance", icon: "📊",
    subs: [
      { key: "accounting-arap", name: "Accounting & AR/AP" },
      { key: "fpa-reporting", name: "FP&A & Reporting" },
      { key: "risk-compliance", name: "Risk & Compliance" },
      { key: "procurement", name: "Procurement" },
    ],
  },
  {
    key: "it-engineering", name: "IT / Engineering", icon: "⚙️",
    subs: [
      { key: "cybersecurity", name: "Cybersecurity / SOC" },
      { key: "devops-sre", name: "DevOps / SRE" },
      { key: "data-engineering", name: "Data Engineering" },
      { key: "software-dev", name: "Software Development" },
    ],
  },
  {
    key: "operations", name: "Operations", icon: "🏭",
    subs: [
      { key: "supply-chain", name: "Supply Chain" },
      { key: "facilities", name: "Facilities & Maintenance" },
      { key: "quality-regulatory", name: "Quality / Regulatory" },
      { key: "program-management", name: "Program Management" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FormData {
  companyName: string;
  industry: string;
  employeeRange: string;
  revenueRange: string;
  description: string;
  currentSystems: string;
  automationLevel: string;
  challenges: string;
  selectedFunctions: string[];
  primaryGoal: string;
  targets: string;
  timeline: string;
  budgetRange: string;
}

const INITIAL_FORM: FormData = {
  companyName: "",
  industry: "",
  employeeRange: "",
  revenueRange: "",
  description: "",
  currentSystems: "",
  automationLevel: "",
  challenges: "",
  selectedFunctions: [],
  primaryGoal: "Both",
  targets: "",
  timeline: "",
  budgetRange: "",
};

const STEPS = [
  { num: 1, label: "Company", icon: Building2 },
  { num: 2, label: "Operations", icon: Settings },
  { num: 3, label: "Functions", icon: Cpu },
  { num: 4, label: "Goals", icon: Target },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function AssessPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const update = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const toggleFunction = (fnKey: string) => {
    setForm((prev) => ({
      ...prev,
      selectedFunctions: prev.selectedFunctions.includes(fnKey)
        ? prev.selectedFunctions.filter((f) => f !== fnKey)
        : [...prev.selectedFunctions, fnKey],
    }));
  };

  const canNext = (): boolean => {
    if (step === 1) return !!form.companyName && !!form.industry;
    if (step === 2) return !!form.automationLevel;
    if (step === 3) return true; // functions optional (all = broad scan)
    return true;
  };

  const runAssessment = useCallback(async () => {
    setOutput("");
    setError("");
    setIsStreaming(true);
    setShowResults(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          industrySlug: toSlug(form.industry),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setError(err.error ?? `HTTP ${res.status}`);
        setIsStreaming(false);
        return;
      }

      if (!res.body) {
        setError("No response body");
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setOutput((prev) => prev + chunk);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // cancelled
      } else {
        setError(err instanceof Error ? err.message : "Network error");
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [form]);

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setOutput("");
    setError("");
    setStep(1);
    setShowResults(false);
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen" style={{ background: "var(--md-sys-color-background)" }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--md-sys-color-primary)" }}>
            Sales Tool
          </div>
          <h1 className="text-xl font-bold mb-1" style={{ color: "var(--md-sys-color-on-surface)", letterSpacing: "-0.02em" }}>
            Agent Readiness Assessment
          </h1>
          <p className="text-sm max-w-3xl" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
            Answer 4 quick steps about the prospect. Our research data (378 matrix cells, deep playbooks, market reports) powers a tailored agent deployment proposal.
          </p>
        </div>

        {!showResults ? (
          <>
            {/* Step indicator */}
            <div className="flex items-center gap-1 mb-6">
              {STEPS.map((s) => {
                const Icon = s.icon;
                const isActive = s.num === step;
                const isDone = s.num < step;
                return (
                  <button
                    key={s.num}
                    onClick={() => s.num < step && setStep(s.num)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: isActive ? "var(--md-sys-color-primary-container)" : isDone ? "var(--score-high-bg)" : "transparent",
                      color: isActive ? "var(--md-sys-color-primary)" : isDone ? "var(--score-high)" : "var(--md-sys-color-on-surface-muted)",
                      cursor: s.num < step ? "pointer" : "default",
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 style={{ width: 13, height: 13 }} />
                    ) : (
                      <Icon style={{ width: 13, height: 13 }} />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.num}</span>
                  </button>
                );
              })}
            </div>

            {/* Step content */}
            <div
              className="rounded-xl p-6"
              style={{ background: "#ffffff", border: "1px solid var(--md-sys-color-outline)", boxShadow: "var(--elevation-1)" }}
            >
              {step === 1 && <Step1 form={form} update={update} />}
              {step === 2 && <Step2 form={form} update={update} />}
              {step === 3 && <Step3 form={form} toggleFunction={toggleFunction} />}
              {step === 4 && <Step4 form={form} update={update} />}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: "1px solid var(--md-sys-color-outline-variant)" }}>
                {step > 1 ? (
                  <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
                    <ChevronLeft style={{ width: 14, height: 14 }} /> Back
                  </button>
                ) : <div />}

                {step < 4 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canNext()}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
                    style={{ background: "var(--md-sys-color-primary)", color: "#ffffff" }}
                  >
                    Next <ChevronRight style={{ width: 14, height: 14 }} />
                  </button>
                ) : (
                  <button
                    onClick={runAssessment}
                    disabled={!canNext()}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40"
                    style={{ background: "var(--md-sys-color-primary)", color: "#ffffff" }}
                  >
                    <Sparkles style={{ width: 14, height: 14 }} />
                    Generate Assessment
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Results view */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium" style={{ color: "var(--md-sys-color-on-surface-variant)", border: "1px solid var(--md-sys-color-outline-variant)" }}>
                <RotateCcw style={{ width: 13, height: 13 }} /> New Assessment
              </button>
              {isStreaming && (
                <button
                  onClick={() => abortRef.current?.abort()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
                  style={{ background: "var(--score-low-bg)", color: "var(--score-low)", border: "1px solid var(--score-low-border)" }}
                >
                  Cancel
                </button>
              )}
              {isStreaming && (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="animate-spin" style={{ width: 14, height: 14, color: "var(--md-sys-color-primary)" }} />
                  <span className="text-xs" style={{ color: "var(--md-sys-color-primary)" }}>
                    Generating assessment for {form.companyName}...
                  </span>
                </div>
              )}
            </div>

            {/* Context badge */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge label={form.industry} />
              <Badge label={form.employeeRange + " employees"} />
              <Badge label={form.primaryGoal} />
              {form.selectedFunctions.length > 0 && (
                <Badge label={`${form.selectedFunctions.length} functions selected`} />
              )}
            </div>

            {/* Output panel */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "#ffffff", border: "1px solid var(--md-sys-color-outline)", boxShadow: "var(--elevation-1)" }}
            >
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: "1px solid var(--md-sys-color-outline-variant)", background: "var(--md-sys-color-surface-variant)" }}
              >
                <Sparkles style={{ width: 14, height: 14, color: "var(--md-sys-color-primary)" }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--md-sys-color-on-surface)" }}>
                  Agent Readiness Report — {form.companyName}
                </span>
              </div>

              <div className="px-6 py-5 overflow-auto" style={{ maxHeight: "75vh" }}>
                {error && (
                  <div className="rounded-lg px-4 py-3 text-sm mb-4" style={{ background: "var(--score-low-bg)", border: "1px solid var(--score-low-border)", color: "var(--score-low)" }}>
                    <strong>Error:</strong> {error}
                  </div>
                )}
                {!output && !error && (
                  <div className="flex items-center gap-2 py-8 justify-center" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>
                    <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
                    <span className="text-sm">Retrieving research data and generating assessment...</span>
                  </div>
                )}
                {output && <AssessmentRenderer content={output} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step Components                                                    */
/* ------------------------------------------------------------------ */

function Step1({ form, update }: { form: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-1" style={{ color: "var(--md-sys-color-on-surface)" }}>Company Profile</h2>
      <p className="text-xs mb-5" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>Tell us about the prospect company.</p>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Company Name *" value={form.companyName} onChange={(v) => update("companyName", v)} placeholder="e.g. MKThink" />
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--md-sys-color-on-surface)" }}>Industry *</label>
          <select
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: "1px solid var(--md-sys-color-outline)", background: "#ffffff", color: "var(--md-sys-color-on-surface)" }}
          >
            <option value="">Select industry...</option>
            {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--md-sys-color-on-surface)" }}>Employee Count</label>
          <div className="flex flex-wrap gap-1.5">
            {EMPLOYEE_RANGES.map((r) => <Chip key={r} label={r} selected={form.employeeRange === r} onClick={() => update("employeeRange", r)} />)}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--md-sys-color-on-surface)" }}>Annual Revenue</label>
          <div className="flex flex-wrap gap-1.5">
            {REVENUE_RANGES.map((r) => <Chip key={r} label={r} selected={form.revenueRange === r} onClick={() => update("revenueRange", r)} />)}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Field label="Company Description" value={form.description} onChange={(v) => update("description", v)} placeholder="What does the company do? Products, services, market position..." multiline />
      </div>
    </div>
  );
}

function Step2({ form, update }: { form: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-1" style={{ color: "var(--md-sys-color-on-surface)" }}>Current Operations</h2>
      <p className="text-xs mb-5" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>Help us understand their current tech and pain points.</p>

      <div className="space-y-4">
        <Field label="Key Systems & Tools" value={form.currentSystems} onChange={(v) => update("currentSystems", v)} placeholder="e.g. Salesforce, SAP, Epic EHR, Jira, custom CRM..." multiline />

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--md-sys-color-on-surface)" }}>Current Automation Level *</label>
          <div className="space-y-2">
            {AUTOMATION_LEVELS.map((al) => (
              <button
                key={al.value}
                onClick={() => update("automationLevel", al.value)}
                className="w-full text-left px-4 py-3 rounded-lg transition-colors"
                style={{
                  border: form.automationLevel === al.value ? "2px solid var(--md-sys-color-primary)" : "1px solid var(--md-sys-color-outline-variant)",
                  background: form.automationLevel === al.value ? "var(--md-sys-color-primary-container)" : "transparent",
                }}
              >
                <div className="text-sm font-medium" style={{ color: "var(--md-sys-color-on-surface)" }}>{al.label}</div>
                <div className="text-xs" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>{al.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <Field label="Biggest Operational Challenges" value={form.challenges} onChange={(v) => update("challenges", v)} placeholder="What keeps them up at night? Where do they waste the most time/money?" multiline />
      </div>
    </div>
  );
}

function Step3({ form, toggleFunction }: { form: FormData; toggleFunction: (key: string) => void }) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-1" style={{ color: "var(--md-sys-color-on-surface)" }}>Functions to Analyze</h2>
      <p className="text-xs mb-5" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>
        Select which business functions are relevant. Leave empty for a broad scan of all 21 functions.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FUNCTION_CATEGORIES.map((cat) => (
          <div key={cat.key} className="rounded-lg p-3" style={{ border: "1px solid var(--md-sys-color-outline-variant)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{cat.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--md-sys-color-on-surface)" }}>{cat.name}</span>
            </div>
            <div className="space-y-1">
              {cat.subs.map((sub) => {
                const selected = form.selectedFunctions.includes(sub.key);
                return (
                  <button
                    key={sub.key}
                    onClick={() => toggleFunction(sub.key)}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors"
                    style={{
                      background: selected ? "var(--md-sys-color-primary-container)" : "transparent",
                      color: selected ? "var(--md-sys-color-primary)" : "var(--md-sys-color-on-surface-variant)",
                      fontWeight: selected ? 600 : 400,
                    }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center"
                      style={{
                        border: selected ? "none" : "1.5px solid var(--md-sys-color-outline)",
                        background: selected ? "var(--md-sys-color-primary)" : "transparent",
                      }}
                    >
                      {selected && <CheckCircle2 style={{ width: 10, height: 10, color: "#ffffff" }} />}
                    </div>
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {form.selectedFunctions.length > 0 && (
        <div className="mt-3 text-xs" style={{ color: "var(--md-sys-color-primary)" }}>
          {form.selectedFunctions.length} function{form.selectedFunctions.length > 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}

function Step4({ form, update }: { form: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void }) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-1" style={{ color: "var(--md-sys-color-on-surface)" }}>Agentification Goals</h2>
      <p className="text-xs mb-5" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>What does the prospect want to achieve?</p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--md-sys-color-on-surface)" }}>Primary Goal</label>
          <div className="flex flex-wrap gap-1.5">
            {GOALS.map((g) => <Chip key={g} label={g} selected={form.primaryGoal === g} onClick={() => update("primaryGoal", g)} />)}
          </div>
        </div>

        <Field label="Specific Targets" value={form.targets} onChange={(v) => update("targets", v)} placeholder="e.g. Reduce support costs by 30%, accelerate proposal turnaround by 50%..." multiline />

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--md-sys-color-on-surface)" }}>Timeline</label>
          <div className="flex flex-wrap gap-1.5">
            {TIMELINES.map((t) => <Chip key={t} label={t} selected={form.timeline === t} onClick={() => update("timeline", t)} />)}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--md-sys-color-on-surface)" }}>Pilot Budget Range</label>
          <div className="flex flex-wrap gap-1.5">
            {BUDGETS.map((b) => <Chip key={b} label={b} selected={form.budgetRange === b} onClick={() => update("budgetRange", b)} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable UI                                                        */
/* ------------------------------------------------------------------ */

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean;
}) {
  const props = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder,
    className: "w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200",
    style: { border: "1px solid var(--md-sys-color-outline)", color: "var(--md-sys-color-on-surface)", background: "#ffffff" } as React.CSSProperties,
  };
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--md-sys-color-on-surface)" }}>{label}</label>
      {multiline ? <textarea {...props} rows={3} /> : <input {...props} />}
    </div>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
      style={{
        background: selected ? "var(--md-sys-color-primary)" : "transparent",
        color: selected ? "#ffffff" : "var(--md-sys-color-on-surface-variant)",
        border: selected ? "1px solid var(--md-sys-color-primary)" : "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      {label}
    </button>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: "var(--md-sys-color-primary-container)", color: "var(--md-sys-color-primary)" }}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Markdown Renderer                                                  */
/* ------------------------------------------------------------------ */

function AssessmentRenderer({ content }: { content: string }) {
  const sections = parseSections(content);
  return (
    <div className="space-y-5">
      {sections.map((section, i) => (
        <div key={i}>
          {section.level === 2 && (
            <h2 className="text-base font-bold mb-2 pb-1" style={{ color: "var(--md-sys-color-on-surface)", borderBottom: "2px solid var(--md-sys-color-primary-container)" }}>
              {section.title}
            </h2>
          )}
          {section.level === 3 && (
            <h3 className="text-sm font-semibold mb-1.5 mt-3" style={{ color: "var(--md-sys-color-primary)" }}>
              {section.title}
            </h3>
          )}
          <div className="text-sm leading-relaxed" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
            {section.lines.map((line, j) => <RenderLine key={j} line={line} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

interface Section { level: number; title: string; lines: string[] }

function parseSections(content: string): Section[] {
  const lines = content.split("\n");
  const sections: Section[] = [];
  let current: Section = { level: 0, title: "", lines: [] };
  for (const line of lines) {
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    if (h2) {
      if (current.title || current.lines.length > 0) sections.push(current);
      current = { level: 2, title: h2[1], lines: [] };
    } else if (h3) {
      if (current.title || current.lines.length > 0) sections.push(current);
      current = { level: 3, title: h3[1], lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.title || current.lines.length > 0) sections.push(current);
  return sections;
}

function RenderLine({ line }: { line: string }) {
  const trimmed = line.trim();
  if (!trimmed) return <div className="h-2" />;
  if (trimmed.startsWith("|")) {
    if (trimmed.match(/^\|[\s-|]+\|$/)) return null;
    const cells = trimmed.split("|").filter(Boolean).map((c) => c.trim());
    return (
      <div className="grid gap-2 text-xs py-1" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
        {cells.map((cell, i) => <span key={i}><InlineFormat text={cell} /></span>)}
      </div>
    );
  }
  if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
    return (
      <div className="flex items-start gap-2 py-0.5 pl-1">
        <span style={{ color: "var(--md-sys-color-primary)", marginTop: 6, fontSize: 6 }}>●</span>
        <span><InlineFormat text={trimmed.slice(2)} /></span>
      </div>
    );
  }
  return <p className="py-0.5"><InlineFormat text={trimmed} /></p>;
}

function InlineFormat({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} style={{ color: "var(--md-sys-color-on-surface)", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
