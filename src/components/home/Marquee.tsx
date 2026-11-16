import { technologies } from "@/lib/data";

const colors = ["text-text", "text-brand-teal", "text-text", "text-blue-300"];

/** Endless scrolling strip of technology names. Pauses on hover. */
export function Marquee() {
  const items = [...technologies, ...technologies];
  return (
    <div
      aria-hidden="true"
      className="marquee relative mb-[72px] overflow-hidden border-y border-slate-400/10 bg-slate-900/50 py-[18px] [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
    >
      <div className="anim-marquee flex w-max">
        {items.map((t, i) => (
          <span
            key={i}
            className={`flex items-center gap-[18px] whitespace-nowrap px-[22px] font-display text-[22px] font-semibold ${colors[i % 4]}`}
          >
            {t.name}
            <span className="block h-[7px] w-[7px] rounded-full bg-slate-700" />
          </span>
        ))}
      </div>
    </div>
  );
}
