/**
 * Stage 3: Re-score companies using the AFEF framework.
 */
import fs from "fs";
import path from "path";
import type { PipelineConfig } from "../config.js";
import type { LLMClient } from "../llm-client.js";
import {
  buildScoringSystemPrompt,
  buildScoringUserPrompt,
} from "../prompts/score-company.js";

interface ScoreResult {
  slug: string;
  oldTotal: number;
  newTotal: number;
  flagged: boolean; // large score change
  error?: string;
}

export async function scoreCompanies(
  config: PipelineConfig,
  llm: LLMClient,
  targetSlugs?: string[]
): Promise<ScoreResult[]> {
  const systemPrompt = buildScoringSystemPrompt(config.frameworkPath);
  const files = fs
    .readdirSync(config.companiesDir)
    .filter((f) => f.endsWith(".json"));

  const results: ScoreResult[] = [];

  for (let i = 0; i < files.length; i += config.concurrency) {
    const chunk = files.slice(i, i + config.concurrency);
    const chunkResults = await Promise.all(
      chunk.map((file) =>
        scoreOneCompany(config, llm, systemPrompt, file, targetSlugs)
      )
    );
    results.push(...chunkResults.filter(Boolean) as ScoreResult[]);
  }

  return results;
}

async function scoreOneCompany(
  config: PipelineConfig,
  llm: LLMClient,
  systemPrompt: string,
  file: string,
  targetSlugs?: string[]
): Promise<ScoreResult | null> {
  const slug = file.replace(".json", "");
  if (targetSlugs && !targetSlugs.includes(slug)) return null;

  const filePath = path.join(config.companiesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const oldTotal = data.scores?.total ?? 0;

  console.log(`  [score] ${data.name} (current: ${oldTotal})`);

  try {
    // Build a summary of the company for scoring
    const companySummary = JSON.stringify(
      {
        name: data.name,
        category: data.category,
        description: data.description,
        capabilities: data.capabilities,
        funding: data.funding,
        pricing: data.pricing,
        githubStars: data.githubStars,
        githubRepo: data.githubRepo,
        uxAnalysis: data.uxAnalysis,
        recentDevelopments: data.recentDevelopments?.slice(0, 5),
        marketIntelligence: data.marketIntelligence,
      },
      null,
      2
    );

    const response = await llm.chat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildScoringUserPrompt(companySummary) },
      ],
      temperature: 0.3,
      maxTokens: 4096,
      jsonMode: true,
    });

    let scores: Record<string, unknown>;
    try {
      const cleaned = response.content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      scores = JSON.parse(cleaned);
    } catch {
      return { slug, oldTotal, newTotal: oldTotal, flagged: false, error: "Invalid JSON from LLM" };
    }

    const newTotal = (scores.total as number) ?? 0;

    // Flag large changes (>15 point swing) for human review
    const flagged = Math.abs(newTotal - oldTotal) > 15;
    if (flagged) {
      console.log(`    FLAGGED: ${slug} score change ${oldTotal} -> ${newTotal} (delta: ${newTotal - oldTotal})`);
    }

    // Apply scores unless flagged
    if (!flagged && !config.dryRun) {
      data.scores = {
        total: newTotal,
        dimensions: scores.dimensions ?? data.scores.dimensions,
      };
      if (scores.scoringRationale) {
        data.scoringRationale = scores.scoringRationale;
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
      console.log(`    Scored: ${oldTotal} -> ${newTotal}`);
    } else if (config.dryRun) {
      console.log(`    [dry-run] Would score: ${oldTotal} -> ${newTotal}`);
    }

    return { slug, oldTotal, newTotal, flagged };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`    ERROR: ${msg}`);
    return { slug, oldTotal, newTotal: oldTotal, flagged: false, error: msg };
  }
}
