import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { syncAllPlaylists } from "@/lib/sync";

/**
 * Force an immediate YouTube sync instead of waiting for the hourly refresh.
 *   curl -X POST https://<your-domain>/api/youtube/refresh -H "Authorization: Bearer $REVALIDATE_SECRET"
 * (Phase 7 will add a "Sync now" button in the admin dashboard.)
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const ok =
    !!secret && given.length === secret.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret));
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  revalidateTag("youtube");
  const result = await syncAllPlaylists(); // also copy playlists + lessons into the database
  revalidatePath("/", "layout");
  return Response.json({ refreshed: true, ...result });
}
