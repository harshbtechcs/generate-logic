const ROW_A = ["DOCKER", "KUBERNETES", "TERRAFORM", "AWS", "LINUX", "GIT"];
const ROW_B = ["ANSIBLE", "JENKINS", "CI/CD", "NETWORKING", "AZURE", "GCP"];
const TONES = ["text-[#7cc4ff]", "text-[#a5b4fc]", "text-[#c4b5fd]", "text-[#fdba74]", "text-[#86efac]", "text-[#fca5a5]"];

function Row({ words, reverse }: { words: string[]; reverse?: boolean }) {
  const items = [...words, ...words];
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
      <div className={`flex w-max ${reverse ? "anim-marquee-rev" : "anim-marquee-slow"}`}>
        {items.map((w, i) => (
          <span key={i} className="flex items-center whitespace-nowrap font-display text-[64px] font-black leading-none tracking-tight sm:text-[96px] lg:text-[128px]">
            <span className={i % 2 ? "text-outline" : TONES[i % TONES.length]}>{w}</span>
            <span className="mx-6 text-[0.4em] text-brand-teal sm:mx-10">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Two rows of giant tool names scrolling in opposite directions. */
export function BigMarquee() {
  return (
    <div aria-hidden="true" className="relative mb-[72px] flex select-none flex-col gap-2 overflow-hidden py-6">
      <Row words={ROW_A} />
      <Row words={ROW_B} reverse />
    </div>
  );
}
