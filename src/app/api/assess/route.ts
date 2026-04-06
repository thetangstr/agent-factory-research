import { type AssessmentInput, retrieveContext, serializeContext } from "@/lib/assess-retrieval";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/assess-prompt";
import { authenticateRequest } from "@/lib/api-auth";
import { db } from "@/db";
import { assessments } from "@/db/schema";
import { eq } from "drizzle-orm";

export const maxDuration = 120; // Vercel Pro timeout

// ─── CORS helper ───────────────────────────────────────────────────

const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS ?? "").split(",").filter(Boolean);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes("*")) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
  }
  return {};
}

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

// ─── Config ────────────────────────────────────────────────────────

async function fetchCompanyInfo(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AgentDash-Assess/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 3000);
  } catch {
    return "";
  }
}

const LLM_PROVIDER = process.env.ASSESS_LLM_PROVIDER ?? "anthropic";

const ANTHROPIC_BASE_URL =
  process.env.ASSESS_ANTHROPIC_BASE_URL ?? "https://api.minimaxi.com/anthropic";
const ANTHROPIC_API_KEY =
  process.env.ASSESS_ANTHROPIC_API_KEY ?? process.env.ASSESS_LLM_API_KEY ?? "";
const ANTHROPIC_MODEL =
  process.env.ASSESS_ANTHROPIC_MODEL ?? "MiniMax-M2.7-highspeed";

const OPENAI_BASE_URL =
  process.env.ASSESS_LLM_BASE_URL ?? "http://localhost:11434/v1";
const OPENAI_MODEL = process.env.ASSESS_LLM_MODEL ?? "gemma3";
const OPENAI_API_KEY = process.env.ASSESS_LLM_API_KEY ?? "ollama";

// ─── POST handler ──────────────────────────────────────────────────

export async function POST(req: Request) {
  const cors = corsHeaders(req);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400, headers: cors });
  }

  if (!body.companyName || !body.industry || !body.industrySlug) {
    return Response.json(
      { error: "Missing required fields: companyName, industry, industrySlug" },
      { status: 400, headers: cors },
    );
  }

  const input: AssessmentInput = {
    companyName: (body.companyName as string) ?? "",
    industry: (body.industry as string) ?? "",
    industrySlug: (body.industrySlug as string) ?? "",
    employeeRange: (body.employeeRange as string) ?? "Unknown",
    revenueRange: (body.revenueRange as string) ?? "Unknown",
    description: (body.description as string) ?? "",
    currentSystems: (body.currentSystems as string) ?? "",
    automationLevel: (body.automationLevel as string) ?? "Unknown",
    challenges: (body.challenges as string) ?? "",
    selectedFunctions: (body.selectedFunctions as string[]) ?? [],
    primaryGoal: (body.primaryGoal as string) ?? "Both",
    targets: (body.targets as string) ?? "",
    timeline: (body.timeline as string) ?? "Exploring",
    budgetRange: (body.budgetRange as string) ?? "Unknown",
    aiUsageLevel: (body.aiUsageLevel as string) ?? "Not specified",
    aiGovernance: (body.aiGovernance as string) ?? "Not specified",
    agentExperience: (body.agentExperience as string) ?? "Not specified",
    aiOwnership: (body.aiOwnership as string) ?? "Not specified",
  };

  const format = (body.format as string) ?? "stream";
  const externalRef = (body.externalRef as string) ?? null;

  // Auth — optional; if authenticated, we persist the assessment
  const authResult = await authenticateRequest(req);

  // Create DB record if authenticated
  let assessmentId: string | null = null;
  if (authResult.authenticated) {
    try {
      const [row] = await db
        .insert(assessments)
        .values({
          createdByUserId: authResult.userId ?? null,
          apiKeyId: authResult.apiKeyId ?? null,
          externalRef,
          companyName: input.companyName,
          industry: input.industry,
          industrySlug: input.industrySlug,
          input: input as unknown as Record<string, unknown>,
          status: "streaming",
          llmProvider: LLM_PROVIDER,
          llmModel: LLM_PROVIDER === "anthropic" ? ANTHROPIC_MODEL : OPENAI_MODEL,
        })
        .returning({ id: assessments.id });
      assessmentId = row.id;
    } catch {
      // DB not available (local dev without postgres) — continue without persistence
    }
  }

  // Fetch company website for context
  const companyUrl = body.companyUrl as string | undefined;
  let companyWebContent = "";
  if (companyUrl && companyUrl.startsWith("http")) {
    companyWebContent = await fetchCompanyInfo(companyUrl);
  }

  // RAG: retrieve relevant research data
  const ctx = retrieveContext(input);
  const serialized = serializeContext(ctx, input);

  const systemPrompt = buildSystemPrompt(serialized);
  const userPrompt = buildUserPrompt(input, companyWebContent);

  const startTime = Date.now();

  // Get the upstream LLM stream
  const upstreamResult =
    LLM_PROVIDER === "anthropic"
      ? await callAnthropic(systemPrompt, userPrompt)
      : await callOpenAI(systemPrompt, userPrompt);

  if ("error" in upstreamResult) {
    if (assessmentId) {
      db.update(assessments)
        .set({ status: "failed", errorMessage: upstreamResult.error, completedAt: new Date() })
        .where(eq(assessments.id, assessmentId))
        .then(() => {})
        .catch(() => {});
    }
    return Response.json(
      { error: upstreamResult.error },
      { status: upstreamResult.status, headers: cors },
    );
  }

  const { reader, parseLine } = upstreamResult;

  // ─── JSON format: collect everything, return structured response ──
  if (format === "json") {
    let fullOutput = "";
    let buffer = "";
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) {
          for (const line of buffer.split("\n")) {
            const text = parseLine(line);
            if (text) fullOutput += text;
          }
        }
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const text = parseLine(line);
        if (text) fullOutput += text;
      }
    }

    const durationMs = Date.now() - startTime;
    if (assessmentId) {
      db.update(assessments)
        .set({
          status: "completed",
          outputMarkdown: fullOutput,
          durationMs,
          completedAt: new Date(),
        })
        .where(eq(assessments.id, assessmentId))
        .then(() => {})
        .catch(() => {});
    }

    return Response.json(
      {
        id: assessmentId,
        companyName: input.companyName,
        industry: input.industry,
        status: "completed",
        outputMarkdown: fullOutput,
        durationMs,
        createdAt: new Date().toISOString(),
      },
      { headers: cors },
    );
  }

  // ─── Stream format: tee output to accumulate + stream to client ───

  let fullOutput = "";
  let streamBuffer = "";
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (streamBuffer.trim()) {
            for (const line of streamBuffer.split("\n")) {
              const text = parseLine(line);
              if (text) {
                fullOutput += text;
                controller.enqueue(new TextEncoder().encode(text));
              }
            }
          }
          // Save completed assessment
          const durationMs = Date.now() - startTime;
          if (assessmentId) {
            db.update(assessments)
              .set({
                status: "completed",
                outputMarkdown: fullOutput,
                durationMs,
                completedAt: new Date(),
              })
              .where(eq(assessments.id, assessmentId))
              .then(() => {})
              .catch(() => {});
          }
          controller.close();
          return;
        }
        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split("\n");
        streamBuffer = lines.pop() ?? "";
        for (const line of lines) {
          const text = parseLine(line);
          if (text) {
            fullOutput += text;
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      ...(assessmentId ? { "X-Assessment-Id": assessmentId } : {}),
      ...cors,
    },
  });
}

