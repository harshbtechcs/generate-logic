export type Tone = "green" | "cyan" | "blue";

export const toneStyles: Record<Tone, { text: string; bg: string; border: string; glow: string }> = {
  green: {
    text: "text-green-300",
    bg: "bg-green-400/10",
    border: "border-green-400/35",
    glow: "rgba(74,222,128,0.45)",
  },
  cyan: {
    text: "text-cyan-300",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/35",
    glow: "rgba(34,211,238,0.45)",
  },
  blue: {
    text: "text-blue-300",
    bg: "bg-blue-400/10",
    border: "border-blue-400/35",
    glow: "rgba(96,165,250,0.45)",
  },
};

export type Technology = {
  slug: string; // also the logo file name: /public/logos/<slug>.svg
  name: string;
  short: string; // text badge shown until a logo file exists
  tag: string;
  tone: Tone;
  keywords: string[]; // used to match YouTube playlists to a category
};

export const technologies: Technology[] = [
  { slug: "aws", name: "AWS", short: "AWS", tag: "Cloud platform", tone: "blue", keywords: ["aws", "amazon web services", "ec2", "s3"] },
  { slug: "azure", name: "Microsoft Azure", short: "Az", tag: "Cloud platform", tone: "blue", keywords: ["azure"] },
  { slug: "gcp", name: "Google Cloud", short: "GCP", tag: "Cloud platform", tone: "blue", keywords: ["gcp", "google cloud"] },
  { slug: "docker", name: "Docker", short: "Dk", tag: "Containers", tone: "cyan", keywords: ["docker", "container"] },
  { slug: "kubernetes", name: "Kubernetes", short: "K8s", tag: "Orchestration", tone: "cyan", keywords: ["kubernetes", "k8s", "kubectl", "helm"] },
  { slug: "terraform", name: "Terraform", short: "TF", tag: "Infrastructure as Code", tone: "green", keywords: ["terraform", "iac"] },
  { slug: "ansible", name: "Ansible", short: "An", tag: "Configuration", tone: "green", keywords: ["ansible"] },
  { slug: "jenkins", name: "Jenkins", short: "Jk", tag: "Automation server", tone: "green", keywords: ["jenkins"] },
  { slug: "linux", name: "Linux", short: "$_", tag: "Administration", tone: "cyan", keywords: ["linux", "bash", "shell"] },
  { slug: "git", name: "Git & GitHub", short: "Git", tag: "Version control", tone: "cyan", keywords: ["git", "github"] },
  { slug: "cicd", name: "CI/CD", short: "CI", tag: "Pipelines", tone: "green", keywords: ["ci/cd", "cicd", "pipeline", "github actions"] },
  { slug: "networking", name: "Networking", short: "LB", tag: "Load balancing", tone: "blue", keywords: ["network", "load balanc", "dns", "vpc"] },
];

export const techBySlug = Object.fromEntries(technologies.map((t) => [t.slug, t])) as Record<string, Technology>;

export type Level = "Beginner" | "Intermediate" | "Advanced";

export const levelStyles: Record<Level, string> = {
  Beginner: "text-green-200 border-green-400/40",
  Intermediate: "text-cyan-200 border-cyan-400/40",
  Advanced: "text-blue-200 border-blue-400/40",
};

export const dockerModules: { title: string; level: Level }[] = [
  { title: "Introduction to Docker", level: "Beginner" },
  { title: "Docker Architecture", level: "Beginner" },
  { title: "Docker Installation", level: "Beginner" },
  { title: "Images and Containers", level: "Beginner" },
  { title: "Dockerfile", level: "Intermediate" },
  { title: "Docker Volumes", level: "Intermediate" },
  { title: "Docker Networking", level: "Intermediate" },
  { title: "Docker Compose", level: "Intermediate" },
  { title: "Container Security", level: "Advanced" },
  { title: "Docker in Production", level: "Advanced" },
];

/** Guess which technology a playlist belongs to from its title/description. */
export function matchTechnology(text: string): Technology | undefined {
  const t = text.toLowerCase();
  return technologies.find((tech) => tech.keywords.some((k) => t.includes(k)));
}
