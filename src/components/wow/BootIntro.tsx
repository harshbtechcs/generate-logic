/**
 * First-visit "boot" screen: a terminal starts the site, then the curtain slides away.
 * Pure CSS (no waiting for JavaScript). A tiny inline script hides it at once for
 * people who already saw it this session or prefer reduced motion, and lets a click
 * or any key skip it.
 */
const LINES: { t: string; cls?: string }[] = [
  { t: "$ docker run --rm generatelogic/website:latest", cls: "text-white" },
  { t: "Pulling layers…  linux ✓  git ✓  docker ✓  kubernetes ✓  terraform ✓", cls: "text-slate-400" },
  { t: "Starting 12 learning paths, 100+ quiz questions, 31 terminal missions", cls: "text-slate-400" },
  { t: "✔ Container is healthy — opening generatelogic.in", cls: "text-green-300" },
];

const SCRIPT = `(function(){try{var d=document.documentElement,b=document.getElementById('gl-boot');if(!b)return;
if(sessionStorage.getItem('gl-boot')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('gl-booted');return;}
sessionStorage.setItem('gl-boot','1');var s=function(){d.classList.add('gl-booted');removeEventListener('keydown',s)};
b.addEventListener('click',s);addEventListener('keydown',s);}catch(e){}})();`;

export function BootIntro() {
  return (
    <>
      <div id="gl-boot" aria-hidden="true" className="gl-boot fixed inset-0 z-[200] flex items-center justify-center bg-[#04070f] px-6">
        <div className="gl-boot-grid absolute inset-0 opacity-40" />
        <div className="relative w-full max-w-2xl">
          <div className="gl-boot-logo mb-8 flex items-center gap-3">
            <span className="h-3 w-3 animate-pulse rounded-full bg-brand-green shadow-[0_0_12px_#4ade80]" />
            <span className="font-display text-2xl font-black tracking-[0.12em] text-white">
              GENERATE <span className="text-brand-teal">LOGIC</span>
            </span>
          </div>
          <div className="font-mono text-[13px] leading-7 sm:text-[15px]">
            {LINES.map((l, i) => (
              <div key={i} className={`gl-boot-line ${l.cls ?? ""}`} style={{ animationDelay: `${0.25 + i * 0.38}s` }}>
                {l.t}
              </div>
            ))}
          </div>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="gl-boot-bar h-full rounded-full bg-gradient-to-r from-brand-green via-brand-cyan to-brand-blue" />
          </div>
          <p className="mt-4 font-mono text-[11px] tracking-[0.2em] text-slate-500">PRESS ANY KEY TO SKIP</p>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
    </>
  );
}
