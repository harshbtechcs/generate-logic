import { SectionHeading } from "@/components/ui/SectionHeading";
import { ColorCard } from "@/components/motion/ColorCard";
import type { IconName, ThemeName } from "@/lib/themes";

const reasons: { theme: ThemeName; icon: IconName; title: string; text: string }[] = [
  { theme: "linux", icon: "terminal", title: "Hands-on labs", text: "Every concept is shown on a real terminal, then you run it yourself." },
  { theme: "docker", icon: "map", title: "Structured paths", text: "Clear order from beginner to advanced, with prerequisites marked." },
  { theme: "aws", icon: "file", title: "Notes for every playlist", text: "Downloadable PDF notes linked to each lecture, for quick revision." },
  { theme: "terraform", icon: "rocket", title: "Real-world projects", text: "Deployable projects with source code on GitHub and step-by-step guides." },
];

export function WhySection() {
  return (
    <section className="relative mx-auto max-w-site px-5 pb-24 pt-6 sm:px-8">
      <SectionHeading kicker="04 / WHY GENERATE LOGIC" title="Learn by doing" intro="Built for people who learn best with their hands on the keyboard." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((r, i) => (
          <ColorCard key={r.title} theme={r.theme} icon={r.icon} word={String(i + 1).padStart(2, "0")} index={i} className="min-h-[260px]">
            <span className="mt-auto font-display text-[26px] font-bold leading-tight">{r.title}</span>
            <span className="mt-2 text-[15px] leading-relaxed text-white/80">{r.text}</span>
          </ColorCard>
        ))}
      </div>
    </section>
  );
}
