/**
 * Pipeline configuration — loaded from env vars and refresh.config.json.
 */
import fs from "fs";
import path from "path";

export interface LLMProviderConfig {
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  maxRPM: number;
}

export interface PipelineConfig {
  primary: LLMProviderConfig;
  fallback?: LLMProviderConfig;
  search: { provider: "tavily" | "brave" | "serpapi"; apiKey: string };
  concurrency: number;
  maxNewCompaniesPerRun: number;
  discoveryEnabled: boolean;
  screenshotsEnabled: boolean;
  dryRun: boolean;
  companiesDir: string;
  screenshotsDir: string;
  frameworkPath: string;
  stateDir: string;
}

export function loadConfig(overrides: Partial<PipelineConfig> = {}): PipelineConfig {
  // Load optional refresh.config.json
  let fileConfig: Record<string, unknown> = {};
  const configPath = path.resolve("scripts/refresh.config.json");
  if (fs.existsSync(configPath)) {
    fileConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }

  const config: PipelineConfig = {
    primary: {
      name: "primary",
      baseUrl: env("REFRESH_LLM_BASE_URL", "https://api.minimax.chat/v1"),
      model: env("REFRESH_LLM_MODEL", "MiniMax-M1"),
      apiKey: env("REFRESH_LLM_API_KEY", ""),
      maxRPM: parseInt(env("REFRESH_LLM_MAX_RPM", "30"), 10),
    },
    fallback: env("REFRESH_LLM_FALLBACK_BASE_URL")
      ? {
          name: "fallback",
          baseUrl: env("REFRESH_LLM_FALLBACK_BASE_URL", ""),
          model: env("REFRESH_LLM_FALLBACK_MODEL", ""),
          apiKey: env("REFRESH_LLM_FALLBACK_API_KEY", ""),
          maxRPM: 30,
        }
      : undefined,
    search: {
      provider: env("REFRESH_SEARCH_PROVIDER", "brave") as "tavily" | "brave" | "serpapi",
      apiKey: env("REFRESH_SEARCH_API_KEY", ""),
    },
    concurrency: parseInt(env("REFRESH_CONCURRENCY", "3"), 10),
    maxNewCompaniesPerRun: (fileConfig.maxNewCompaniesPerRun as number) ?? 3,
    discoveryEnabled: (fileConfig.discoveryEnabled as boolean) ?? true,
    screenshotsEnabled: (fileConfig.screenshotsEnabled as boolean) ?? true,
    dryRun: false,
    companiesDir: path.resolve("src/data/companies"),
    screenshotsDir: path.resolve("public/screenshots"),
    frameworkPath: path.resolve("src/data/frameworks/product-eval-framework.json"),
    stateDir: path.resolve("state"),
    ...overrides,
  };

  return config;
}

function env(key: string, fallback?: string): string {
  return process.env[key] ?? fallback ?? "";
}
