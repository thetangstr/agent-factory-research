import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { auth } from "@/lib/auth";

async function sha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  apiKeyId?: string;
}

/**
 * Authenticate a request via session cookie OR Bearer API key.
 * Returns { authenticated: false } if neither is valid.
 */
export async function authenticateRequest(req: Request): Promise<AuthResult> {
  // Try API key first (Bearer ark_...)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ark_")) {
    const rawKey = authHeader.slice(7);
    const hash = await sha256(rawKey);
    const [record] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.keyHash, hash), isNull(apiKeys.revokedAt)))
      .limit(1);

    if (record) {
      // Fire-and-forget: update lastUsedAt
      db.update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, record.id))
        .then(() => {})
        .catch(() => {});
      return { authenticated: true, apiKeyId: record.id, userId: record.createdByUserId };
    }
    return { authenticated: false };
  }

  // Try session cookie
  const session = await auth();
  if (session?.user?.id) {
    return { authenticated: true, userId: session.user.id };
  }

  return { authenticated: false };
}

/**
 * Generate a new API key. Returns the raw key (shown once) and the hash (stored).
 */
export async function generateApiKey(): Promise<{ rawKey: string; keyHash: string; keyPrefix: string }> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const rawKey = `ark_${hex}`;
  const keyHash = await sha256(rawKey);
  const keyPrefix = rawKey.slice(0, 12);
  return { rawKey, keyHash, keyPrefix };
}
