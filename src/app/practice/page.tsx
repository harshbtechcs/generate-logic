import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ColorCard } from "@/components/motion/ColorCard";
import type { IconName, ThemeName } from "@/lib/themes";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Practice",
  description: "Daily DevOps challenge, quizzes, a browser terminal with guided missions and a leaderboard — practise Cloud & DevOps every day.",
};

const items: { href: string; theme: ThemeName; icon: IconName; word: string; title: string; text: string }[] = [
  { href: "/daily", theme: "amber", icon: "calendar", word: "DAILY", title: "Daily Challenge", text: "One new question every day. Keep your streak alive." },
  { href: "/quiz", theme: "violet", icon: "brain", word: "QUIZ", title: "Quizzes", text: "10 questions per tool, 10 seconds each, new questions every time." },
  { href: "/terminal", theme: "green", icon: "terminal", word: "SHELL", title: "Command Playground", text: "Practise Linux, Git, Docker, Kubernetes and Terraform commands in your browser." },
  { href: "/roadmap", theme: "blue", icon: "map", word: "PATH", title: "DevOps Roadmap", text: "Follow the right order and watch every step turn green." },
  { href: "/leaderboard", theme: "orange", icon: "trophy", word: "XP", title: "Leaderboard", text: "Earn XP for everything you practise and climb the weekly board." },
]

export default function PracticePage() {
  return (
    <>
      <PageHeader kicker="PRACTICE" title="Practise every day" intro="Watching videos is step one. These help you actually remember it — and show your progress as you go." />
      <section className="mx-auto grid max-w-site grid-cols-1 gap-4 px-5 pb-28 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
        {items.map((it, i) => (
          <ColorCard key={it.href} theme={it.theme} href={it.href} icon={it.icon} word={it.word} index={i} className="min-h-[240px]">
            <span className="mt-auto font-display text-[30px] font-bold leading-tight">{it.title}</span>
            <span className="mt-2 text-[15px] text-white/80">{it.text}</span>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
              Open <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </ColorCard>
        ))}
      </section>
    </>
  );
}
