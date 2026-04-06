/**
 * Stage 2: Discover new agentic AI companies not in the database.
 */
import fs from "fs";
import path from "path";
import type { PipelineConfig } from "../config.js";
import type { LLMClient } from "../llm-client.js";
import type { WebSearchClient } from "../web-search.js";
import {
  buildDiscoverySystemPrompt,
  buildDiscoveryUserPrompt,
} from "../prompts/discover-new.js";

interface DiscoveryCandidate {
  name: string;
  slug: string;
  website: string;
  category: string;
  subcategory: string;
  description: string;
  oneLiner: string;
  confidence: string;
}

interface DiscoveryResult {
  candidates: DiscoveryCandidate[];
  added: string[];
  errors: string[];
}

export async function discoverCompanies(
  config: PipelineConfig,
  llm: LLMClient,
  search: WebSearchClient
): Promise<DiscoveryResult> {
  if (!config.discoveryEnabled) {
    console.log("  [discover] Disabled, skipping");
    return { candidates: [], added: [], errors: [] };
  }

  console.log("  [discover] Searching for new agentic AI companies...");

  // Get existing slugs
  const existingSlugs = fs
    .readdirSync(config.companiesDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));

  // Run discovery searches
  const discoveryQueries = [
    "new agentic AI platform launch 2026",
    "AI agent framework open source 2026",
    "agentic AI startup funding 2025 2026",
    "multi-agent orchestration tool new launch",
    "AI agent builder platform enterprise 2026",
    "autonomous AI agent product launch",
  ];

  const allResults: string[] = [];
  for (const q of discoveryQueries) {
    try {
      const results = await search.search(q, 5);
      for (const r of results) {
        allResults.push(`[${r.title}](${r.url})\n${r.snippet}`);
      }
    } catch {
      // Non-fatal
    }
  }

  if (allResults.length === 0) {
    console.log("    No search results for discovery");
    return { candidates: [], added: [], errors: [] };
  }

  // Ask LLM to identify candidates
  const response = await llm.chat({
    messages: [
      { role: "system", content: buildDiscoverySystemPrompt() },
      {
        role: "user",
        content: buildDiscoveryUserPrompt(existingSlugs, allResults.join("\n\n")),
      },
    ],
    temperature: 0.3,
    maxTokens: 4096,
    jsonMode: true,
  });

  let parsed: { candidates: DiscoveryCandidate[] };
  try {
    const cleaned = response.content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return { candidates: [], added: [], errors: ["Could not parse discovery response"] };
  }

  // Filter to high-confidence, non-duplicate, up to max limit
  const viable = (parsed.candidates ?? [])
    .filter((c) => c.confidence === "high" && !existingSlugs.includes(c.slug))
    .slice(0, config.maxNewCompaniesPerRun);

  console.log(`    Found ${parsed.candidates?.length ?? 0} candidates, ${viable.length} viable`);

  const added: string[] = [];
  const errors: string[] = [];

  for (const candidate of viable) {
    try {
      const companyJson = buildNewCompanyJson(candidate);
      if (!config.dryRun) {
        const outPath = path.join(config.companiesDir, `${candidate.slug}.json`);
        fs.writeFileSync(outPath, JSON.stringify(companyJson, null, 2) + "\n");
      }
      added.push(candidate.slug);
      console.log(`    ADDED: ${candidate.name} (${candidate.slug})`);
    } catch (err) {
      errors.push(`${candidate.slug}: ${(err as Error).message}`);
    }
  }

  return { candidates: viable, added, errors };
}

function buildNewCompanyJson(candidate: DiscoveryCandidate): Record<string, unknown> {
  const today = new Date().toISOString().split("T")[0];
  return {
    name: candidate.name,
    slug: candidate.slug,
    category: candidate.category,
    subcategory: candidate.subcategory,
    description: candidate.description,
    oneLiner: candidate.oneLiner,
    pricing: "Unknown — research needed",
    website: candidate.website,
    screenshots: [],
    scores: {
      total: 0,
      dimensions: [
        { key: "CR", name: "Creation", score: 0, subCriteria: [] },
        { key: "OR", name: "Orchestration", score: 0, subCriteria: [] },
        { key: "IN", name: "Integration", score: 0, subCriteria: [] },
        { key: "GV", name: "Governance", score: 0, subCriteria: [] },
        { key: "OP", name: "Operations", score: 0, subCriteria: [] },
      ],
    },
    capabilities: [],
    uxAnalysis: {
      builderFlow: "Not yet analyzed",
      strengths: [],
      weaknesses: [],
      notableFeatures: [],
    },
    recentDevelopments: [`${today}: Added to database via automated discovery`],
    lastResearched: today,
    dataSources: [
      { url: "automated-discovery", accessedAt: today, type: "news" },
    ],
    confidenceLevel: "low",
    scoringRationale: "Newly discovered — pending full research and scoring.",
    supportedCUJs: [],
    walkthrough: {
      title: `How ${candidate.name} Works`,
      steps: [
        {
          title: "Getting Started",
          description: "Setup and initial configuration — details pending research.",
        },
      ],
    },
    youtubeReviews: [],
  };
}
