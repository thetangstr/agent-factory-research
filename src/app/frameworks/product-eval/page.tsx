import { getFrameworkByName } from "@/lib/data";

const dimColors: Record<string, { color: string; bg: string; border: string }> = {
  CR: { color: "#4527a0", bg: "#ede7f6", border: "#b39ddb" },
  OR: { color: "#3f51b5", bg: "#e8eaf6", border: "#9fa8da" },
  IN: { color: "#0277bd", bg: "#e1f5fe", border: "#81d4fa" },
  GV: { color: "#c0392b", bg: "#fce8e6", border: "#f4b8b4" },
  OP: { color: "#1e8a3c", bg: "#e6f4ea", border: "#b7dfbf" },
};

export default function ProductEvalPage() {
  const framework = getFrameworkByName("Agent Factory");

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--md-sys-color-background)" }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--md-sys-color-primary)" }}
          >
            Evaluation Framework
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              color: "var(--md-sys-color-on-surface)",
              letterSpacing: "-0.02em",
            }}
          >
            {framework?.name ?? "Product Evaluation Framework"}
          </h1>
          <p
            className="text-sm mb-2"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            {framework?.purpose ??
              "5-dimension framework for scoring enterprise agent factory platform capabilities and maturity"}
          </p>
          {framework && (
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
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

        <div className="space-y-6">
          {(framework?.dimensions ?? []).map((dim) => {
            const dimStyle = dimColors[dim.key] ?? {
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
                {/* Dimension header */}
                <div
                  className="px-6 py-4 flex items-center gap-4"
                  style={{
                    borderBottom: "1px solid var(--md-sys-color-outline-variant)",
                    background: dimStyle.bg,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{
                      background: "#ffffff",
                      border: `2px solid ${dimStyle.border}`,
                      color: dimStyle.color,
                    }}
                  >
                    {dim.key}
                  </div>
                  <div className="flex-1">
                    <h2
                      className="font-semibold text-base"
                      style={{ color: "var(--md-sys-color-on-surface)" }}
                    >
                      {dim.name}
                    </h2>
                    <span
                      className="text-xs"
                      style={{ color: "var(--md-sys-color-on-surface-muted)" }}
                    >
                      Weight: {dim.weight}/100
                    </span>
                  </div>
                </div>

                <div className="px-6 py-5">
                  <p
                    className="text-sm leading-relaxed mb-6"
                    style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                  >
                    {dim.description}
                  </p>

                  <div className="space-y-4">
                    {dim.subCriteria.map((sc) => (
                      <div
                        key={sc.name}
                        className="rounded-xl overflow-hidden"
                        style={{
                          border: "1px solid var(--md-sys-color-outline-variant)",
                        }}
                      >
                        <div
                          className="px-4 py-3 flex items-center justify-between"
                          style={{
                            borderBottom: "1px solid var(--md-sys-color-outline-variant)",
                            background: "var(--md-sys-color-surface-variant)",
                          }}
                        >
                          <h3
                            className="text-sm font-semibold"
                            style={{ color: "var(--md-sys-color-on-surface)" }}
                          >
                            {sc.name}
                          </h3>
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{
                              background: dimStyle.bg,
                              color: dimStyle.color,
                              border: `1px solid ${dimStyle.border}`,
                            }}
                          >
                            weight {sc.weight}
                          </span>
                        </div>

                        <div className="px-4 py-4">
                          <p
                            className="text-sm leading-relaxed mb-4"
                            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                          >
                            {sc.description}
                          </p>

                          <div className="grid grid-cols-3 gap-3">
                            <div
                              className="rounded-lg p-3"
                              style={{
                                background: "var(--score-low-bg)",
                                border: "1px solid var(--score-low-border)",
                              }}
                            >
                              <div
                                className="text-xs font-bold uppercase tracking-wide mb-2"
                                style={{ color: "var(--score-low)" }}
                              >
                                Score 1
                              </div>
                              <p
                                className="text-xs leading-relaxed"
                                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                              >
                                {sc.rubric["1"]}
                              </p>
                            </div>
                            <div
                              className="rounded-lg p-3"
                              style={{
                                background: "var(--score-mid-bg)",
                                border: "1px solid var(--score-mid-border)",
                              }}
                            >
                              <div
                                className="text-xs font-bold uppercase tracking-wide mb-2"
                                style={{ color: "var(--score-mid)" }}
                              >
                                Score 3
                              </div>
                              <p
                                className="text-xs leading-relaxed"
                                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                              >
                                {sc.rubric["3"]}
                              </p>
                            </div>
                            <div
                              className="rounded-lg p-3"
                              style={{
                                background: "var(--score-high-bg)",
                                border: "1px solid var(--score-high-border)",
                              }}
                            >
                              <div
                                className="text-xs font-bold uppercase tracking-wide mb-2"
                                style={{ color: "var(--score-high)" }}
                              >
                                Score 5
                              </div>
                              <p
                                className="text-xs leading-relaxed"
                                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
                              >
                                {sc.rubric["5"]}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
