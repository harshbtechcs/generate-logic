/**
 * Original illustrations for the tool showcase (not the projects' trademarked logos).
 * Each one draws in a 400×400 box using the slide's accent colours.
 */

type ArtProps = { a: string; b: string; c: string };

/** Isometric cube: top, left and right faces. */
function Cube({ x, y, s, a, b, c, opacity = 1 }: { x: number; y: number; s: number; a: string; b: string; c: string; opacity?: number }) {
  const h = s * 0.5;
  return (
    <g opacity={opacity}>
      <polygon points={`${x},${y} ${x + s},${y + h} ${x},${y + s} ${x - s},${y + h}`} fill={a} />
      <polygon points={`${x - s},${y + h} ${x},${y + s} ${x},${y + s * 2} ${x - s},${y + s * 1.5}`} fill={b} />
      <polygon points={`${x + s},${y + h} ${x},${y + s} ${x},${y + s * 2} ${x + s},${y + s * 1.5}`} fill={c} />
      <polyline points={`${x - s},${y + h} ${x},${y + s} ${x + s},${y + h}`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      {/* container ribs */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={x - s + s * t} y1={y + h + h * t} x2={x - s + s * t} y2={y + s * 1.5 + h * t - h * 0} stroke="rgba(0,0,0,0.18)" strokeWidth="2" />
      ))}
    </g>
  );
}

export function DockerArt({ a, b, c }: ArtProps) {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <ellipse cx="200" cy="330" rx="150" ry="34" fill="rgba(0,0,0,0.28)" />
      {/* platform */}
      <polygon points="200,210 345,282 200,354 55,282" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      <Cube x={140} y={196} s={58} a={a} b={b} c={c} />
      <Cube x={258} y={196} s={58} a={a} b={b} c={c} />
      <Cube x={200} y={226} s={58} a={a} b={b} c={c} />
      <Cube x={200} y={108} s={58} a="#ffffff" b={a} c={b} />
      <circle cx="320" cy="96" r="7" fill="#fff" opacity="0.8" />
      <circle cx="80" cy="140" r="4" fill="#fff" opacity="0.5" />
    </svg>
  );
}

