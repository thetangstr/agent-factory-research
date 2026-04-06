import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { auth } from "@/lib/auth";
import { generateApiKey } from "@/lib/api-auth";
import { eq, isNull, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      revokedAt: apiKeys.revokedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.createdByUserId, session.user.id))
    .orderBy(desc(apiKeys.createdAt));

  return Response.json({ keys: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string } = {};
  try {
    body = await req.json();
  } catch {}

  const name = body.name || "Unnamed Key";
  const { rawKey, keyHash, keyPrefix } = await generateApiKey();

  const [row] = await db
    .insert(apiKeys)
    .values({
      name,
      keyHash,
      keyPrefix,
      createdByUserId: session.user.id,
    })
    .returning({ id: apiKeys.id, createdAt: apiKeys.createdAt });

  return Response.json({
    id: row.id,
    name,
    keyPrefix,
    key: rawKey, // shown once
    createdAt: row.createdAt,
  });
}
