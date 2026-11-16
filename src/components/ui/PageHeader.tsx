import { Reveal } from "./Reveal";

/** Title block used at the top of inner pages. */
export function PageHeader({ kicker, title, intro }: { kicker: string; title: string; intro?: string }) {
  return (
    <header className="relative mx-auto max-w-site px-5 pb-12 pt-16 sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(34,211,238,0.12),transparent)]"
      />
      <div className="relative flex flex-col gap-4">
        <Reveal as="span" variant="left" className="kicker">
          {kicker}
        </Reveal>
        <Reveal as="h1" variant="blur" delay={0.1} className="font-display text-[40px] font-bold leading-tight tracking-tight sm:text-[54px]">
          {title}
        </Reveal>
        {intro && (
          <Reveal as="p" delay={0.2} className="max-w-[640px] text-lg leading-relaxed text-text-muted">
            {intro}
          </Reveal>
        )}
      </div>
    </header>
  );
}
