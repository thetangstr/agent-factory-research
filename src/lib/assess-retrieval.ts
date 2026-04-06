/**
 * RAG retrieval layer for Agent Readiness Assessment.
 * Pulls relevant matrix cells, deep playbooks, market reports,
 * and competitor platforms based on the intake form data.
 */

import { getAllMatrixCells, getMatrixCell, getAllMarkets, getAllCompanies } from "./data";
import type { MatrixCell, VerticalMarket, Company } from "@/types";

export interface AssessmentInput {
  companyName: string;
  industry: string;
  industrySlug: string;
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
  // Maturity dimensions (inspired by Jellyfish Maturity Maps)
  aiUsageLevel: string;
  aiGovernance: string;
  agentExperience: string;
  aiOwnership: string;
}

export interface RetrievedContext {
  matrixCells: MatrixCell[];
  deepPlaybooks: MatrixCell[];
  marketReport: VerticalMarket | null;
  topPlatforms: Pick<Company, "name" | "slug" | "oneLiner" | "scores" | "capabilities">[];
}

export function retrieveContext(input: AssessmentInput): RetrievedContext {
  // 1. Get all matrix cells for this industry
  const allCells = getAllMatrixCells();
  const industryCells = allCells.filter(
    (c) => c.industrySlug === input.industrySlug
  );

  // 2. Filter to selected functions if any, otherwise use all
  const relevantCells =
    input.selectedFunctions.length > 0
      ? industryCells.filter((c) =>
          input.selectedFunctions.includes(c.functionSlug)
        )
      : industryCells;

  // Sort by disruption score descending
  relevantCells.sort((a, b) => b.disruptionScore - a.disruptionScore);

  // 3. Check for deep playbooks — use getMatrixCell which checks deep/ dir first
  const deepPlaybooks: MatrixCell[] = [];
  for (const cell of relevantCells) {
    const full = getMatrixCell(cell.industrySlug, cell.functionSlug);
    if (full && full.tier === "deep" && full.playbook) {
      deepPlaybooks.push(full);
    }
  }

  // Also check for deep playbooks in closely related industries
  // e.g., if user picks "Construction", also check "Real Estate"
  const relatedIndustries = getRelatedIndustries(input.industrySlug);
  for (const relSlug of relatedIndustries) {
    for (const fn of input.selectedFunctions) {
      const cell = getMatrixCell(relSlug, fn);
      if (cell?.tier === "deep" && cell.playbook) {
        // Tag it so the prompt can note it's from a related industry
        deepPlaybooks.push(cell);
      }
    }
  }

  // 4. Get market report if available
  const markets = getAllMarkets();
  const marketReport =
    markets.find(
      (m) =>
        m.slug === input.industrySlug ||
        m.sector.toLowerCase().includes(input.industry.toLowerCase())
    ) ?? null;

  // 5. Get top-scoring platforms with relevant capabilities
  const companies = getAllCompanies();
  const topPlatforms = [...companies]
    .sort((a, b) => b.scores.total - a.scores.total)
    .slice(0, 8)
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      oneLiner: c.oneLiner,
      scores: c.scores,
      capabilities: c.capabilities,
    }));

  return { matrixCells: relevantCells, deepPlaybooks, marketReport, topPlatforms };
}

function getRelatedIndustries(slug: string): string[] {
  const related: Record<string, string[]> = {
    construction: ["real-estate", "manufacturing"],
    "real-estate": ["construction"],
    healthcare: ["insurance"],
    insurance: ["healthcare", "financial-services"],
    "financial-services": ["insurance"],
    "e-commerce": ["retail"],
    retail: ["e-commerce"],
    "tech-saas": ["media-entertainment"],
    "energy-utilities": ["manufacturing"],
    logistics: ["manufacturing", "retail"],
    manufacturing: ["construction", "logistics"],
  };
  return related[slug] ?? [];
}

/**
 * Serialize retrieved context into a compact text format for the LLM prompt.
 */
