"use client";

import { useState } from "react";
import type { Company } from "@/types";
import ComparisonView from "@/components/comparison/ComparisonView";

export default function CompareClient({ allCompanies }: { allCompanies: Company[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  const selectedCompanies = selected
    .map((slug) => allCompanies.find((c) => c.slug === slug))
    .filter(Boolean) as Company[];

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--md-sys-color-background)" }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--md-sys-color-primary)" }}
          >
            Competitive Intelligence
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--md-sys-color-on-surface)", letterSpacing: "-0.02em" }}
          >
            Side-by-Side Comparison
          </h1>
          <p className="text-sm" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
            Select 2–4 platforms to compare across all Agent Factory Evaluation dimensions
          </p>
        </div>

        <ComparisonView
          companies={selectedCompanies}
          allCompanies={allCompanies}
          onRemove={(slug) => setSelected((s) => s.filter((x) => x !== slug))}
          onAdd={(slug) => setSelected((s) => [...s, slug])}
        />
      </div>
    </div>
  );
}
