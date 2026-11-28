import { ArrowUpRight } from "lucide-react";
import { technologies } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ColorCard } from "@/components/motion/ColorCard";
import { THEMES, themeForTech } from "@/lib/themes";

/** "THE STACK" — every technology as a bold colour card. */
export function Technologies() {
  return (
    <section id="paths" className="relative mx-auto max-w-site scroll-mt-24 px-5 pb-24 pt-4 sm:px-8">
      <SectionHeading kicker="01 / EXPLORE" title="The Stack" intro="Each technology has its own learning path — from first install to production. Pick one and start." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {technologies.map((t, i) => {
          const theme = themeForTech(t.slug);
          return (
            <ColorCard key={t.slug} theme={theme} href={`/learn/${t.slug}`} word={t.short.toUpperCase()} icon={THEMES[theme].icons[0]} index={i} className="min-h-[210px]">
              <span className="font-mono text-xs tracking-[0.2em] text-white/70">{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-auto font-display text-[28px] font-bold leading-tight">{t.name}</span>
              <span className="mt-1 text-sm text-white/75">{t.tag}</span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                Start the path <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </ColorCard>
          );
        })}
      </div>
    </section>
  );
}
