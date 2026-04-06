import { getFrameworkByName } from "@/lib/data";

const dimColors: Record<string, { color: string; bg: string; border: string }> = {
  W: { color: "#3f51b5", bg: "#e8eaf6", border: "#9fa8da" },
  P: { color: "#3f51b5", bg: "#e8eaf6", border: "#9fa8da" },
  A: { color: "#b45309", bg: "#fef3e2", border: "#fcd29b" },
  C: { color: "#1e8a3c", bg: "#e6f4ea", border: "#b7dfbf" },
  T: { color: "#c0392b", bg: "#fce8e6", border: "#f4b8b4" },
};

export default function PactFrameworkPage() {
  const framework = getFrameworkByName("WACT");

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--md-sys-color-background)" }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Compact header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: "var(--md-sys-color-primary)" }}
            >
              Evaluation Framework
            </div>
            <h1
              className="text-xl font-bold mb-1"
              style={{ color: "var(--md-sys-color-on-surface)", letterSpacing: "-0.02em" }}
            >
              {framework?.name ?? "WACT 4.0 Framework"}
            </h1>
            <p
              className="text-sm max-w-3xl"
              style={{ color: "var(--md-sys-color-on-surface-variant)" }}
            >
              {framework?.purpose ?? "Workability, Access, Context, Trust framework for evaluating enterprise market opportunities"}
            </p>
          </div>
          {framework && (
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap"
              style={{
                background: "var(--md-sys-color-primary-container)",
                color: "var(--md-sys-color-primary)",
              }}
            >
              v{framework.version} &middot; {framework.dimensions.length} dimensions &middot;{" "}
              {framework.dimensions.reduce((s, d) => s + d.subCriteria.length, 0)} sub-criteria &middot; /100 total
            </div>
          )}
        </div>

        {/* 2x2 dimension grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {(framework?.dimensions ?? []).map((dim) => {
            const ds = dimColors[dim.key] ?? {
              color: "var(--md-sys-color-on-surface-variant)",
              bg: "var(--md-sys-color-surface-variant)",
              border: "var(--md-sys-color-outline)",
            };

            return (
              <div
                key={dim.key}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--md-sys-color-outline)",
                  boxShadow: "var(--elevation-1)",
                }}
              >
                {/* Dimension header — compact */}
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ borderBottom: `2px solid ${ds.border}`, background: ds.bg }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: "#ffffff", border: `2px solid ${ds.border}`, color: ds.color }}
                  >
                    {dim.key}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-sm" style={{ color: "var(--md-sys-color-on-surface)" }}>
                        {dim.name}
                      </h2>
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ background: "#ffffff", color: ds.color, border: `1px solid ${ds.border}` }}
                      >
                        {dim.weight}%
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>
                      {dim.description}
                    </p>
                  </div>
                </div>

                {/* Sub-criteria table */}
                <div className="divide-y" style={{ borderColor: "var(--md-sys-color-outline-variant)" }}>
                  {dim.subCriteria.map((sc) => (
                    <details key={sc.name} className="group">
                      <summary
                        className="px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors list-none [&::-webkit-details-marker]:hidden"
                      >
                        {/* Weight pill */}
                        <span
                          className="text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                          style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}
                        >
                          {sc.weight}
                        </span>
                        {/* Name + description on one line */}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium" style={{ color: "var(--md-sys-color-on-surface)" }}>
                            {sc.name}
                          </span>
                          <span className="text-xs ml-2" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>
                            {sc.description}
                          </span>
                        </div>
                        {/* Expand indicator */}
                        <svg
                          className="w-3.5 h-3.5 flex-shrink-0 transition-transform group-open:rotate-90"
                          style={{ color: "var(--md-sys-color-on-surface-muted)" }}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </summary>

                      {/* Rubric — revealed on click */}
                      <div className="px-4 pb-3 pt-1">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-md p-2" style={{ background: "var(--score-low-bg)", border: "1px solid var(--score-low-border)" }}>
                            <div className="text-[10px] font-bold uppercase mb-1" style={{ color: "var(--score-low)" }}>Score 1</div>
                            <p className="text-[11px] leading-snug" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{sc.rubric["1"]}</p>
                          </div>
                          <div className="rounded-md p-2" style={{ background: "var(--score-mid-bg)", border: "1px solid var(--score-mid-border)" }}>
                            <div className="text-[10px] font-bold uppercase mb-1" style={{ color: "var(--score-mid)" }}>Score 3</div>
                            <p className="text-[11px] leading-snug" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{sc.rubric["3"]}</p>
                          </div>
                          <div className="rounded-md p-2" style={{ background: "var(--score-high-bg)", border: "1px solid var(--score-high-border)" }}>
                            <div className="text-[10px] font-bold uppercase mb-1" style={{ color: "var(--score-high)" }}>Score 5</div>
                            <p className="text-[11px] leading-snug" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>{sc.rubric["5"]}</p>
                          </div>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