export function serializeContext(ctx: RetrievedContext, input: AssessmentInput): string {
  const parts: string[] = [];

  // Matrix cells
  if (ctx.matrixCells.length > 0) {
    parts.push(`## Matrix Data: ${input.industry} Industry`);
    parts.push(
      `${ctx.matrixCells.length} function cells analyzed. Ordered by disruption score (10=highest opportunity):\n`
    );
    for (const cell of ctx.matrixCells) {
      parts.push(`### ${cell.jobFunction} (Disruption Score: ${cell.disruptionScore}/10)`);
      parts.push(cell.summary);
      if (cell.workflows?.length) {
        parts.push("Key workflows:");
        for (const wf of cell.workflows) {
          parts.push(
            `  - ${wf.name} [${wf.agentPotential} potential]: ${wf.description}. Pain: ${wf.currentPain}`
          );
        }
      }
      if (cell.pactAssessment) {
        parts.push(`WACT Assessment: ${cell.pactAssessment}`);
      }
      parts.push("");
    }
  }

  // Deep playbooks
  if (ctx.deepPlaybooks.length > 0) {
    parts.push(`## Deep Strategic Playbooks`);
    parts.push(
      `We have detailed go-to-market playbooks for ${ctx.deepPlaybooks.length} cell(s):\n`
    );
    for (const cell of ctx.deepPlaybooks) {
      parts.push(
        `### PLAYBOOK: ${cell.industry} x ${cell.jobFunction} (Score: ${cell.disruptionScore}/10)`
      );
      const pb = cell.playbook;
      if (pb?.marketSizing) {
        parts.push(
          `Market Size: TAM ${pb.marketSizing.tam}, SAM ${pb.marketSizing.sam}, SOM ${pb.marketSizing.som}`
        );
      }
      if (pb?.currentState) {
        parts.push(`Current State: ${pb.currentState}`);
      }
      if (pb?.idealCustomerProfile) {
        const icp = pb.idealCustomerProfile;
        parts.push(
          `Ideal Customer: ${icp.segment}, size ${icp.size}, pain intensity ${icp.painIntensity}, buyer title ${icp.buyerTitle}, budget ${icp.budget}`
        );
      }
      if (pb?.entryWedge) {
        parts.push(
          `Entry Wedge: ${pb.entryWedge.workflow} — ${pb.entryWedge.why}. POC: ${pb.entryWedge.proofOfConcept}. Time to value: ${pb.entryWedge.timeToValue}`
        );
      }
      if (pb?.successMetrics?.length) {
        parts.push("Success Metrics:");
        for (const m of pb.successMetrics) {
          parts.push(
            `  - ${m.metric}: baseline ${m.baseline} → target ${m.target} (${m.timeframe})`
          );
        }
      }
      if (pb?.competitiveLandscape) {
        parts.push(`Competitive Landscape: ${pb.competitiveLandscape}`);
      }
      if (pb?.pricingModel) {
        parts.push(`Pricing Model: ${pb.pricingModel}`);
      }
      if (pb?.riskAssessment?.length) {
        parts.push("Risks:");
        for (const r of pb.riskAssessment) {
          parts.push(`  - [${r.severity}] ${r.risk}: ${r.mitigation}`);
        }
      }
      if (pb?.deploymentTimeline?.length) {
        parts.push("Deployment Timeline:");
        for (const t of pb.deploymentTimeline) {
          parts.push(`  - ${t.phase} (${t.duration}): ${t.milestone}`);
        }
      }
      parts.push("");
    }
  }

  // Market report
  if (ctx.marketReport) {
    const mr = ctx.marketReport;
    parts.push(`## Market Intelligence: ${mr.sector}`);
    parts.push(mr.narrative);
    parts.push(`Buyer Promise: ${mr.buyerPromise}`);
    parts.push(
      `WACT Score: ${mr.pactScore.total}/100 (${mr.pactScore.dimensions.map((d) => `${d.key}:${d.score}`).join(" ")})`
    );
    if (mr.examples?.length) {
      parts.push("\nReal-world examples:");
      for (const ex of mr.examples.slice(0, 3)) {
        parts.push(
          `  - ${ex.name}: ${ex.challenge}. Impact: ${ex.humanHoursAndDollarImpact}`
        );
      }
    }
    if (mr.quickStart?.length) {
      parts.push(`\nQuick starts: ${mr.quickStart.join("; ")}`);
    }
    if (mr.avoid?.length) {
      parts.push(`Avoid: ${mr.avoid.join("; ")}`);
    }
    parts.push("");
  }

  // Top platforms
  if (ctx.topPlatforms.length > 0) {
    parts.push(`## AgentDash Competitor Landscape (Top ${ctx.topPlatforms.length} platforms)`);
    for (const p of ctx.topPlatforms) {
      parts.push(
        `- ${p.name} (Score: ${p.scores.total}/100): ${p.oneLiner}. Capabilities: ${p.capabilities.slice(0, 5).join(", ")}`
      );
    }
    parts.push("");
  }

  return parts.join("\n");
}
