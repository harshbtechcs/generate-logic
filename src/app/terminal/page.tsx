import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { TRACKS, type Track } from "@/lib/terminal/missions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Playground } from "@/components/terminal/Playground";

export const metadata: Metadata = {
  title: "Command Playground — practise Linux, Git, Docker, Kubernetes & Terraform",
  description: "A safe in-browser terminal with guided missions. Practise real DevOps commands without installing anything.",
};
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function TerminalPage({ searchParams }: Props) {
  const sp = await searchParams;
  const session = await getSession();
  const saved = session
    ? (await db.terminalProgress.findMany({ where: { userId: session.user.id }, select: { missionId: true } })).map((r) => r.missionId)
    : [];
  const wanted = typeof sp.tool === "string" ? sp.tool : "";
  const startTool: Track["tool"] = TRACKS.find((t) => t.tool === wanted)?.tool ?? "linux";

  return (
    <>
      <PageHeader
        kicker="COMMAND PLAYGROUND"
        title="Practise real commands"
        intro="A safe, simulated terminal right in your browser. Finish guided missions for Linux, Git, Docker, Kubernetes and Terraform — no setup, nothing to break."
      />
      <section className="mx-auto max-w-site px-5 pb-28 sm:px-8">
        <Playground signedIn={!!session} savedDone={saved} startTool={startTool} />
      </section>
    </>
  );
}
