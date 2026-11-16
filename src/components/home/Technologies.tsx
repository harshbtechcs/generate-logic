import Link from "next/link";
import { technologies } from "@/lib/data";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechBadge } from "@/components/ui/TechBadge";

export function Technologies() {
  return (
    <section id="paths" className="relative mx-auto max-w-site scroll-mt-24 px-5 pb-24 pt-4 sm:px-8">
      <SectionHeading
        kicker="01 / EXPLORE"
        title="Explore technologies"
        intro="Each technology has its own learning path — from first install to production."
      />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {technologies.map((t, i) => (
          <Reveal key={t.slug} delay={(i % 4) * 0.08}>
            <Link
              href={`/learn/${t.slug}`}
              className="gl-card flex items-center gap-4 rounded-2xl border border-slate-400/15 bg-white/[0.03] p-[18px]"
            >
              <TechBadge tech={t} />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-base font-semibold">{t.name}</span>
                <span className="text-[13px] text-text-faint">{t.tag}</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
