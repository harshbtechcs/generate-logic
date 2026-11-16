import { FileDown, GitFork, ListOrdered, SquareTerminal } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const reasons = [
  { icon: SquareTerminal, title: "Hands-on labs", text: "Every concept is shown on a real terminal, then you run it yourself." },
  { icon: ListOrdered, title: "Structured paths", text: "Clear order from beginner to advanced, with prerequisites marked." },
  { icon: FileDown, title: "Notes for every playlist", text: "Downloadable PDF notes linked to each lecture, for quick revision." },
  { icon: GitFork, title: "Real-world projects", text: "Deployable projects with source code on GitHub and step-by-step guides." },
];

export function WhySection() {
  return (
    <section className="relative mx-auto max-w-site px-5 pb-24 pt-6 sm:px-8">
      <SectionHeading kicker="04 / WHY GENERATE LOGIC" title="Built for people who learn by doing" />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
        {reasons.map(({ icon: Icon, title, text }, i) => (
          <Reveal
            key={title}
            delay={i * 0.1}
            className="gl-card flex flex-col gap-3.5 rounded-[18px] border border-slate-400/15 bg-white/[0.03] p-[26px]"
          >
            <Icon className="gl-ico text-brand-teal" size={28} strokeWidth={1.8} aria-hidden="true" />
            <h3 className="font-display text-xl font-semibold">{title}</h3>
            <p className="text-[15px] leading-relaxed text-text-muted">{text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
