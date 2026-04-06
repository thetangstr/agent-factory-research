#!/usr/bin/env npx tsx
/**
 * Daily Refresh Pipeline — main orchestrator.
 *
 * Usage:
 *   npx tsx scripts/refresh/index.ts                    # full pipeline
 *   npx tsx scripts/refresh/index.ts --stage refresh    # single stage
 *   npx tsx scripts/refresh/index.ts --company crewai   # single company
 *   npx tsx scripts/refresh/index.ts --dry-run          # preview changes
 *   npx tsx scripts/refresh/index.ts --no-discover      # skip discovery
 *   npx tsx scripts/refresh/index.ts --no-screenshots   # skip screenshots
 */
import fs from "fs";
import path from "path";
import { loadConfig } from "./config.js";
import { LLMClient } from "./llm-client.js";
import { WebSearchClient } from "./web-search.js";
import { refreshCompanies } from "./stages/refresh.js";
import { discoverCompanies } from "./stages/discover.js";
import { scoreCompanies } from "./stages/score.js";
import { captureScreenshots } from "./stages/screenshot.js";

// Parse CLI args
const args = process.argv.slice(2);
function flag(name: string): boolean {
  return args.includes(`--${name}`);
}
function option(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] : undefined;
}

async function main() {
  const stage = option("stage");
  const company = option("company");
  const dryRun = flag("dry-run");
  const noDiscover = flag("no-discover");
  const noScreenshots = flag("no-screenshots");

  const config = loadConfig({
    dryRun,
    discoveryEnabled: !noDiscover,
    screenshotsEnabled: !noScreenshots,
  });

  // Validate API keys
  if (!config.primary.apiKey) {
    console.error("ERROR: REFRESH_LLM_API_KEY is required. Set it in .env.local or environment.");
    process.exit(1);
  }
  if (!config.search.apiKey) {
    console.error("ERROR: REFRESH_SEARCH_API_KEY is required. Set it in .env.local or environment.");
    process.exit(1);
  }

  const llm = new LLMClient(config.primary, config.fallback);
  const search = new WebSearchClient(config.search);

  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  console.log(`\n=== Refresh Pipeline [${runId}] ===`);
  console.log(`  LLM: ${config.primary.model} @ ${config.primary.baseUrl}`);
  console.log(`  Search: ${config.search.provider}`);
  console.log(`  Concurrency: ${config.concurrency}`);
  if (dryRun) console.log("  MODE: DRY RUN (no files modified)");
  if (company) console.log(`  TARGET: ${company}`);
  console.log("");

  const targetSlugs = company ? [company] : undefined;
  const log: string[] = [`# Refresh Log — ${new Date().toISOString()}\n`];

  // Stage 1: Refresh existing companies
  if (!stage || stage === "refresh") {
    console.log("STAGE 1: Refreshing existing companies...");
    const results = await refreshCompanies(config, llm, search, targetSlugs);
    const updated = results.filter((r) => r.updated);
    const errors = results.filter((r) => r.error);
    console.log(`  Done: ${updated.length} updated, ${errors.length} errors\n`);

    log.push(`## Stage 1: Refresh`);
    log.push(`Updated: ${updated.map((r) => r.slug).join(", ") || "none"}`);
    for (const r of updated) {
      log.push(`- ${r.slug}: ${r.changes.join("; ")}`);
    }
    if (errors.length) {
      log.push(`Errors: ${errors.map((r) => `${r.slug}: ${r.error}`).join("; ")}`);
    }
    log.push("");
  }

  // Stage 2: Discover new companies
  if ((!stage || stage === "discover") && !company) {
    console.log("STAGE 2: Discovering new companies...");
    const discovery = await discoverCompanies(config, llm, search);
    console.log(`  Done: ${discovery.added.length} added, ${discovery.errors.length} errors\n`);

    log.push(`## Stage 2: Discovery`);
    log.push(`Added: ${discovery.added.join(", ") || "none"}`);
    if (discovery.errors.length) {
      log.push(`Errors: ${discovery.errors.join("; ")}`);
    }
    log.push("");
  }

  // Stage 3: Re-score companies
  if (!stage || stage === "score") {
    console.log("STAGE 3: Re-scoring companies...");
    const scores = await scoreCompanies(config, llm, targetSlugs);
    const flagged = scores.filter((s) => s.flagged);
    console.log(`  Done: ${scores.length} scored, ${flagged.length} flagged for review\n`);

    log.push(`## Stage 3: Scoring`);
    for (const s of scores) {
      const marker = s.flagged ? " ⚠️ FLAGGED" : "";
      log.push(`- ${s.slug}: ${s.oldTotal} -> ${s.newTotal}${marker}`);
    }
    log.push("");
  }

  // Stage 4: Capture screenshots
  if (!stage || stage === "screenshot") {
    console.log("STAGE 4: Capturing screenshots...");
    const screenshots = await captureScreenshots(config, targetSlugs);
    console.log(`  Done: ${screenshots.captured} captured\n`);

    log.push(`## Stage 4: Screenshots`);
    log.push(`Captured: ${screenshots.captured}`);
    if (screenshots.errors.length) {
      log.push(`Errors: ${screenshots.errors.join("; ")}`);
    }
    log.push("");
  }

  // Stage 5: Validate
  if (!stage || stage === "validate") {
    console.log("STAGE 5: Validating data...");
    try {
      const { execSync } = await import("child_process");
      execSync("npx tsx src/lib/validate-data.ts", {
        encoding: "utf-8",
        stdio: "pipe",
      });
      console.log("  Validation passed\n");
      log.push(`## Stage 5: Validation\nPassed\n`);
    } catch (err) {
      console.error("  Validation FAILED\n");
      log.push(`## Stage 5: Validation\nFAILED: ${(err as Error).message}\n`);
    }
  }

  // Write log
  fs.mkdirSync(config.stateDir, { recursive: true });
  const logPath = path.join(config.stateDir, `refresh-log-${runId.slice(0, 10)}.md`);
  fs.writeFileSync(logPath, log.join("\n"));
  console.log(`Log written to ${logPath}`);
  console.log("\n=== Pipeline Complete ===\n");
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
