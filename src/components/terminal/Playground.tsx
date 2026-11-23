"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Lightbulb, PartyPopper, RotateCcw, Sparkles, Target } from "lucide-react";
import { complete, displayPath, ERR, initialState, OK, run, WARN, type SimState } from "@/lib/terminal/sim";
import { TRACKS, type Track } from "@/lib/terminal/missions";
import { completeMissions } from "@/app/actions/engage";
import { cn } from "@/lib/cn";
import { Confetti } from "@/components/ui/Confetti";

type Line = { kind: "cmd" | "out" | "sys"; text: string; prompt?: string };

const STORAGE_KEY = "gl-terminal-done";

function readLocal(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function writeLocal(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* private mode — progress just isn't remembered */
  }
}

function promptFor(s: SimState) {
  const inRepo = s.git.root && (s.cwd === s.git.root || s.cwd.startsWith(s.git.root + "/"));
  return `student@generatelogic:${displayPath(s.cwd)}${inRepo ? ` (${s.git.branch})` : ""}$`;
}

const WELCOME: Line[] = [
  { kind: "sys", text: "Welcome to the Generate Logic Command Playground 🚀" },
  { kind: "sys", text: "This is a safe, simulated machine — nothing you type here can break anything." },
  { kind: "sys", text: "Type 'help' to see what you can try. Your current mission is shown next to the terminal." },
];

function OutputLine({ line }: { line: Line }) {
  if (line.kind === "cmd")
    return (
      <div className="whitespace-pre-wrap break-all">
        <span className="text-brand-green">{line.prompt}</span> <span className="text-slate-100">{line.text}</span>
      </div>
    );
  if (line.kind === "sys") return <div className="whitespace-pre-wrap text-brand-teal">{line.text}</div>;
  const first = line.text[0];
  const marker = first === ERR || first === OK || first === WARN ? first : null;
  const text = marker ? line.text.slice(1) : line.text;
  // Folders (ending in /) in blue, like a real ls.
  const parts = marker ? [text] : text.split(/(\S+\/)(?=\s|$)/);
  return (
    <div
      className={cn(
        "whitespace-pre-wrap break-words",
        marker === ERR && "text-red-300",
        marker === OK && "text-green-300",
        marker === WARN && "text-red-200/80",
        !marker && "text-slate-300",
      )}
    >
      {text
        ? parts.map((part, i) =>
            i % 2 === 1 ? (
              <span key={i} className="font-semibold text-blue-300">
                {part}
              </span>
            ) : (
              part
            ),
          )
        : "\u00a0"}
    </div>
  );
}

