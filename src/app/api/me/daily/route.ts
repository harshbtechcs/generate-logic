import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDailyStreak } from "@/lib/daily";

// Used by the navbar to show a reminder dot when today's challenge isn't done.
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ signedIn: false }, { headers: { "Cache-Control": "no-store" } });
  const s = await getDailyStreak(session.user.id);
  return NextResponse.json({ signedIn: true, doneToday: s.doneToday, streak: s.streak }, { headers: { "Cache-Control": "no-store" } });
}
