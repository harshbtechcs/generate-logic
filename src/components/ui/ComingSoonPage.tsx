import Link from "next/link";
import { PageHeader } from "./PageHeader";
import { Reveal } from "./Reveal";

/** Shared layout for sections that are planned but not built yet. */
export function ComingSoonPage({ kicker, title, text, word }: { kicker: string; title: string; text: string; word?: string }) {
  return (
    <>
      <PageHeader kicker={kicker} title={title} intro={text} word={word} />
      <Reveal className="mx-auto flex max-w-site flex-wrap gap-3 px-5 pb-32 sm:px-8">
        <Link href="/" className="gl-btn rounded-xl bg-brand-teal px-6 py-3.5 font-semibold text-ink-900">
          Back to home
        </Link>
        <Link href="/playlists" className="gl-btn rounded-xl border border-slate-400/30 px-6 py-3.5 font-medium">
          Browse playlists
        </Link>
      </Reveal>
    </>
  );
}
