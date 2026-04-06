import { z } from "zod";

// Sub-schemas
const subCriterionScoreSchema = z.object({
  name: z.string(),
  score: z.number().min(1).max(5),
  rationale: z.string(),
});

const dimensionScoreSchema = z.object({
  key: z.string(),
  name: z.string(),
  score: z.number().min(0).max(25), // max 20 for AFEF, 25 for PACT markets
  subCriteria: z.array(subCriterionScoreSchema),
});

const frameworkScoresSchema = z.object({
  total: z.number().min(0).max(100),
  dimensions: z.array(dimensionScoreSchema),
});

const screenshotSchema = z.object({
  path: z.string(),
  alt: z.string(),
  screen: z.string(),
});

const dataSourceSchema = z.object({
  url: z.string(),
  accessedAt: z.string(),
  type: z.enum(["docs", "github", "news", "screenshot", "analyst", "social"]),
});

// Company schema
export const companySchema = z.object({
  name: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum(["open-source", "enterprise", "use-case"]),
  subcategory: z.string().optional(),
  description: z.string(),
  oneLiner: z.string(),
  founded: z.string().optional(),
  funding: z.string().optional(),
  pricing: z.string(),
  website: z.string().url(),
  githubRepo: z.string().optional(),
  githubStars: z.number().optional(),
  screenshots: z.array(screenshotSchema),
  scores: frameworkScoresSchema,
  capabilities: z.array(z.string()),
  uxAnalysis: z.object({
    builderFlow: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    notableFeatures: z.array(z.string()),
  }),
  recentDevelopments: z.array(z.string()),
  lastResearched: z.string(),
  dataSources: z.array(dataSourceSchema),
  confidenceLevel: z.enum(["high", "medium", "low"]),
  scoringRationale: z.string(),
});

// Framework definition schema
const subCriterionDefinitionSchema = z.object({
  name: z.string(),
  weight: z.number(),
  description: z.string(),
  rubric: z.object({
    "1": z.string(),
    "3": z.string(),
    "5": z.string(),
  }),
});

const dimensionDefinitionSchema = z.object({
  key: z.string(),
  name: z.string(),
  weight: z.number(),
  description: z.string(),
  subCriteria: z.array(subCriterionDefinitionSchema),
});

export const frameworkSchema = z.object({
  name: z.string(),
  version: z.string(),
  purpose: z.string(),
  dimensions: z.array(dimensionDefinitionSchema),
});

// Vertical market schema
const marketExampleSchema = z.object({
  name: z.string(),
  source: z.string(),
  challenge: z.string(),
  scale: z.string(),
  humanHoursAndDollarImpact: z.string(),
  whyItMatters: z.string(),
});

export const verticalMarketSchema = z.object({
  sector: z.string(),
  slug: z.string(),
  narrative: z.string(),
  buyerPromise: z.string(),
  pactScore: frameworkScoresSchema,
  examples: z.array(marketExampleSchema),
  quickStart: z.array(z.string()),
  avoid: z.array(z.string()),
  consultantSignals: z.array(z.string()),
  obstacles: z.array(z.string()),
  whereDataLives: z.array(z.string()),
  openQuestions: z.array(z.string()),
  collaborationJourney: z
    .object({
      stage: z.string(),
      humanRole: z.string(),
      agentRole: z.string(),
      handoffOutput: z.string(),
    })
    .optional(),
});

// Export types inferred from schemas
export type CompanyData = z.infer<typeof companySchema>;
export type FrameworkData = z.infer<typeof frameworkSchema>;
export type VerticalMarketData = z.infer<typeof verticalMarketSchema>;
