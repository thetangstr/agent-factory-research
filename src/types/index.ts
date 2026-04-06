// Core types for the Agent Factory Research Platform

export interface SubCriterionScore {
  name: string;
  score: number; // 1-5
  rationale: string;
}

export interface DimensionScore {
  key: string;
  name: string;
  score: number; // weighted total out of dimension weight (20 for AFEF, 25 for PACT)
  subCriteria: SubCriterionScore[];
}

export interface FrameworkScores {
  total: number; // out of 100
  dimensions: DimensionScore[];
}

export interface Screenshot {
  path: string; // relative to public/
  alt: string;
  screen: string; // e.g., "builder-ui", "dashboard", "agent-config"
}

export interface DataSource {
  url: string;
  accessedAt: string; // ISO date
  type: "docs" | "github" | "news" | "screenshot" | "analyst" | "social";
}

export interface Company {
  name: string;
  slug: string;
  category: "open-source" | "enterprise" | "use-case";
  subcategory?: string;
  competence?: string; // core competence category
  targetUser?: string; // who is this for
  description: string;
  oneLiner: string;
  founded?: string;
  funding?: string;
  pricing: string;
  website: string;
  githubRepo?: string;
  githubStars?: number;
  screenshots: Screenshot[];
  scores: FrameworkScores;
  capabilities: string[];
  uxAnalysis: {
    builderFlow: string;
    strengths: string[];
    weaknesses: string[];
    notableFeatures: string[];
  };
  recentDevelopments: string[];
  lastResearched: string; // ISO date
  dataSources: DataSource[];
  confidenceLevel: "high" | "medium" | "low";
  scoringRationale: string;
  walkthrough?: {
    title: string;
    steps: {
      image?: string;
      title: string;
      description: string;
    }[];
  };
  youtubeReviews?: {
    videoId: string;
    title: string;
    channel: string;
  }[];
  supportedCUJs?: string[]; // IDs from canonical agentic user journey list
  marketIntelligence?: {
    reviews?: { source: string; rating: number; reviewCount?: number; summary: string }[];
    metrics?: { metric: string; value: string; source: string; date?: string }[];
    funding?: { total: string; lastRound?: string; valuation?: string; investors?: string[] };
    communityBuzz?: string[];
  };
}

export interface SubCriterionDefinition {
  name: string;
  weight: number;
  description: string;
  rubric: {
    "1": string;
    "3": string;
    "5": string;
  };
}

export interface DimensionDefinition {
  key: string;
  name: string;
  weight: number; // out of 25
  description: string;
  subCriteria: SubCriterionDefinition[];
}

export interface Framework {
  name: string;
  version: string;
  purpose: string;
  dimensions: DimensionDefinition[];
}

export interface MarketExample {
  name: string;
  source: string;
  challenge: string;
  scale: string;
  humanHoursAndDollarImpact: string;
  whyItMatters: string;
}

export interface VerticalMarket {
  sector: string;
  slug: string;
  narrative: string;
  buyerPromise: string;
  pactScore: FrameworkScores;
  examples: MarketExample[];
  quickStart: string[];
  avoid: string[];
  consultantSignals: string[];
  obstacles: string[];
  whereDataLives: string[];
  openQuestions: string[];
  collaborationJourney?: {
    stage: string;
    humanRole: string;
    agentRole: string;
    handoffOutput: string;
  };
}

export interface CUJStage {
  stage: string;
  description: string;
  humanRole: string;
  agentRole: string;
  handoffOutput: string;
  agentDash: {
    uxDescription: string;
    screenshots: Screenshot[];
  };
  competitors: {
    company: string;
    uxDescription: string;
    screenshots: Screenshot[];
  }[];
  gaps: string[];
  advantages: string[];
}

export interface CUJMapping {
  product: string;
  stages: CUJStage[];
  overallGaps: string[];
  overallAdvantages: string[];
  recommendations: string[];
}

// Canonical Agentic User Journey types
export interface AgenticUserJourney {
  id: string;
  name: string;
  description: string;
  category: string;
  keyCapabilities: string[];
  exampleWorkflows: string[];
}

// Matrix types for Industry x Job Function agentification mapping
export interface MatrixWorkflow {
  name: string;
  description: string;
  agentPotential: "high" | "medium" | "low";
  currentPain: string;
}

export interface MatrixPlatformFit {
  companySlug: string;
  fitScore: number; // 1-5
  rationale: string;
}

export interface MatrixCell {
  industry: string;
  industrySlug: string;
  jobFunction: string;
  functionSlug: string;
  disruptionScore: number; // 1-10
  summary: string;
  workflows: MatrixWorkflow[];
  tier: "deep" | "light";
  // Deep tier — full playbook fields
  platformFit?: MatrixPlatformFit[];
  businessOutcome?: string;
  examples?: string[];
  obstacles?: string[];
  pactAssessment?: string;
  playbook?: {
    marketSizing?: { tam: string; sam: string; som: string; source?: string };
    currentState?: string; // how this work is done today
    idealCustomerProfile?: { segment: string; size: string; painIntensity: string; buyerTitle: string; budget: string };
    entryWedge?: { workflow: string; why: string; proofOfConcept: string; timeToValue: string };
    successMetrics?: { metric: string; baseline: string; target: string; timeframe: string }[];
    riskAssessment?: { risk: string; severity: "high" | "medium" | "low"; mitigation: string }[];
    regulatoryConsiderations?: string[];
    buyerJourney?: { stage: string; action: string; stakeholder: string }[];
    competitiveLandscape?: string;
    pricingModel?: string;
    deploymentTimeline?: { phase: string; duration: string; milestone: string }[];
  };
}

// Function hierarchy for expanded matrix
export interface FunctionCategory {
  key: string;
  name: string;
  subFunctions: { key: string; name: string }[];
}

// Utility types for filtering and sorting
export type SortField =
  | "name"
  | "scoreTotal"
  | `score_${string}`;

export type SortDirection = "asc" | "desc";

export interface FilterState {
  categories: string[];
  scoreRange: [number, number];
  searchQuery: string;
}
