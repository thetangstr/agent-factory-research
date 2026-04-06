/**
 * Prompts for researching updates to existing companies.
 */

export function buildRefreshSystemPrompt(): string {
  return `You are a research analyst updating an agentic AI company database.
Given CURRENT company data and RECENT search results, produce a JSON object
containing ONLY fields that need updating.

Rules:
- Only include fields where the search results provide NEW information
- For "recentDevelopments", return new items to PREPEND (array of strings)
- For "capabilities", return new capabilities to ADD (array of strings)
- For numeric fields like "githubStars", return the updated number
- For "funding", "pricing", "description" — return the updated string only if materially changed
- For "marketIntelligence", merge new data points
- Return {} if nothing has changed
- Never fabricate data — only use information from the search results
- Use ISO dates in YYYY-MM-DD format
- Be conservative — only flag changes you're confident about

Return valid JSON only, no markdown fencing.`;
}

export function buildRefreshUserPrompt(
  companyName: string,
  currentData: string,
  searchResults: string
): string {
  return `COMPANY: ${companyName}

CURRENT DATA:
${currentData}

RECENT SEARCH RESULTS:
${searchResults}

Produce a JSON delta with only the fields that need updating. Return {} if no updates are needed.`;
}
