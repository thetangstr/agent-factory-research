/**
 * Prompts for discovering new agentic AI companies.
 */

export function buildDiscoverySystemPrompt(): string {
  return `You are a market research analyst identifying NEW agentic AI platforms and tools.
An "agentic AI platform" is a product that lets organizations CREATE, ORCHESTRATE, or OPERATE
autonomous AI agents — not just AI-powered SaaS tools or chatbots.

Categories:
- open-source: OSS frameworks/libraries for building agents
- enterprise: Commercial platforms for enterprise agent deployment
- use-case: Vertical-specific agent products (voice, security, IT, etc.)

Given search results and a list of companies ALREADY in our database,
identify NEW candidates that are NOT duplicates.

Return valid JSON (no markdown fencing):
{
  "candidates": [
    {
      "name": "Company Name",
      "slug": "company-name",
      "website": "https://...",
      "category": "open-source|enterprise|use-case",
      "subcategory": "short-label",
      "description": "2-3 sentence description",
      "oneLiner": "One-line summary",
      "reason": "Why this is relevant to our database",
      "confidence": "high|medium|low"
    }
  ]
}

Rules:
- Only return candidates with confidence "high" or "medium"
- Exclude companies that are just AI wrappers or simple chatbot builders
- Must be an actual product, not a research paper or concept
- Normalize slugs: lowercase, hyphens, no special chars`;
}

export function buildDiscoveryUserPrompt(
  existingSlugs: string[],
  searchResults: string
): string {
  return `EXISTING COMPANIES (do not duplicate):
${existingSlugs.join(", ")}

SEARCH RESULTS FOR NEW AGENTIC AI PLATFORMS:
${searchResults}

Identify new agentic AI companies NOT already in our database.`;
}
