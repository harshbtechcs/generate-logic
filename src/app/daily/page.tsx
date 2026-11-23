import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { getDailyState } from "@/lib/daily";
import { nextIstMidnight } from "@/lib/ist";
import { PageHeader } from "@/components/ui/PageHeader";
import { DailyChallenge } from "@/components/daily/DailyChallenge";

export const metadata: Metadata = {
  title: "Daily DevOps Challenge",
  description: "One new Cloud & DevOps question every day. Answer it, keep your streak alive and climb the Generate Logic leaderboard.",
};
// The question and the user's answer change every day.
export const dynamic = "force-dynamic";

export default async function DailyPage() {
  const session = await getSession();
  const state = await getDailyState(session?.user.id ?? null);
  return (
    <>
      <PageHeader kicker="DAILY CHALLENGE" title="Today's DevOps question" intro="A new question every day, the same for everyone. Answer it to keep your streak 🔥 going." />
      <section className="mx-auto max-w-site px-5 pb-28 sm:px-8">
        <DailyChallenge state={state} signedIn={!!session} nextAt={nextIstMidnight().getTime()} />
      </section>
    </>
  );
}
