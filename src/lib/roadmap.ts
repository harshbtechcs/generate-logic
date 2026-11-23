import "server-only";
import { db } from "@/lib/db";
import { techBySlug, type Technology } from "@/lib/data";
import { getUserQuizBests, type ToolBest } from "@/lib/quiz/stats";
import { questionsForTool } from "@/lib/quiz/bank";
import { TRACKS } from "@/lib/terminal/missions";

/** The recommended order to learn DevOps. Optional steps don't count towards the overall %. */
export const ROADMAP: { stage: string; blurb: string; steps: { slug: string; why: string; optional?: boolean }[] }[] = [
  {
    stage: "Foundations",
    blurb: "Every DevOps tool runs on these.",
    steps: [
      { slug: "linux", why: "Servers, containers and CI runners all run Linux — get comfortable in the terminal first." },
      { slug: "git", why: "All code and infrastructure lives in Git. Branches and pull requests are how teams work." },
      { slug: "networking", why: "IPs, ports, DNS and load balancers — you'll debug these every week." },
    ],
  },
  {
    stage: "Containers",
    blurb: "Package once, run anywhere.",
    steps: [
      { slug: "docker", why: "Build images and run apps the same way on every machine." },
      { slug: "kubernetes", why: "Run containers at scale with self-healing, scaling and rolling updates." },
    ],
  },
  {
    stage: "Automation",
    blurb: "Let machines do the repetitive work.",
    steps: [
      { slug: "cicd", why: "Test and deploy automatically on every push." },
      { slug: "jenkins", why: "The classic automation server still used by many companies." },
      { slug: "ansible", why: "Configure many servers at once with simple YAML playbooks." },
    ],
  },
  {
    stage: "Infrastructure as Code",
    blurb: "Infrastructure you can review and version.",
    steps: [{ slug: "terraform", why: "Create cloud resources from code — plan, review, apply." }],
  },
  {
    stage: "Cloud",
    blurb: "Put it all together on a real cloud.",
    steps: [
      { slug: "aws", why: "The most popular cloud — EC2, S3, IAM, VPC and more." },
      { slug: "azure", why: "Microsoft's cloud, common in enterprises.", optional: true },
      { slug: "gcp", why: "Google's cloud, strong in Kubernetes and data.", optional: true },
    ],
  },
];

export const QUIZ_TARGET = 70; // best quiz score needed to tick the quiz checkpoint

export type Checkpoint = { key: "lessons" | "quiz" | "terminal"; label: string; detail: string; fraction: number; href: string };
export type RoadmapStep = {
  tech: Technology;
  why: string;
  optional: boolean;
  checkpoints: Checkpoint[];
  percent: number;
  status: "done" | "progress" | "todo";
};
export type RoadmapData = { stages: { stage: string; blurb: string; steps: RoadmapStep[] }[]; overall: number; next: RoadmapStep | null; doneSteps: number; totalSteps: number };

/** Roadmap with each step's progress for this user (or empty progress when signed out). */
export async function getRoadmap(userId: string | null): Promise<RoadmapData> {
  const slugs = ROADMAP.flatMap((s) => s.steps.map((x) => x.slug));

  const [lessonRows, bests, missions] = await Promise.all([
    db.lesson.findMany({
      where: { playlist: { status: "PUBLISHED", learningPath: { category: { slug: { in: slugs } } } } },
      select: {
        playlist: { select: { learningPath: { select: { category: { select: { slug: true } } } } } },
        // Signed out: match nobody, so every lesson counts as not done.
        progress: { where: { userId: userId ?? "__signed_out__", completionStatus: "COMPLETED" }, select: { id: true } },
      },
    }),
    userId ? getUserQuizBests(userId) : Promise.resolve(new Map<string, ToolBest>()),
    userId ? db.terminalProgress.findMany({ where: { userId }, select: { missionId: true } }) : Promise.resolve([] as { missionId: string }[]),
  ]);

  const lessons = new Map<string, { total: number; done: number }>();
  for (const l of lessonRows) {
    const slug = l.playlist.learningPath?.category.slug;
    if (!slug) continue;
    const cur = lessons.get(slug) ?? { total: 0, done: 0 };
    cur.total++;
    if (l.progress.length) cur.done++;
    lessons.set(slug, cur);
  }
  const doneMissions = new Set(missions.map((m) => m.missionId));

  const stages = ROADMAP.map((stage) => ({
    stage: stage.stage,
    blurb: stage.blurb,
    steps: stage.steps.flatMap((s): RoadmapStep[] => {
      const tech = techBySlug[s.slug];
      if (!tech) return [];
      const checkpoints: Checkpoint[] = [];
      const ls = lessons.get(s.slug);
      if (ls && ls.total > 0)
        checkpoints.push({ key: "lessons", label: "Watch the lessons", detail: `${ls.done}/${ls.total} lessons`, fraction: ls.done / ls.total, href: `/learn/${s.slug}` });
      if (questionsForTool(s.slug).length) {
        const best = bests.get(s.slug)?.bestPercent ?? 0;
        checkpoints.push({
          key: "quiz",
          label: `Score ${QUIZ_TARGET}%+ in the quiz`,
          detail: bests.has(s.slug) ? `best ${best}%` : "not taken",
          fraction: Math.min(best, QUIZ_TARGET) / QUIZ_TARGET,
          href: `/quiz/${s.slug}`,
        });
      }
      const track = TRACKS.find((t) => t.tool === s.slug);
      if (track) {
        const n = track.missions.filter((m) => doneMissions.has(m.id)).length;
        checkpoints.push({ key: "terminal", label: "Finish the terminal missions", detail: `${n}/${track.missions.length} missions`, fraction: n / track.missions.length, href: `/terminal?tool=${s.slug}` });
      }
      const percent = checkpoints.length ? Math.round((checkpoints.reduce((a, c) => a + c.fraction, 0) / checkpoints.length) * 100) : 0;
      return [{ tech, why: s.why, optional: !!s.optional, checkpoints, percent, status: percent >= 100 ? "done" : percent > 0 ? "progress" : "todo" }];
    }),
  }));

  const core = stages.flatMap((s) => s.steps).filter((s) => !s.optional);
  const overall = core.length ? Math.round(core.reduce((a, s) => a + s.percent, 0) / core.length) : 0;
  return { stages, overall, next: core.find((s) => s.status !== "done") ?? null, doneSteps: core.filter((s) => s.status === "done").length, totalSteps: core.length };
}
