/**
 * Unified LLM client — calls any OpenAI-compatible chat/completions endpoint.
 * Supports automatic fallback, rate limiting, and retries.
 */
import type { LLMProviderConfig } from "./config.js";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number };
}

// Simple token-bucket rate limiter
class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  constructor(private maxPerMin: number) {
    this.tokens = maxPerMin;
    this.lastRefill = Date.now();
  }
  async acquire(): Promise<void> {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 60000;
    this.tokens = Math.min(this.maxPerMin, this.tokens + elapsed * this.maxPerMin);
    this.lastRefill = now;
    if (this.tokens < 1) {
      const waitMs = ((1 - this.tokens) / this.maxPerMin) * 60000;
      await sleep(waitMs);
      this.tokens = 1;
    }
    this.tokens -= 1;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export class LLMClient {
  private limiters = new Map<string, RateLimiter>();

  constructor(
    private primary: LLMProviderConfig,
    private fallback?: LLMProviderConfig
  ) {
    this.limiters.set(primary.name, new RateLimiter(primary.maxRPM));
    if (fallback) {
      this.limiters.set(fallback.name, new RateLimiter(fallback.maxRPM));
    }
  }

  async chat(req: LLMRequest): Promise<LLMResponse> {
    try {
      return await this.callProvider(this.primary, req);
    } catch (err) {
      if (this.fallback) {
        console.warn(`  Primary LLM failed, falling back: ${(err as Error).message}`);
        return await this.callProvider(this.fallback, req);
      }
      throw err;
    }
  }

  private async callProvider(provider: LLMProviderConfig, req: LLMRequest): Promise<LLMResponse> {
    const limiter = this.limiters.get(provider.name)!;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < 3; attempt++) {
      await limiter.acquire();

      try {
        const body: Record<string, unknown> = {
          model: provider.model,
          messages: req.messages,
          temperature: req.temperature ?? 0.3,
          max_tokens: req.maxTokens ?? 4096,
        };
        if (req.jsonMode) {
          body.response_format = { type: "json_object" };
        }

        const res = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${provider.apiKey}`,
          },
          body: JSON.stringify(body),
        });

        if (res.status === 429) {
          const retryAfter = parseInt(res.headers.get("retry-after") ?? "30", 10);
          console.warn(`  Rate limited by ${provider.name}, waiting ${retryAfter}s...`);
          await sleep(retryAfter * 1000);
          continue;
        }

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`${provider.name} returned ${res.status}: ${text.slice(0, 200)}`);
        }

        const json = await res.json();
        const content = json.choices?.[0]?.message?.content ?? "";
        const usage = json.usage;

        return {
          content,
          provider: provider.name,
          model: provider.model,
          usage: usage
            ? { promptTokens: usage.prompt_tokens, completionTokens: usage.completion_tokens }
            : undefined,
        };
      } catch (err) {
        lastError = err as Error;
        if (attempt < 2) {
          const backoff = Math.pow(2, attempt + 1) * 1000 + Math.random() * 1000;
          console.warn(`  Retry ${attempt + 1}/3 for ${provider.name} in ${(backoff / 1000).toFixed(1)}s`);
          await sleep(backoff);
        }
      }
    }

    throw lastError ?? new Error(`Failed to call ${provider.name}`);
  }
}
