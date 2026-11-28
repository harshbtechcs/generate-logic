import { SectionHeading } from "@/components/ui/SectionHeading";
import { ColorCard } from "@/components/motion/ColorCard";
import type { IconName, ThemeName } from "@/lib/themes";

const items: { theme: ThemeName; icon: IconName; title: string; text: string }[] = [
  { theme: "amber", icon: "file", title: "PDF notes", text: "Released as each lecture series completes." },
  { theme: "pink", icon: "rocket", title: "Project hub", text: "End-to-end DevOps projects with repos." },
  { theme: "cicd", icon: "terminal", title: "Command library", text: "Searchable commands with a copy button." },
];

export function ComingSoon() {
  return (
    <section id="soon" className="relative mx-auto max-w-site scroll-mt-24 px-5 pb-24 sm:px-8">
      <SectionHeading kicker="COMING SOON" title="Next up" intro="More is being built — these land on the site as soon as they're ready." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((it, i) => (
          <ColorCard key={it.title} theme={it.theme} icon={it.icon} word="SOON" index={i} className="min-h-[200px]">
            <span className="w-fit rounded-full bg-black/25 px-3 py-1 font-mono text-[11px] tracking-[0.2em]">COMING SOON</span>
            <span className="mt-auto font-display text-[26px] font-bold">{it.title}</span>
            <span className="mt-1 text-[15px] text-white/80">{it.text}</span>
          </ColorCard>
        ))}
      </div>
    </section>
  );
}
