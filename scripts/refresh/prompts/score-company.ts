/**
 * Prompts for AFEF scoring of companies.
 */
import fs from "fs";

export function buildScoringSystemPrompt(frameworkPath: string): string {
  const framework = JSON.parse(fs.readFileSync(frameworkPath, "utf-8"));

  let rubricText = `You are scoring an agentic AI platform using the Agent Factory Evaluation Framework (AFEF v${framework.version}).

SCORING INSTRUCTIONS:
- Score each sub-criterion from 1 to 5 using the rubric below
- Provide a brief rationale for each score
- Be consistent: similar capabilities across companies should yield similar scores
- Base scores ONLY on the company data provided, not assumptions

FRAMEWORK DIMENSIONS AND RUBRICS:\n\n`;

  for (const dim of framework.dimensions) {
    rubricText += `## ${dim.key}: ${dim.name} (weight: ${dim.weight})\n${dim.description}\n\n`;
    for (const sc of dim.subCriteria) {
      rubricText += `### ${sc.name} (weight: ${sc.weight})\n${sc.description}\n`;
      rubricText += `  1 = ${sc.rubric["1"]}\n  3 = ${sc.rubric["3"]}\n  5 = ${sc.rubric["5"]}\n\n`;
    }
  }

  rubricText += `OUTPUT FORMAT (valid JSON, no markdown fencing):
{
  "total": <number>,
  "dimensions": [
    {
      "key": "<dim key>",
      "name": "<dim name>",
      "score": <weighted sum>,
      "subCriteria": [
        { "name": "<sub name>", "score": <1-5>, "rationale": "<brief reason>" }
      ]
    }
  ],
  "scoringRationale": "<2-3 sentence overall summary>"
}

IMPORTANT: The dimension "score" field is the WEIGHTED SUM of its sub-criteria:
score = sum(subCriterion.score * subCriterion.weight / 5) for each sub-criterion.
The "total" is the sum of all dimension scores.`;

  return rubricText;
}

export function buildScoringUserPrompt(companyData: string): string {
  return `Score the following company using the AFEF framework:

${companyData}

Return the scores as JSON.`;
}
