import { Reveal } from "./Reveal";
import { LetterReveal } from "@/components/motion/AnimatedHeader";

type Props = {
  kicker: string;
  title: string;
  intro?: string;
  aside?: React.ReactNode;
};

/** Kicker label + big heading (+ optional intro text or element on the right). */
export function SectionHeading({ kicker, title, intro, aside }: Props) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div className="flex flex-col gap-3">
        <Reveal as="span" variant="left" className="kicker">
          {kicker}
        </Reveal>
        <h2 className="font-display text-[40px] font-black uppercase leading-[0.95] tracking-tighter sm:text-[60px] lg:text-[72px]">
          <LetterReveal text={title} delay={0.05} onView />
        </h2>
      </div>
      {intro && (
        <Reveal as="p" delay={0.2} className="max-w-[420px] text-base leading-relaxed text-text-muted">
          {intro}
        </Reveal>
      )}
      {aside && (
        <Reveal variant="right" delay={0.2}>
          {aside}
        </Reveal>
      )}
    </div>
  );
}
