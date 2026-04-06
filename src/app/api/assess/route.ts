import { type AssessmentInput, retrieveContext, serializeContext } from "@/lib/assess-retrieval";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/assess-prompt";

const LLM_BASE_URL =
  process.env.ASSESS_LLM_BASE_URL ?? "http://localhost:11434/v1";
const LLM_MODEL = process.env.ASSESS_LLM_MODEL ?? "gemma3";
const LLM_API_KEY = process.env.ASSESS_LLM_API_KEY ?? "ollama";

export async function POST(req: Request) {
  let body: Partial<AssessmentInput>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.companyName || !body.industry || !body.industrySlug) {
    return Response.json(
      { error: "Missing required fields: companyName, industry, industrySlug" },
      { status: 400 }
    );
  }

  const input: AssessmentInput = {
    companyName: body.companyName ?? "",
    industry: body.industry ?? "",
    industrySlug: body.industrySlug ?? "",
    employeeRange: body.employeeRange ?? "Unknown",
    revenueRange: body.revenueRange ?? "Unknown",
    description: body.description ?? "",
    currentSystems: body.currentSystems ?? "",
    automationLevel: body.automationLevel ?? "Unknown",
    challenges: body.challenges ?? "",
    selectedFunctions: body.selectedFunctions ?? [],
    primaryGoal: body.primaryGoal ?? "Both",
    targets: body.targets ?? "",
    timeline: body.timeline ?? "Exploring",
    budgetRange: body.budgetRange ?? "Unknown",
  };

  // RAG: retrieve relevant research data
  const ctx = retrieveContext(input);
  const serialized = serializeContext(ctx, input);

  const systemPrompt = buildSystemPrompt(serialized);
  const userPrompt = buildUserPrompt(input);

  // Call LLM
  let upstream: Response;
  try {
    upstream = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
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
    const msg =
      err instanceof Error ? err.message : "Failed to connect to LLM";
    return Response.json(
      {
        error: `Cannot reach LLM at ${LLM_BASE_URL}. Is Ollama running? (${msg})`,
      },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "unknown error");
    return Response.json(
      { error: `LLM returned ${upstream.status}: ${text}` },
      { status: 502 }
    );
  }

  if (!upstream.body) {
    return Response.json(
      { error: "No response body from LLM" },
      { status: 502 }
    );
  }

  // Transform SSE stream → plain text stream
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const stream = new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (buffer.trim()) {
            for (const line of buffer.split("\n")) {
              processLine(line, controller);
            }
          }
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          processLine(line, controller);
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
    },
  });
}

function processLine(
  line: string,
  controller: ReadableStreamDefaultController
) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data: ")) return;
  const data = trimmed.slice(6);
  if (data === "[DONE]") return;
  try {
    const json = JSON.parse(data);
    const content = json.choices?.[0]?.delta?.content;
    if (content) {
      controller.enqueue(new TextEncoder().encode(content));
    }
  } catch {
    // Skip malformed chunks
  }
}
