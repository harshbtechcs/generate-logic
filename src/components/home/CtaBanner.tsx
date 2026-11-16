import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export function CtaBanner() {
  return (
    <section className="relative mx-auto max-w-site px-5 pb-[104px] sm:px-8">
      <Reveal
        variant="zoom"
        className="relative flex flex-wrap items-center justify-between gap-7 overflow-hidden rounded-[26px] border border-brand-teal/30 bg-ink-800 px-8 py-14 sm:px-12"
      >
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(74,222,128,0.18),transparent)]"
        />
        <div className="relative flex max-w-[620px] flex-col gap-3">
          <Reveal as="h2" variant="blur" delay={0.1} className="font-display text-[30px] font-bold leading-tight sm:text-[38px]">
            Your own learning dashboard — free
          </Reveal>
          <p className="text-[17px] leading-relaxed text-text-muted">
            Create an account to track lesson progress, save playlists, bookmark notes and keep a learning streak.
          </p>
        </div>
        <div className="relative flex flex-wrap gap-3">
          <Link href="/sign-up" className="gl-btn gl-glow rounded-xl bg-brand-teal px-[26px] py-4 font-semibold text-ink-900">
            Create free account
          </Link>
          <Link href="/sign-in" className="gl-btn rounded-xl border border-slate-400/30 px-6 py-[15px] font-medium">
            Sign in
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
