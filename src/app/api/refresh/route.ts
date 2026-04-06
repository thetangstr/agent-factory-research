import { auth } from "@/lib/auth";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";
const GITHUB_REPO = process.env.GITHUB_REPO ?? "thetangstr/agent-factory-research";
const WORKFLOW_FILE = "daily-refresh.yml";

// GET — return recent workflow runs
export async function GET() {
  if (!GITHUB_TOKEN) {
    return Response.json({
      running: false,
      runs: [],
      error: "GITHUB_TOKEN not configured",
    });
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=5`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 0 },
      },
    );

    if (!res.ok) {
      const text = await res.text();
      return Response.json({ error: `GitHub API error: ${res.status} ${text}` }, { status: 502 });
    }

    const data = await res.json();
    const runs = (data.workflow_runs ?? []).map(
      (r: Record<string, unknown>) => ({
        id: r.id,
        status: r.status,
        conclusion: r.conclusion,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        htmlUrl: r.html_url,
        event: r.event,
      }),
    );

    const running = runs.some(
      (r: { status: string }) => r.status === "in_progress" || r.status === "queued",
    );

    return Response.json({ running, runs });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 502 });
  }
}

// POST — dispatch a workflow run
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!GITHUB_TOKEN) {
    return Response.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });
  }

  let opts: { stage?: string; company?: string; dryRun?: boolean } = {};
  try {
    opts = await req.json();
  } catch {}

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          ref: "main",
          inputs: {
            stage: opts.stage || "",
            company: opts.company || "",
            dry_run: String(!!opts.dryRun),
          },
        }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      return Response.json(
        { error: `GitHub API error: ${res.status} ${text}` },
        { status: 502 },
      );
    }

    return Response.json(
      {
        dispatched: true,
        message: "Workflow dispatch triggered. Check the Runs section for progress.",
      },
      { status: 202 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 502 });
  }
}
