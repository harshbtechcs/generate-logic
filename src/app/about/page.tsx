import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";
import { ColorCard } from "@/components/motion/ColorCard";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <>
      <PageHeader
        kicker="ABOUT US" word="ABOUT"
        title="About Generate Logic"
        intro="Generate Logic teaches Cloud and DevOps the practical way — CI/CD pipelines, containers, infrastructure automation, monitoring and cloud deployments, with hands-on labs and real projects."
      />
      <section className="mx-auto flex max-w-site flex-wrap items-center gap-10 px-5 pb-16 sm:px-8">
        <Reveal variant="zoom">
          <Image src="/logo-full.png" alt="Generate Logic logo" width={220} height={220} className="rounded-full" />
        </Reveal>
        <Reveal delay={0.1} className="flex max-w-xl flex-col gap-4">
          <h2 className="font-display text-2xl font-semibold">Created by {site.owner}</h2>
          <p className="leading-relaxed text-text-muted">
            The YouTube channel covers Docker, Kubernetes, Jenkins, Terraform, Ansible and the major cloud platforms —
            AWS, Azure and GCP. This website brings those lessons together into structured learning paths with notes
            and projects.
          </p>
          <p className="text-text-muted">
            Contact:{" "}
            <a className="text-brand-teal hover:underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
        </Reveal>
      </section>
      <section className="mx-auto grid max-w-site grid-cols-1 gap-4 px-5 pb-28 sm:px-8 md:grid-cols-3">
        <ColorCard theme="red" icon="play" word="YT" index={0} href={site.youtube} className="min-h-[220px]">
          <span className="mt-auto font-display text-[26px] font-bold">YouTube channel</span>
          <span className="mt-1 text-white/80">{site.youtubeHandle} — Cloud &amp; DevOps in Hindi</span>
        </ColorCard>
        <ColorCard theme="docker" icon="layers" word="OPS" index={1} href="/#paths" className="min-h-[220px]">
          <span className="mt-auto font-display text-[26px] font-bold">What we teach</span>
          <span className="mt-1 text-white/80">Docker, Kubernetes, Terraform, Ansible, Jenkins, AWS, Azure and GCP</span>
        </ColorCard>
        <ColorCard theme="green" icon="sparkles" word="HI" index={2} href={`mailto:${site.email}`} className="min-h-[220px]">
          <span className="mt-auto font-display text-[26px] font-bold">Say hello</span>
          <span className="mt-1 break-all text-white/80">{site.email}</span>
        </ColorCard>
      </section>
    </>
  );
}
