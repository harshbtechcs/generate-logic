import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

const linkCls = "text-slate-300 transition-colors hover:text-brand-teal";

export function Footer() {
  return (
    <footer id="about" className="relative border-t border-slate-400/15 bg-ink-950">
      <div className="mx-auto flex max-w-site flex-wrap gap-12 px-5 pb-8 pt-16 sm:px-8">
        <Reveal className="flex flex-[2_1_320px] flex-col gap-[18px]">
          <div className="flex items-center gap-3.5">
            <Image src="/logo-full.png" alt="Generate Logic" width={72} height={72} className="rounded-full" />
            <span className="font-display text-xl font-bold tracking-[0.06em]">GENERATE LOGIC</span>
          </div>
          <p className="max-w-[420px] text-[15px] leading-relaxed text-text-muted">
            Practical Cloud and DevOps learning — Docker, Kubernetes, Terraform, Ansible, Jenkins and AWS, Azure
            and GCP — with hands-on labs and real projects. Created by {site.owner}.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-[1_1_160px] flex-col gap-3 text-[15px]">
          <span className="text-[13px] font-semibold tracking-[0.12em] text-slate-500">LEARN</span>
          <Link href="/roadmap" className={linkCls}>DevOps Roadmap</Link>
          <Link href="/#paths" className={linkCls}>Learning Paths</Link>
          <Link href="/playlists" className={linkCls}>Playlists</Link>
          <Link href="/notes" className={linkCls}>Notes</Link>
          <Link href="/projects" className={linkCls}>Projects</Link>
          <Link href="/daily" className={linkCls}>Daily Challenge</Link>
          <Link href="/quiz" className={linkCls}>Quizzes</Link>
          <Link href="/terminal" className={linkCls}>Command Playground</Link>
          <Link href="/blog" className={linkCls}>Blog</Link>
        </Reveal>

        <Reveal delay={0.2} className="flex flex-[1_1_220px] flex-col gap-3 text-[15px]">
          <span className="text-[13px] font-semibold tracking-[0.12em] text-slate-500">CONTACT</span>
          <span className="font-medium text-text">{site.owner}</span>
          <a href={`mailto:${site.email}`} className={linkCls}>{site.email}</a>
          <a href={site.youtube} className={linkCls} target="_blank" rel="noopener noreferrer">
            YouTube · {site.youtubeHandle}
          </a>
        </Reveal>
      </div>

      {/* giant wordmark, like the end card in the video */}
      <div aria-hidden="true" className="relative overflow-hidden px-2 pt-4">
        <span className="block select-none whitespace-nowrap bg-gradient-to-r from-brand-green via-brand-cyan to-brand-blue bg-clip-text text-center font-display text-[14.5vw] font-black leading-[0.8] tracking-tighter text-transparent opacity-90">
          GENERATE LOGIC
        </span>
      </div>

      <div className="mx-auto flex max-w-site flex-wrap justify-between gap-3 border-t border-slate-400/10 px-5 pb-9 pt-[22px] text-sm text-text-faint sm:px-8">
        <span>© {new Date().getFullYear()} {site.name}. {site.tagline}</span>
        <span className="flex gap-5">
          <Link href="/privacy" className="text-text-muted hover:text-brand-teal">Privacy Policy</Link>
          <Link href="/terms" className="text-text-muted hover:text-brand-teal">Terms &amp; Conditions</Link>
        </span>
      </div>
    </footer>
  );
}
