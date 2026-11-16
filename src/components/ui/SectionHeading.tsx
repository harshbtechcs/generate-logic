import { Reveal } from "./Reveal";

type Props = {
  kicker: string;
  title: string;
  intro?: string;
  aside?: React.ReactNode;
};

/** Kicker label + big heading (+ optional intro text or element on the right). */
export function SectionHeading({ kicker, title, intro, aside }: Props) {
  return (
    <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-3">
        <Reveal as="span" variant="left" className="kicker">
          {kicker}
        </Reveal>
        <Reveal as="h2" variant="blur" delay={0.1} className="font-display text-[34px] font-bold tracking-tight sm:text-[42px]">
          {title}
        </Reveal>
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
