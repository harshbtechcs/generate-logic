import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <>
      <PageHeader
        kicker="ABOUT US" word="ABOUT"
        title="About Generate Logic"
        intro="Generate Logic teaches Cloud and DevOps the practical way — CI/CD pipelines, containers, infrastructure automation, monitoring and cloud deployments, with hands-on labs and real projects."
      />
      <section className="mx-auto flex max-w-site flex-wrap items-center gap-10 px-5 pb-28 sm:px-8">
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
    </>
  );
}
