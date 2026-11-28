"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { technologies } from "@/lib/data";

type Cmd = { cmd: string; label: string; href: string; group: string };

const BASE: Cmd[] = [
  { cmd: "cd ~", label: "Home", href: "/", group: "Pages" },
  { cmd: "cd /roadmap", label: "DevOps Roadmap", href: "/roadmap", group: "Pages" },
  { cmd: "cd /playlists", label: "All playlists", href: "/playlists", group: "Pages" },
  { cmd: "daily", label: "Today's daily challenge", href: "/daily", group: "Practice" },
  { cmd: "quiz", label: "Pick a quiz", href: "/quiz", group: "Practice" },
  { cmd: "quiz mix", label: "DevOps mix quiz", href: "/quiz/mix", group: "Practice" },
  { cmd: "./terminal", label: "Command Playground", href: "/terminal", group: "Practice" },
  { cmd: "top", label: "Leaderboard", href: "/leaderboard", group: "Practice" },
  { cmd: "cd /dashboard", label: "My dashboard", href: "/dashboard", group: "Me" },
  { cmd: "settings", label: "Account settings", href: "/dashboard/settings", group: "Me" },
  { cmd: "cd /notes", label: "Notes", href: "/notes", group: "Pages" },
  { cmd: "cd /projects", label: "Projects", href: "/projects", group: "Pages" },
  { cmd: "whoami", label: "About Generate Logic", href: "/about", group: "Pages" },
];

const ALL: Cmd[] = [
  ...BASE,
  ...technologies.flatMap((t) => [
    { cmd: `learn ${t.slug}`, label: `${t.name} learning path`, href: `/learn/${t.slug}`, group: "Learn" },
    { cmd: `quiz ${t.slug}`, label: `${t.name} quiz`, href: `/quiz/${t.slug}`, group: "Quiz" },
  ]),
];

function score(c: Cmd, q: string) {
  if (!q) return 1;
  const hay = `${c.cmd} ${c.label}`.toLowerCase();
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return words.every((w) => hay.includes(w)) ? (c.cmd.toLowerCase().startsWith(q.toLowerCase()) ? 3 : 2) : 0;
}

/** Ctrl/⌘+K (or "/") opens a terminal-style launcher to jump anywhere on the site. */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest?.("input, textarea, [contenteditable=true]");
      if ((e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("gl:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("gl:open-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const results = useMemo(
    () =>
      ALL.map((c) => ({ c, s: score(c, q) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 9)
        .map((r) => r.c),
    [q],
  );

  function go(c: Cmd | undefined) {
    if (!c) return;
    setOpen(false);
    router.push(c.href);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[180] flex items-start justify-center bg-black/60 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Jump to a page"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-brand-teal/30 bg-[#05080f] shadow-[0_40px_120px_-20px_rgba(34,211,238,0.45)]"
          >
            <div className="flex items-center gap-2 border-b border-slate-400/15 bg-white/[0.03] px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-300/80" />
              <span className="h-3 w-3 rounded-full bg-green-400/80" />
              <span className="ml-3 font-mono text-xs text-text-faint">generatelogic — jump anywhere</span>
              <kbd className="ml-auto rounded border border-slate-400/30 px-1.5 font-mono text-[10px] text-text-faint">ESC</kbd>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 font-mono">
              <span className="text-brand-green">student@gl:~$</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSel(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSel((s) => Math.min(s + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSel((s) => Math.max(s - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    go(results[sel]);
                  }
                }}
                placeholder="type: docker, quiz aws, daily, roadmap…"
                aria-label="Search pages"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-white caret-brand-teal outline-none placeholder:text-slate-600"
              />
            </div>
            <ul className="max-h-[50vh] overflow-y-auto border-t border-slate-400/10 p-2" role="listbox">
              {results.length === 0 && <li className="px-3 py-6 text-center font-mono text-sm text-red-300">command not found: {q}</li>}
              {results.map((c, i) => (
                <li key={c.href + c.cmd} role="option" aria-selected={i === sel}>
                  <button
                    type="button"
                    onMouseEnter={() => setSel(i)}
                    onClick={() => go(c)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${i === sel ? "bg-brand-teal/15" : ""}`}
                  >
                    <span className={`font-mono text-sm ${i === sel ? "text-brand-teal" : "text-slate-400"}`}>{i === sel ? "›" : " "} {c.cmd}</span>
                    <span className="ml-auto text-sm text-text-muted">{c.label}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-slate-400/10 px-4 py-2 font-mono text-[11px] text-text-faint">
              <span>↑↓ choose · ↵ open</span>
              <span>tip: type &quot;sudo&quot; anywhere on the site 👀</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
