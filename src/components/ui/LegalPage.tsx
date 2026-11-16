import { PageHeader } from "./PageHeader";

/** Readable long-form layout for policy pages. */
export function LegalPage({
  kicker,
  title,
  updated,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader kicker={kicker} title={title} intro={intro} />
      <article
        className="mx-auto max-w-3xl px-5 pb-28 sm:px-8
          [&_a]:text-brand-teal [&_a:hover]:underline
          [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-text
          [&_li]:mb-2 [&_p]:mb-4 [&_strong]:text-text
          [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6
          text-[16px] leading-relaxed text-text-muted"
      >
        <p className="font-mono text-sm text-text-faint">Last updated: {updated}</p>
        {children}
      </article>
    </>
  );
}
