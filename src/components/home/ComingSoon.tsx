import { Reveal } from "@/components/ui/Reveal";

const items = [
  { title: "PDF notes", text: "Released as each lecture series completes" },
  { title: "Project hub", text: "End-to-end DevOps projects with repos" },
  { title: "Command library", text: "Searchable commands with copy button" },
];

export function ComingSoon() {
  return (
    <section id="soon" className="relative mx-auto max-w-site scroll-mt-24 px-5 pb-24 sm:px-8">
      <Reveal
        variant="zoom"
        className="flex flex-wrap items-center gap-x-10 gap-y-7 rounded-[22px] border border-slate-400/15 bg-slate-900/55 p-9"
      >
        <div className="flex flex-[1_1_280px] flex-col gap-2.5">
          <Reveal as="span" variant="left" className="font-mono text-[13px] tracking-[0.16em] text-amber-300">
            COMING SOON
          </Reveal>
          <h2 className="font-display text-[30px] font-bold">More is being built</h2>
        </div>
        <div className="grid flex-[3_1_600px] grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {items.map((it, i) => (
            <Reveal
              key={it.title}
              delay={0.1 + i * 0.1}
              className="gl-card flex flex-col gap-1.5 rounded-[14px] border border-dashed border-slate-400/30 p-[18px]"
            >
              <span className="font-semibold">{it.title}</span>
              <span className="text-sm text-text-faint">{it.text}</span>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
