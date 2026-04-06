import { db } from "@/db";
import { assessments } from "@/db/schema";
import { authenticateRequest } from "@/lib/api-auth";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [row] = await db
    .select()
    .from(assessments)
    .where(
      and(
        eq(assessments.id, id),
        auth.apiKeyId
          ? eq(assessments.apiKeyId, auth.apiKeyId)
          : eq(assessments.createdByUserId, auth.userId!),
      ),
    )
    .limit(1);

  if (!row) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(row);
}
