/**
 * Stage 1: Research existing companies for updates.
 */
import fs from "fs";
import path from "path";
import type { PipelineConfig } from "../config.js";
import type { LLMClient } from "../llm-client.js";
import type { WebSearchClient } from "../web-search.js";
import {
  buildRefreshSystemPrompt,
  buildRefreshUserPrompt,
} from "../prompts/refresh-company.js";

interface RefreshResult {
  slug: string;
  updated: boolean;
  changes: string[];
  error?: string;
}

export async function refreshCompanies(
  config: PipelineConfig,
  llm: LLMClient,
  search: WebSearchClient,
  targetSlugs?: string[]
): Promise<RefreshResult[]> {
  const files = fs
    .readdirSync(config.companiesDir)
    .filter((f) => f.endsWith(".json"));

  const results: RefreshResult[] = [];

  // Process in batches for concurrency control
  const batch: string[] = [];
  for (const file of files) {
    const slug = file.replace(".json", "");
    if (targetSlugs && !targetSlugs.includes(slug)) continue;
    batch.push(file);
  }

  for (let i = 0; i < batch.length; i += config.concurrency) {
    const chunk = batch.slice(i, i + config.concurrency);
    const chunkResults = await Promise.all(
      chunk.map((file) => refreshOneCompany(config, llm, search, file))
    );
    results.push(...chunkResults);
  }

  return results;
}

async function refreshOneCompany(
  config: PipelineConfig,
  llm: LLMClient,
  search: WebSearchClient,
  file: string
): Promise<RefreshResult> {
  const slug = file.replace(".json", "");
  const filePath = path.join(config.companiesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  console.log(`  [refresh] ${data.name} (${slug})`);

  try {
    // Run web searches
    const queries = [
      `"${data.name}" agentic AI 2026`,
      `"${data.name}" funding OR acquisition OR pricing 2025 2026`,
      `"${data.name}" new features OR integration OR launch 2025 2026`,
    ];
    if (data.githubRepo) {
      queries.push(`site:github.com ${data.githubRepo} releases`);
    }

    const allResults: string[] = [];
    for (const q of queries) {
      try {
        const results = await search.search(q, 3);
        for (const r of results) {
          allResults.push(`[${r.title}](${r.url})\n${r.snippet}`);
        }
      } catch {
        // Non-fatal: search may fail for some queries
      }
    }

    if (allResults.length === 0) {
      console.log(`    No search results for ${slug}, skipping`);
      return { slug, updated: false, changes: [] };
    }

    // Call LLM for delta
    const systemPrompt = buildRefreshSystemPrompt();
    const userPrompt = buildRefreshUserPrompt(
      data.name,
      JSON.stringify(
        {
          description: data.description,
          funding: data.funding,
          pricing: data.pricing,
          capabilities: data.capabilities,
          githubStars: data.githubStars,
          recentDevelopments: data.recentDevelopments,
          lastResearched: data.lastResearched,
        },
        null,
        2
      ),
      allResults.join("\n\n")
    );

    const response = await llm.chat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      jsonMode: true,
    });

    // Parse delta
    let delta: Record<string, unknown>;
    try {
      const cleaned = response.content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      delta = JSON.parse(cleaned);
    } catch {
      console.log(`    Could not parse LLM response for ${slug}`);
      return { slug, updated: false, changes: [], error: "LLM returned invalid JSON" };
    }

    if (Object.keys(delta).length === 0) {
      console.log(`    No changes for ${slug}`);
      return { slug, updated: false, changes: [] };
    }

    // Apply delta
    const changes: string[] = [];

    if (delta.recentDevelopments && Array.isArray(delta.recentDevelopments)) {
      data.recentDevelopments = [
        ...delta.recentDevelopments,
        ...data.recentDevelopments,
      ];
      changes.push(`+${delta.recentDevelopments.length} recent developments`);
    }

    if (delta.capabilities && Array.isArray(delta.capabilities)) {
      const existing = new Set(data.capabilities);
      const newCaps = (delta.capabilities as string[]).filter((c) => !existing.has(c));
      data.capabilities.push(...newCaps);
      if (newCaps.length) changes.push(`+${newCaps.length} capabilities`);
    }

    const scalarFields = [
      "funding", "pricing", "description", "githubStars",
      "oneLiner", "founded",
    ] as const;
    for (const field of scalarFields) {
      if (delta[field] !== undefined && delta[field] !== data[field]) {
        changes.push(`${field}: ${JSON.stringify(data[field])} -> ${JSON.stringify(delta[field])}`);
        data[field] = delta[field];
      }
    }

    if (delta.marketIntelligence && typeof delta.marketIntelligence === "object") {
      data.marketIntelligence = {
        ...data.marketIntelligence,
        ...(delta.marketIntelligence as object),
      };
      changes.push("marketIntelligence updated");
    }

    // Update metadata
    data.lastResearched = new Date().toISOString().split("T")[0];
    data.dataSources.push({
      url: "automated-refresh",
      accessedAt: new Date().toISOString().split("T")[0],
      type: "news",
    });

    if (!config.dryRun) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    }

    console.log(`    Updated: ${changes.join(", ")}`);
    return { slug, updated: true, changes };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`    ERROR: ${msg}`);
    return { slug, updated: false, changes: [], error: msg };
  }
}
