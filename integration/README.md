# AgentDash Integration

Files in this directory are meant to be copied into the AgentDash repo.

## Setup

1. Copy the files:
   ```bash
   cp integration/agentdash/services/agent-research.ts ../agentdash/server/src/services/
   cp integration/agentdash/routes/agent-research.ts ../agentdash/server/src/routes/
   ```

2. Register the route in `agentdash/server/src/app.ts`:
   ```typescript
   import { agentResearchRoutes } from "./routes/agent-research.js";
   // ... inside createApp():
   api.use(agentResearchRoutes(db));
   ```

3. Set environment variables in AgentDash:
   ```
   RESEARCH_APP_URL=https://your-research-app.vercel.app
   RESEARCH_APP_API_KEY=ark_...
   ```

4. Generate an API key from the research app:
   - Sign in to the research app
   - Go to Settings > API Keys (or call `POST /api/keys`)
   - Copy the key and set it as `RESEARCH_APP_API_KEY`

## Usage

```bash
# Trigger an assessment for a company
curl -X POST http://localhost:3100/api/companies/{companyId}/agent-research \
  -H "Authorization: Bearer <board-token>" \
  -H "Content-Type: application/json" \
  -d '{"industry": "Healthcare", "companyUrl": "https://example.com"}'

# Get stored assessment
curl http://localhost:3100/api/companies/{companyId}/agent-research \
  -H "Authorization: Bearer <board-token>"
```

The assessment result is stored in `company_context` with:
- `contextType: "agent_research"`
- `key: "readiness-assessment"` (the full markdown output)
- `key: "assessment-id"` (the research app's assessment UUID)
