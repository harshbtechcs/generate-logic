import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, CalendarCheck, Map as MapIcon, SquareTerminal, Trophy } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Practice",
  description: "Daily DevOps challenge, quizzes, a browser terminal with guided missions and a leaderboard — practise Cloud & DevOps every day.",
};

const items = [
  { href: "/daily", icon: CalendarCheck, title: "Daily Challenge", text: "One new question every day. Keep your streak alive.", tone: "text-amber-300 border-amber-300/35 bg-amber-300/10" },
  { href: "/quiz", icon: Brain, title: "Quizzes", text: "10 questions per tool, 10 seconds each, new questions every time.", tone: "text-brand-teal border-brand-teal/35 bg-brand-teal/10" },
  { href: "/terminal", icon: SquareTerminal, title: "Command Playground", text: "Practise Linux, Git, Docker, Kubernetes and Terraform commands in your browser.", tone: "text-green-300 border-green-400/35 bg-green-400/10" },
  { href: "/roadmap", icon: MapIcon, title: "DevOps Roadmap", text: "Follow the right order and watch every step turn green.", tone: "text-blue-300 border-blue-400/35 bg-blue-400/10" },
  { href: "/leaderboard", icon: Trophy, title: "Leaderboard", text: "Earn XP for everything you practise and climb the weekly board.", tone: "text-orange-300 border-orange-400/35 bg-orange-400/10" },
];

export default function PracticePage() {
  return (
    <>
      <PageHeader kicker="PRACTICE" title="Practise every day" intro="Watching videos is step one. These help you actually remember it — and show your progress as you go." />
      <section className="mx-auto grid max-w-site grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 px-5 pb-28 sm:px-8">
        {items.map((it, i) => (
          <Reveal key={it.href} delay={(i % 3) * 0.08}>
            <Link href={it.href} className="gl-card group flex h-full flex-col gap-4 rounded-[20px] border border-slate-400/15 bg-white/[0.03] p-6">
              <span className={`gl-ico flex h-12 w-12 items-center justify-center rounded-xl border ${it.tone}`}>
                <it.icon size={22} aria-hidden="true" />
              </span>
              <span className="font-display text-xl font-semibold">{it.title}</span>
              <span className="text-text-muted">{it.text}</span>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand-teal">
                Open <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </Reveal>
        ))}
      </section>
    </>
  );
}
