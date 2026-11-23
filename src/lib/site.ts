export const site = {
  name: "Generate Logic",
  tagline: "Learn. Build. Automate. Deploy.",
  description:
    "Practical Cloud and DevOps tutorials, hands-on projects, technical documentation and structured learning paths.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  owner: "Harsh Yadav",
  email: "generate.logiic@gmail.com",
  youtube: "https://www.youtube.com/@GENERATELOGIC",
  youtubeHandle: "@GENERATELOGIC",
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Playlists", href: "/playlists" },
  { label: "Practice", href: "/practice" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Notes", href: "/notes" },
  { label: "Projects", href: "/projects" },
  { label: "About Us", href: "/about" },
] as const;

/** Extra paths that highlight a nav item (e.g. /quiz lives under Practice). */
export const navAlso: Record<string, string[]> = { "/practice": ["/quiz", "/daily", "/terminal"] };
