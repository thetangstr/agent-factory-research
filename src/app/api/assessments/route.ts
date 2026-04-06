import { db } from "@/db";
import { assessments } from "@/db/schema";
import { authenticateRequest } from "@/lib/api-auth";
import { desc, eq, or } from "drizzle-orm";

export async function GET(req: Request) {
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  const rows = await db
    .select({
      id: assessments.id,
      companyName: assessments.companyName,
      industry: assessments.industry,
      status: assessments.status,
      externalRef: assessments.externalRef,
      durationMs: assessments.durationMs,
      createdAt: assessments.createdAt,
      completedAt: assessments.completedAt,
    })
    .from(assessments)
    .where(
      auth.apiKeyId
        ? eq(assessments.apiKeyId, auth.apiKeyId)
        : eq(assessments.createdByUserId, auth.userId!),
    )
    .orderBy(desc(assessments.createdAt))
    .limit(limit)
    .offset(offset);

  return Response.json({ assessments: rows });
}