// ─── LLM Providers ─────────────────────────────────────────────────

type UpstreamOk = {
  reader: ReadableStreamDefaultReader<Uint8Array>;
  parseLine: (line: string) => string | null;
};
type UpstreamErr = { error: string; status: number };
type UpstreamResult = UpstreamOk | UpstreamErr;

async function callAnthropic(
  systemPrompt: string,
  userPrompt: string,
): Promise<UpstreamResult> {
  let upstream: Response;
  try {
    upstream = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 16000,
        temperature: 1.0,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        stream: true,
        thinking: { type: "enabled", budget_tokens: 10000 },
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to connect";
    return { error: `Cannot reach MiniMax at ${ANTHROPIC_BASE_URL} (${msg})`, status: 502 };
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "unknown error");
    return { error: `MiniMax returned ${upstream.status}: ${text}`, status: 502 };
  }
  if (!upstream.body) {
    return { error: "No response body from MiniMax", status: 502 };
  }

  return {
    reader: upstream.body.getReader(),
    parseLine: parseAnthropicLine,
  };
}

function parseAnthropicLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data: ")) return null;
  const data = trimmed.slice(6);
  if (data === "[DONE]") return null;
  try {
    const json = JSON.parse(data);
    if (json.type === "content_block_delta" && json.delta?.text) {
      return json.delta.text;
    }
  } catch {}
  return null;
}

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
): Promise<UpstreamResult> {
  let upstream: Response;
  try {
    upstream = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to connect";
    return {
      error: `Cannot reach LLM at ${OPENAI_BASE_URL}. Is Ollama running? (${msg})`,
      status: 502,
    };
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "unknown error");
    return { error: `LLM returned ${upstream.status}: ${text}`, status: 502 };
  }
  if (!upstream.body) {
    return { error: "No response body from LLM", status: 502 };
  }

  return {
    reader: upstream.body.getReader(),
    parseLine: parseOpenAILine,
  };
}

function parseOpenAILine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data: ")) return null;
  const data = trimmed.slice(6);
  if (data === "[DONE]") return null;
  try {
    const json = JSON.parse(data);
    const content = json.choices?.[0]?.delta?.content;
    if (content) return content;
  } catch {}
  return null;
}
