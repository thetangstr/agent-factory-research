import { getAllMatrixCells } from "@/lib/data";
import { INDUSTRIES, FUNCTION_CATEGORIES, ALL_SUB_FUNCTIONS } from "@/lib/matrix-config";
import HeatmapGrid from "@/components/matrix/HeatmapGrid";

export default function MatrixPage() {
  const cells = getAllMatrixCells();

  return (
    <div className="min-h-screen" style={{ background: "var(--md-sys-color-background)" }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--md-sys-color-primary)" }}>
            Agentification Matrix
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--md-sys-color-on-surface)", letterSpacing: "-0.02em" }}>
            Enterprise Workflow Agentification
          </h1>
          <p className="text-sm max-w-3xl" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
            {cells.length > 0
              ? `${cells.length} cells across ${INDUSTRIES.length} industries × ${ALL_SUB_FUNCTIONS.length} specialized functions. Grouped by ${FUNCTION_CATEGORIES.length} parent categories. Click any cell to explore workflows, platform fit, and the full playbook.`
              : "The agentification matrix is being researched."}
          </p>
        </div>

        {cells.length > 0 ? (
          <div className="rounded-xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid var(--md-sys-color-outline)", boxShadow: "var(--elevation-1)" }}>
            <HeatmapGrid
              cells={cells}
              industries={INDUSTRIES}
              functionCategories={FUNCTION_CATEGORIES}
            />
          </div>
        ) : (
          <div className="rounded-xl p-12 text-center" style={{ background: "#ffffff", border: "1px solid var(--md-sys-color-outline)" }}>
            <div className="text-4xl mb-4">🔬</div>
            <div className="text-base font-medium mb-2" style={{ color: "var(--md-sys-color-on-surface)" }}>Matrix Research In Progress</div>
            <p className="text-sm" style={{ color: "var(--md-sys-color-on-surface-muted)" }}>378 cells being analyzed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