function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const t = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + r * Math.cos(t)},${cy + r * Math.sin(t)}`;
  }).join(" ");
}

export function KubernetesArt({ a, b, c }: ArtProps) {
  const ring = Array.from({ length: 6 }, (_, i) => {
    const t = (Math.PI / 3) * i;
    return { x: 200 + 118 * Math.cos(t), y: 200 + 118 * Math.sin(t) };
  });
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <circle cx="200" cy="200" r="168" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeDasharray="6 10" />
      {ring.map((p, i) => (
        <line key={`l${i}`} x1="200" y1="200" x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
      ))}
      {ring.map((p, i) => (
        <g key={i}>
          <polygon points={hexPoints(p.x, p.y, 40)} fill={i % 2 ? b : a} stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
          <polygon points={hexPoints(p.x, p.y, 18)} fill="rgba(255,255,255,0.85)" />
        </g>
      ))}
      <polygon points={hexPoints(200, 200, 62)} fill={c} stroke="#fff" strokeWidth="3" />
      {/* control plane: a small 3×3 grid of nodes */}
      {[-18, 0, 18].flatMap((dx) => [-18, 0, 18].map((dy) => <circle key={`${dx}${dy}`} cx={200 + dx} cy={200 + dy} r={dx === 0 && dy === 0 ? 8 : 5} fill="#fff" opacity={dx === 0 && dy === 0 ? 1 : 0.75} />))}
    </svg>
  );
}

export function TerraformArt({ a, b, c }: ArtProps) {
  const slab = (y: number, fill: string, op: number) => (
    <g opacity={op}>
      <polygon points={`200,${y} 330,${y + 62} 200,${y + 124} 70,${y + 62}`} fill={fill} />
      <polygon points={`70,${y + 62} 200,${y + 124} 200,${y + 140} 70,${y + 78}`} fill="rgba(0,0,0,0.25)" />
      <polygon points={`330,${y + 62} 200,${y + 124} 200,${y + 140} 330,${y + 78}`} fill="rgba(0,0,0,0.4)" />
      <polygon points={`200,${y} 330,${y + 62} 200,${y + 124} 70,${y + 62}`} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
    </g>
  );
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <ellipse cx="200" cy="350" rx="140" ry="26" fill="rgba(0,0,0,0.28)" />
      {slab(206, b, 0.9)}
      {slab(138, a, 0.95)}
      {slab(70, c, 1)}
      {/* resources being applied */}
      <Cube x={168} y={72} s={26} a="#fff" b={a} c={b} />
      <Cube x={236} y={96} s={22} a="#fff" b={a} c={b} />
      <Cube x={190} y={112} s={18} a="#fff" b={a} c={b} />
      <path d="M 300 40 l 0 30 m -8 -8 l 8 8 l 8 -8" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
}

export function AwsArt({ a, b, c }: ArtProps) {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <path d="M110 190 a62 62 0 0 1 22-118 a82 82 0 0 1 150 10 a56 56 0 0 1 12 108 z" fill={a} stroke="#fff" strokeWidth="4" />
      {/* upload arrow */}
      <circle cx="200" cy="138" r="30" fill="rgba(255,255,255,0.22)" />
      <path d="M200 156 v-34 m-14 14 l14 -14 l14 14" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {[110, 200, 290].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="196" x2={x} y2="236" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeDasharray="5 6" />
          <rect x={x - 42} y="236" width="84" height="104" rx="12" fill={i === 1 ? c : b} stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x={x - 30} y={252 + r * 28} width="60" height="16" rx="4" fill="rgba(0,0,0,0.25)" />
              <circle cx={x + 20} cy={260 + r * 28} r="3.5" fill={r === 0 ? "#86efac" : "#fff"} />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

export function LinuxArt({ a, b, c }: ArtProps) {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <g transform="rotate(-6 200 200)">
        <rect x="50" y="80" width="300" height="230" rx="20" fill="#0b0f19" stroke={a} strokeWidth="4" />
        <rect x="50" y="80" width="300" height="38" rx="20" fill={b} />
        <rect x="50" y="100" width="300" height="18" fill={b} />
        {["#f87171", "#fbbf24", "#4ade80"].map((f, i) => (
          <circle key={f} cx={78 + i * 22} cy="99" r="7" fill={f} />
        ))}
        <text x="74" y="160" fontFamily="monospace" fontSize="22" fill={a}>
          $ <tspan fill="#fff">uname -a</tspan>
        </text>
        <text x="74" y="192" fontFamily="monospace" fontSize="18" fill="rgba(255,255,255,0.6)">
          Linux devops 6.8 x86_64
        </text>
        <text x="74" y="230" fontFamily="monospace" fontSize="22" fill={a}>
          $ <tspan fill="#fff">ls -la</tspan>
        </text>
        <text x="74" y="262" fontFamily="monospace" fontSize="18" fill={c}>
          app/ logs/ deploy.sh
        </text>
        <rect x="74" y="276" width="14" height="22" fill={a}>
          <animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  );
}

export function GitArt({ a, b, c }: ArtProps) {
  const main = [70, 140, 210, 280, 340];
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <line x1="40" y1="250" x2="370" y2="250" stroke="rgba(255,255,255,0.55)" strokeWidth="10" strokeLinecap="round" />
      <path d="M140 250 C 170 250, 170 130, 210 130 L 250 130 C 290 130, 290 250, 320 250" stroke={b} strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M210 250 C 230 250, 230 340, 260 340 L 290 340" stroke={c} strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.9" />
      {main.map((x) => (
        <circle key={x} cx={x} cy="250" r="20" fill={a} stroke="#fff" strokeWidth="5" />
      ))}
      {[210, 250].map((x) => (
        <circle key={x} cx={x} cy="130" r="18" fill={b} stroke="#fff" strokeWidth="5" />
      ))}
      <circle cx="290" cy="340" r="15" fill={c} stroke="#fff" strokeWidth="4" />
      <rect x="196" y="72" width="108" height="30" rx="15" fill="rgba(0,0,0,0.35)" />
      <text x="250" y="93" textAnchor="middle" fontFamily="monospace" fontSize="16" fill="#fff">
        feature
      </text>
      <rect x="40" y="200" width="70" height="28" rx="14" fill="rgba(0,0,0,0.35)" />
      <text x="75" y="220" textAnchor="middle" fontFamily="monospace" fontSize="15" fill="#fff">
        main
      </text>
    </svg>
  );
}