export function Playground({ signedIn, savedDone, startTool }: { signedIn: boolean; savedDone: string[]; startTool: Track["tool"] }) {
  const [sim, setSim] = useState<SimState>(initialState);
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [input, setInput] = useState("");
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const [tool, setTool] = useState<Track["tool"]>(startTool);
  const [done, setDone] = useState<Set<string>>(() => new Set(savedDone));
  const [celebrate, setCelebrate] = useState<{ title: string; learn: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [burst, setBurst] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Merge progress kept in this browser (e.g. done before signing in) and save it to the account.
  useEffect(() => {
    const local = readLocal();
    if (!local.length) return;
    setDone((d) => new Set([...d, ...local]));
    if (signedIn) {
      const missing = local.filter((id) => !savedDone.includes(id));
      if (missing.length) void completeMissions(missing);
    }
  }, [signedIn, savedDone]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  useEffect(() => setShowHint(false), [tool]);

  const track = TRACKS.find((t) => t.tool === tool)!;
  const current = track.missions.find((m) => !done.has(m.id));
  const doneInTrack = track.missions.filter((m) => done.has(m.id)).length;

  const markDone = useCallback(
    (ids: string[], titles: { title: string; learn: string }) => {
      setDone((d) => {
        const next = new Set([...d, ...ids]);
        writeLocal([...next]);
        return next;
      });
      setCelebrate(titles);
      setBurst((b) => b + 1);
      setShowHint(false);
      if (signedIn) void completeMissions(ids);
    },
    [signedIn],
  );

  function submit(cmd: string) {
    const prompt = promptFor(sim);
    const res = run(sim, cmd);
    setSim(res.state);
    setHistIdx(null);
    setInput("");
    setLines((l) => (res.clear ? [] : [...l, { kind: "cmd", text: cmd, prompt }, ...res.output.map((text) => ({ kind: "out" as const, text }))]));

    // Check the current mission of every track, so work done in another tab still counts.
    const finished: { id: string; title: string; learn: string }[] = [];
    for (const t of TRACKS) {
      const m = t.missions.find((x) => !done.has(x.id));
      if (m && m.check(res.state)) finished.push({ id: m.id, title: m.title, learn: m.learn });
    }
    if (finished.length) markDone(finished.map((f) => f.id), finished.find((f) => track.missions.some((m) => m.id === f.id)) ?? finished[0]!);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!sim.history.length) return;
      const i = histIdx === null ? sim.history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(i);
      setInput(sim.history[i]!);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === null) return;
      const i = histIdx + 1;
      if (i >= sim.history.length) {
        setHistIdx(null);
        setInput("");
      } else {
        setHistIdx(i);
        setInput(sim.history[i]!);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      setInput((v) => complete(sim, v));
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      setLines((l) => [...l, { kind: "cmd", text: `${input}^C`, prompt: promptFor(sim) }]);
      setInput("");
    }
  }

  function resetMachine() {
    setSim(initialState());
    setLines([...WELCOME, { kind: "sys", text: "Machine reset. Your finished missions are kept." }]);
    setInput("");
    inputRef.current?.focus();
  }

  const totalDone = useMemo(() => TRACKS.reduce((n, t) => n + t.missions.filter((m) => done.has(m.id)).length, 0), [done]);
  const totalMissions = TRACKS.reduce((n, t) => n + t.missions.length, 0);

  return (
    <div className="flex flex-col gap-5">
      <Confetti fire={burst} count={45} />
      <div role="tablist" aria-label="Choose a track" className="flex flex-wrap gap-2">
        {TRACKS.map((t) => {
          const n = t.missions.filter((m) => done.has(m.id)).length;
          return (
            <button
              key={t.tool}
              type="button"
              role="tab"
              aria-selected={tool === t.tool}
              onClick={() => setTool(t.tool)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                tool === t.tool ? "border-brand-teal bg-brand-teal/15 text-teal-50" : "border-slate-400/20 text-text-muted hover:border-slate-400/40 hover:text-text",
              )}
            >
              {n === t.missions.length && <Check size={14} className="text-brand-green" aria-hidden="true" />}
              {t.name}
              <span className="font-mono text-xs text-text-faint">
                {n}/{t.missions.length}
              </span>
            </button>
          );
        })}
        <span className="ml-auto self-center font-mono text-xs text-text-faint">
          {totalDone}/{totalMissions} missions{signedIn ? "" : " · sign in to save XP"}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[330px_1fr]">
        <aside className="flex flex-col gap-4">
          <div className="rounded-[18px] border border-slate-400/15 bg-white/[0.03] p-5">
            <h2 className="font-display text-xl font-semibold">{track.name} track</h2>
            <p className="mt-1 text-sm text-text-muted">{track.intro}</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-green via-brand-cyan to-brand-blue"
                animate={{ width: `${Math.round((doneInTrack / track.missions.length) * 100)}%` }}
              />
            </div>
          </div>

          {current ? (
            <motion.div key={current.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[18px] border border-brand-teal/40 bg-brand-teal/[0.06] p-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-teal">
                <Target size={14} aria-hidden="true" /> Mission {track.missions.indexOf(current) + 1} of {track.missions.length}
              </div>
              <h3 className="font-display text-lg font-semibold">{current.title}</h3>
              <p className="mt-1 text-[15px] text-text-muted">{current.goal}</p>
              {showHint ? (
                <button
                  type="button"
                  onClick={() => {
                    setInput(current.hint);
                    inputRef.current?.focus();
                  }}
                  className="mt-4 block w-full rounded-lg border border-slate-400/25 bg-ink-900/70 px-3 py-2 text-left font-mono text-sm text-amber-100 hover:border-amber-300/50"
                  title="Click to paste into the terminal"
                >
                  $ {current.hint}
                </button>
              ) : (
                <button type="button" onClick={() => setShowHint(true)} className="mt-4 inline-flex items-center gap-2 text-sm text-amber-200 hover:underline">
                  <Lightbulb size={15} aria-hidden="true" /> Show hint
                </button>
              )}
            </motion.div>
          ) : (
            <div className="rounded-[18px] border border-green-400/40 bg-green-400/[0.07] p-5">
              <PartyPopper size={26} className="mb-2 text-green-300" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold">{track.name} track complete!</h3>
              <p className="mt-1 text-sm text-text-muted">Now test your knowledge, or pick another track.</p>
              <Link href={`/quiz/${track.tool}`} className="gl-btn mt-4 inline-flex items-center gap-1 rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-ink-900">
                Take the {track.name} quiz <ChevronRight size={16} aria-hidden="true" />
              </Link>
            </div>
          )}

          <ol className="flex flex-col gap-1.5 rounded-[18px] border border-slate-400/15 p-3">
            {track.missions.map((m, i) => {
              const isDone = done.has(m.id);
              const isCur = m.id === current?.id;
              return (
                <li key={m.id} className={cn("flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm", isCur && "bg-white/[0.05]")}>
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                      isDone ? "border-green-400/60 bg-green-400/15 text-green-200" : isCur ? "border-brand-teal text-brand-teal" : "border-slate-400/25 text-text-faint",
                    )}
                  >
                    {isDone ? <Check size={13} aria-hidden="true" /> : i + 1}
                  </span>
                  <span className={isDone ? "text-text-muted line-through decoration-slate-500" : isCur ? "text-text" : "text-text-faint"}>{m.title}</span>
                </li>
              );
            })}
          </ol>
        </aside>

        <div className="relative min-w-0">
          <div className="overflow-hidden rounded-[18px] border border-slate-400/20 bg-[#05080f] shadow-[0_30px_80px_-30px_rgba(34,211,238,0.35)]">
            <div className="flex items-center gap-2 border-b border-slate-400/15 bg-white/[0.03] px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-300/80" />
              <span className="h-3 w-3 rounded-full bg-green-400/80" />
              <span className="ml-3 truncate font-mono text-xs text-text-faint">student@generatelogic: {displayPath(sim.cwd)}</span>
              <button type="button" onClick={resetMachine} className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-text-faint hover:bg-white/[0.06] hover:text-text">
                <RotateCcw size={13} aria-hidden="true" /> Reset machine
              </button>
            </div>
            <div
              ref={scrollRef}
              onClick={() => inputRef.current?.focus()}
              className="h-[460px] overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed sm:text-sm"
              role="log"
              aria-live="polite"
              aria-label="Terminal output"
            >
              {lines.map((l, i) => (
                <OutputLine key={i} line={l} />
              ))}
              <div className="flex items-center gap-2">
                <label htmlFor="term-input" className="shrink-0 whitespace-pre text-brand-green">
                  {promptFor(sim)}
                </label>
                <input
                  id="term-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  autoFocus
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent text-[16px] text-slate-100 caret-brand-teal outline-none sm:text-sm"
                  aria-label="Type a command and press Enter"
                />
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {[
              { label: "Tab", run: () => setInput((v) => complete(sim, v)) },
              { label: "↑", run: () => onKeyDown({ key: "ArrowUp", preventDefault() {} } as React.KeyboardEvent<HTMLInputElement>) },
              { label: "↓", run: () => onKeyDown({ key: "ArrowDown", preventDefault() {} } as React.KeyboardEvent<HTMLInputElement>) },
              { label: "clear", run: () => setLines([]) },
              { label: "help", run: () => submit("help") },
            ].map((k) => (
              <button
                key={k.label}
                type="button"
                onClick={() => {
                  k.run();
                  inputRef.current?.focus();
                }}
                className="rounded-md border border-slate-400/25 bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-text-muted hover:border-brand-teal/50 hover:text-text"
              >
                {k.label}
              </button>
            ))}
            <span className="ml-auto hidden text-xs text-text-faint sm:inline">↑/↓ history · Tab autocomplete · Ctrl+L clear · chain with &amp;&amp; · pipe with |</span>
          </div>

          <AnimatePresence>
            {celebrate && (
              <motion.div
                key={celebrate.title}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8 }}
                onAnimationComplete={() => setTimeout(() => setCelebrate((c) => (c?.title === celebrate.title ? null : c)), 4200)}
                className="absolute inset-x-4 top-14 z-10 flex items-start gap-3 rounded-xl border border-green-400/50 bg-ink-900/95 p-4 shadow-xl backdrop-blur"
                role="status"
              >
                <Sparkles size={22} className="mt-0.5 shrink-0 text-green-300" aria-hidden="true" />
                <div className="text-sm">
                  <div className="font-semibold text-green-100">
                    Mission complete: {celebrate.title} {signedIn ? "· +15 XP" : ""}
                  </div>
                  <div className="mt-0.5 text-text-muted">{celebrate.learn}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
